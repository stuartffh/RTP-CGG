import os
import urllib3
from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit
from flask import send_file, abort
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    verify_jwt_in_request,
)
from werkzeug.security import generate_password_hash, check_password_hash

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
import requests
from google.protobuf import message_factory
from google.protobuf.descriptor_pb2 import FileDescriptorProto
from google.protobuf.descriptor_pool import DescriptorPool
from google.protobuf.json_format import MessageToDict

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "changeme")

socketio = SocketIO(app, cors_allowed_origins="*")
db = SQLAlchemy(app)
jwt = JWTManager(app)

DEBUG_REQUESTS = os.environ.get("DEBUG_REQUESTS", "false").lower() in (
    "1",
    "true",
    "yes",
)

# Permite personalizar a verificação SSL via variável de ambiente.
# A verificação é habilitada por padrão e só é desativada quando
# `VERIFY_SSL=false` é definido explicitamente.
VERIFY_SSL = os.environ.get("VERIFY_SSL", "true").lower() not in (
    "false",
    "0",
    "no",
)

url = "https://cgg.bet.br/casinogo/widgets/v2/live-rtp"
headers = {
    "accept": "application/x-protobuf",
    "content-type": "application/x-protobuf",
    "x-language-iso": "pt-BR",
    "origin": "https://cgg.bet.br",
    "referer": "https://cgg.bet.br/pt-BR/casinos/casino/lobby",
}
data = b"\x08\x01\x10\x02"
data_weekly = b"\x08\x02\x10\x02"

IMAGE_CACHE_DIR = "image_cache"
os.makedirs(IMAGE_CACHE_DIR, exist_ok=True)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    ip_liberado = db.Column(db.String(200))

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


with app.app_context():
    db.create_all()
    admin_user = os.environ.get("ADMIN_USERNAME", "admin")
    admin_pass = os.environ.get("ADMIN_PASSWORD", "admin")
    if not User.query.filter_by(username=admin_user).first():
        user = User(username=admin_user)
        user.set_password(admin_pass)
        db.session.add(user)
        db.session.commit()


def get_protobuf_message():
    proto_schema = FileDescriptorProto()
    proto_schema.name = "rtp.proto"
    proto_schema.package = "rtp"

    game = proto_schema.message_type.add()
    game.name = "Game"

    game.field.add(name="id", number=1, type=3)
    game.field.add(name="name", number=2, type=9)
    game_provider = game.nested_type.add()
    game_provider.name = "Provider"
    game_provider.field.add(name="name", number=2, type=9)
    game_provider.field.add(name="slug", number=5, type=9)

    game.field.add(name="provider", number=3, type=11, type_name=".rtp.Game.Provider")
    game.field.add(name="image", number=4, type=9)
    game.field.add(name="rtp", number=5, type=5)
    game.field.add(name="extra", number=6, type=4)

    response = proto_schema.message_type.add()
    response.name = "Response"
    response.field.add(name="games", number=2, type=11, type_name=".rtp.Game", label=3)

    pool = DescriptorPool()
    file_desc = pool.Add(proto_schema)
    response_desc = file_desc.message_types_by_name["Response"]

    return message_factory.GetMessageClass(response_desc)


ProtobufMessage = get_protobuf_message()

latest_games = []


def decode_signed(value):
    if value > (1 << 63):
        value -= 1 << 64
    return value


def prioritize_games(games):
    sorted_games = sorted(games, key=lambda g: g.get("extra", 0))
    for game in sorted_games:
        extra_val = game.get("extra", 0)
        if extra_val <= -200:
            game["prioridade"] = "🔥 Alta prioridade"
        elif extra_val < 0:
            game["prioridade"] = "⚠️ Média prioridade"
        else:
            game["prioridade"] = "✅ Neutra ou positiva"
    return sorted_games


def fetch_games_data():
    if DEBUG_REQUESTS:
        print("\n[DEBUG] >>> Enviando Requisição <<<")
        print(f"[DEBUG] URL: {url}")
        print(f"[DEBUG] Headers: {headers}")
        print(f"[DEBUG] Data (bytes): {data}")
        print(f"[DEBUG] SSL Verify: {VERIFY_SSL}")

    try:
        response = requests.post(
            url, headers=headers, data=data, verify=VERIFY_SSL, timeout=10
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        if DEBUG_REQUESTS:
            print("[DEBUG] Erro ao buscar jogos diários")
            print(exc)
        raise

    if DEBUG_REQUESTS:
        print("\n[DEBUG] >>> Enviando Requisição Semanal <<<")
        print(f"[DEBUG] Data Semanal (bytes): {data_weekly}")

    try:
        response_weekly = requests.post(
            url, headers=headers, data=data_weekly, verify=VERIFY_SSL, timeout=10
        )
        response_weekly.raise_for_status()
    except requests.RequestException as exc:
        if DEBUG_REQUESTS:
            print("[DEBUG] Erro ao buscar jogos semanais")
            print(exc)
        raise

    if DEBUG_REQUESTS:
        print("\n[DEBUG] <<< Recebendo Resposta >>>")
        print(f"[DEBUG] Status Code: {response.status_code}")
        print(f"[DEBUG] Response Content (raw bytes): {response.content}\n")
        print("\n[DEBUG] <<< Recebendo Resposta Semanal >>>")
        print(f"[DEBUG] Status Code: {response_weekly.status_code}")
        print(f"[DEBUG] Response Content (raw bytes): {response_weekly.content}\n")

    decoded_message = ProtobufMessage()
    decoded_message.ParseFromString(response.content)
    games = MessageToDict(decoded_message).get("games", [])

    decoded_weekly = ProtobufMessage()
    decoded_weekly.ParseFromString(response_weekly.content)
    games_weekly = MessageToDict(decoded_weekly).get("games", [])
    week_map = {g["id"]: g for g in games_weekly}

    for game in games:
        extra = game.get("extra")
        if extra is not None:
            game["extra"] = decode_signed(int(extra))
            game["rtp_status"] = "down" if game["extra"] < 0 else "up"
        else:
            game["rtp_status"] = "neutral"

        week = week_map.get(game["id"])
        game["rtp_semana"] = week.get("rtp") if week else None
        game["extra_semana"] = (
            decode_signed(int(week["extra"])) if week and week.get("extra") else None
        )

        if game["extra_semana"] is None:
            game["status_semana"] = "neutral"
        elif game["extra_semana"] < 0:
            game["status_semana"] = "down"
        else:
            game["status_semana"] = "up"

    if DEBUG_REQUESTS:
        print("[DEBUG] <<< Mensagem Decodificada (JSON) >>>")
        print(games)

    return games


@app.route("/")
def index():
    return render_template("jogos.html", modo="tempo_real")


@app.route("/melhores")
def melhores():
    return render_template("jogos.html", modo="melhores")


@app.route("/api/games")
@jwt_required()
def games():
    global latest_games
    try:
        latest_games = fetch_games_data()
        return jsonify(latest_games)
    except requests.RequestException:
        return jsonify({"erro": "Falha ao buscar jogos"}), 500


@app.route("/api/melhores")
@jwt_required()
def api_melhores():
    global latest_games
    try:
        latest_games = fetch_games_data()
        return jsonify(prioritize_games(latest_games))
    except requests.RequestException:
        return jsonify({"erro": "Falha ao buscar jogos"}), 500


@app.route("/imagens/<int:game_id>.webp")
def cached_image(game_id):
    file_path = os.path.join(IMAGE_CACHE_DIR, f"{game_id}.webp")
    if not os.path.exists(file_path):
        remote_url = f"https://cgg.bet.br/static/v1/casino/game/0/{game_id}/big.webp"
        try:
            resp = requests.get(remote_url, verify=VERIFY_SSL, timeout=10)
            resp.raise_for_status()
            with open(file_path, "wb") as img_file:
                img_file.write(resp.content)
        except requests.RequestException:
            abort(404)
    response = send_file(
        file_path,
        mimetype="image/webp",
        max_age=86400,
    )
    response.headers["Cache-Control"] = "public, max-age=86400"
    return response


@socketio.on("connect")
def handle_connect():
    try:
        verify_jwt_in_request(locations=["query_string", "headers"])
    except Exception:
        return False
    if latest_games:
        emit("games_update", latest_games)


def background_fetch():
    while True:
        try:
            global latest_games
            latest_games = fetch_games_data()
            socketio.emit("games_update", latest_games)
        except requests.RequestException as exc:
            if DEBUG_REQUESTS:
                print("[DEBUG] Erro na atualização em segundo plano")
                print(exc)
        finally:
            socketio.sleep(3)


@app.route("/api/last-winners")
@jwt_required()
def last_winners():
    winners_url = "https://cgg.bet.br/casinogo/widgets/last-winners"
    winners_headers = headers.copy()
    winners_headers["accept"] = "application/json"

    try:
        if DEBUG_REQUESTS:
            print("\n[DEBUG] >>> Enviando Requisição Últimos Vencedores <<<")
            print(f"[DEBUG] URL: {winners_url}")
            print(f"[DEBUG] Headers: {winners_headers}")
            print(f"[DEBUG] SSL Verify: {VERIFY_SSL}")

        response = requests.post(
            winners_url, headers=winners_headers, verify=VERIFY_SSL
        )
        response.raise_for_status()

        if DEBUG_REQUESTS:
            print("\n[DEBUG] <<< Resposta Últimos Vencedores >>>")
            print(f"[DEBUG] Status Code: {response.status_code}")
            print(f"[DEBUG] Conteúdo JSON: {response.text}\n")

        return jsonify(response.json())
    except requests.RequestException as exc:
        if DEBUG_REQUESTS:
            print("[DEBUG] Erro na requisição de últimos vencedores")
            print(exc)
        return (
            jsonify({"erro": "Falha ao buscar últimos vencedores"}),
            500,
        )


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        data = request.get_json() or request.form
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            return jsonify({"erro": "Credenciais inválidas"}), 400
        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            return jsonify({"erro": "Usuário ou senha incorretos"}), 401
        if user.ip_liberado:
            ips = [ip.strip() for ip in user.ip_liberado.split(",") if ip.strip()]
            if request.remote_addr not in ips:
                return jsonify({"erro": "IP não autorizado"}), 403
        token = create_access_token(identity=user.id)
        return jsonify({"access_token": token})
    return render_template("login.html")


@app.route("/admin")
@jwt_required()
def admin():
    return render_template("admin.html")


@app.route("/api/users", methods=["GET", "POST"])
@jwt_required()
def users_api():
    if request.method == "POST":
        data = request.get_json() or {}
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            return (
                jsonify({"erro": "Usuário e senha são obrigatórios"}),
                400,
            )
        if User.query.filter_by(username=username).first():
            return jsonify({"erro": "Usuário já existe"}), 400
        user = User(username=username, ip_liberado=data.get("ip_liberado", ""))
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify({"id": user.id}), 201

    users = [
        {"id": u.id, "username": u.username, "ip_liberado": u.ip_liberado or ""}
        for u in User.query.all()
    ]
    return jsonify(users)


@app.route("/api/users/<int:user_id>", methods=["PUT", "DELETE"])
@jwt_required()
def user_detail(user_id: int):
    user = User.query.get_or_404(user_id)
    if request.method == "PUT":
        data = request.get_json() or {}
        if "username" in data:
            user.username = data["username"]
        if data.get("password"):
            user.set_password(data["password"])
        if "ip_liberado" in data:
            user.ip_liberado = data["ip_liberado"]
        db.session.commit()
        return jsonify({"status": "atualizado"})
    db.session.delete(user)
    db.session.commit()
    return jsonify({"status": "excluido"})


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument(
        "--insecure", action="store_true", help="Desativa verificação SSL"
    )
    args, _ = parser.parse_known_args()
    if args.insecure:
        VERIFY_SSL = False

    socketio.start_background_task(background_fetch)
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() in ("1", "true", "yes")
    socketio.run(
        app, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=debug_mode
    )
