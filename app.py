import os

import urllib3
from flask import Flask, jsonify, render_template

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
import requests
from google.protobuf import message_factory
from google.protobuf.descriptor_pb2 import FileDescriptorProto
from google.protobuf.descriptor_pool import DescriptorPool
from google.protobuf.json_format import MessageToDict

app = Flask(__name__)

DEBUG_REQUESTS = os.environ.get("DEBUG_REQUESTS", "false").lower() in (
    "1",
    "true",
    "yes",
)

# Permite personalizar a verificação SSL via variável de ambiente
VERIFY_SSL = os.environ.get("VERIFY_SSL", "false").lower() not in ("false", "0", "no")

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
    game.field.add(name="extra", number=6, type=4)  # campo adicional tratado

    response = proto_schema.message_type.add()
    response.name = "Response"
    response.field.add(name="games", number=2, type=11, type_name=".rtp.Game", label=3)

    pool = DescriptorPool()
    file_desc = pool.Add(proto_schema)
    response_desc = file_desc.message_types_by_name["Response"]

    return message_factory.GetMessageClass(response_desc)


ProtobufMessage = get_protobuf_message()


def decode_signed(value):
    if value > (1 << 63):
        value -= 1 << 64
    return value


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/games")
def games():
    if DEBUG_REQUESTS:
        print("\n[DEBUG] >>> Enviando Requisição <<<")
        print(f"[DEBUG] URL: {url}")
        print(f"[DEBUG] Headers: {headers}")
        print(f"[DEBUG] Data (bytes): {data}")
        print(f"[DEBUG] SSL Verify: {VERIFY_SSL}")

    response = requests.post(url, headers=headers, data=data, verify=VERIFY_SSL)

    if DEBUG_REQUESTS:
        print("\n[DEBUG] >>> Enviando Requisição Semanal <<<")
        print(f"[DEBUG] Data Semanal (bytes): {data_weekly}")

    response_weekly = requests.post(
        url, headers=headers, data=data_weekly, verify=VERIFY_SSL
    )

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
        game["status_semana"] = (
            "down"
            if game["extra_semana"] < 0
            else "up" if game["extra_semana"] else "neutral"
        )

    if DEBUG_REQUESTS:
        print("[DEBUG] <<< Mensagem Decodificada (JSON) >>>")
        print(games)

    return jsonify(games)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument(
        "--insecure", action="store_false", help="Desativa verificação SSL"
    )
    args, _ = parser.parse_known_args()
    if args.insecure:
        VERIFY_SSL = False

    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() in ("1", "true", "yes")
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=debug_mode)
