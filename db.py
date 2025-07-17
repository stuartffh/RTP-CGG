import os
import psycopg2
from psycopg2.extras import RealDictCursor

DB_DSN = os.environ.get(
    "DATABASE_URL",
    "postgres://postgres:2412055aa@185.44.66.206:5432/vigilancia?sslmode=disable",
)


def get_connection():
    return psycopg2.connect(DB_DSN)


def init_db():
    with get_connection() as conn, conn.cursor() as cur:
        cur.execute(
            """CREATE TABLE IF NOT EXISTS rtp_history (
            game_id BIGINT,
            name TEXT,
            provider TEXT,
            rtp REAL,
            extra BIGINT,
            rtp_status TEXT,
            casa TEXT,
            timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )"""
        )
        # garante que a coluna rtp_status exista em bancos legados
        cur.execute(
            """
            SELECT 1 FROM information_schema.columns
            WHERE table_name='rtp_history' AND column_name='rtp_status'
            """
        )
        if cur.fetchone() is None:
            cur.execute("ALTER TABLE rtp_history ADD COLUMN rtp_status TEXT")
            cur.execute(
                "UPDATE rtp_history SET rtp_status = CASE WHEN extra IS NULL "
                "THEN 'neutral' WHEN extra < 0 THEN 'down' ELSE 'up' END"
            )
        cur.execute(
            """
            SELECT 1 FROM information_schema.columns
            WHERE table_name='rtp_history' AND column_name='casa'
            """
        )
        if cur.fetchone() is None:
            cur.execute("ALTER TABLE rtp_history ADD COLUMN casa TEXT")
            cur.execute("UPDATE rtp_history SET casa = 'cbet'")
        conn.commit()


def insert_games(games: list[dict], casa: str):
    if not games:
        return
    with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        records = []
        for game in games:
            game_id = game.get("id")
            if game_id is None:
                continue
            casa_val = game.get("casa", casa)
            cur.execute(
                "SELECT rtp, extra FROM rtp_history WHERE game_id=%s AND casa=%s ORDER BY timestamp DESC LIMIT 4",
                (game_id, casa_val),
            )
            recent = cur.fetchall()
            rtp = game.get("rtp")
            extra = game.get("extra")
            if extra is None:
                status = "neutral"
            elif extra < 0:
                status = "down"
            else:
                status = "up"
            skip = False
            if recent:
                skip = any(r["rtp"] == rtp and r["extra"] == extra for r in recent)
            if not skip:
                records.append(
                    (
                        game_id,
                        game.get("name"),
                        (
                            game.get("provider", {}).get("name")
                            if isinstance(game.get("provider"), dict)
                            else game.get("provider")
                        ),
                        rtp,
                        extra,
                        status,
                        casa_val,
                    )
                )
        if records:
            cur.executemany(
                "INSERT INTO rtp_history (game_id, name, provider, rtp, extra, rtp_status, casa) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                records,
            )
            conn.commit()


def query_history(
    period: str = "daily",
    game_id: int | None = None,
    name: str | None = None,
    casa: str | None = None,
):
    period_map = {
        "daily": "to_char(timestamp, 'YYYY-MM-DD')",
        "weekly": "to_char(timestamp, 'IYYY-IW')",
        "monthly": "to_char(timestamp, 'YYYY-MM')",
    }
    group_by = period_map.get(period)
    if not group_by:
        raise ValueError("Periodo invalido")

    where_clauses: list[str] = []
    params: list = []
    if game_id is not None:
        where_clauses.append("game_id = %s")
        params.append(game_id)
    if name:
        where_clauses.append("lower(name) LIKE %s")
        params.append(f"%{name.lower()}%")
    if casa:
        where_clauses.append("casa = %s")
        params.append(casa)

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

    query = f"""
            SELECT
                game_id,
                name,
                provider,
                AVG(rtp) AS rtp,
                AVG(extra) AS extra,
                {group_by} AS periodo
            FROM rtp_history
            {where_sql}
            GROUP BY game_id, periodo
            ORDER BY periodo DESC
        """
    with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, params)
        return cur.fetchall()


def list_games(casa: str | None = None) -> list[dict]:
    """Retorna jogos distintos armazenados no banco."""
    try:
        with get_connection() as conn, conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:
            query = "SELECT DISTINCT game_id, name FROM rtp_history"
            params: tuple = ()
            if casa:
                query += " WHERE casa=%s"
                params = (casa,)
            query += " ORDER BY name"
            cur.execute(query, params)
            return cur.fetchall()
    except Exception as exc:  # pragma: no cover - log para diagnostico
        print("Erro ao consultar jogos:", exc)
        return []


def game_history(game_id: int, casa: str | None = None) -> list[dict]:
    """Retorna todos os registros de um jogo ordenados por data."""
    try:
        with get_connection() as conn, conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:
            query = (
                "SELECT game_id, name, provider, rtp, extra, rtp_status, timestamp "
                "FROM rtp_history WHERE game_id = %s"
            )
            params = [game_id]
            if casa:
                query += " AND casa = %s"
                params.append(casa)
            query += " ORDER BY timestamp DESC"
            cur.execute(query, params)
            return cur.fetchall()
    except Exception as exc:  # pragma: no cover - log para diagnostico
        print("Erro ao consultar histórico:", exc)
        return []


def history_records(
    start: str | None = None,
    end: str | None = None,
    game_id: int | None = None,
    name: str | None = None,
    casa: str | None = None,
):
    """Retorna registros filtrados da tabela rtp_history."""
    where = []
    params: list = []
    if start:
        where.append("timestamp >= %s")
        params.append(start)
    if end:
        where.append("timestamp <= %s")
        params.append(end)
    if game_id is not None:
        where.append("game_id = %s")
        params.append(game_id)
    if name:
        where.append("lower(name) LIKE %s")
        params.append(f"%{name.lower()}%")
    if casa:
        where.append("casa = %s")
        params.append(casa)
    where_sql = f"WHERE {' AND '.join(where)}" if where else ""
    query = f"""
        SELECT game_id, name, provider, rtp, extra, rtp_status, timestamp
        FROM rtp_history
        {where_sql}
        ORDER BY timestamp DESC
        LIMIT 1000
    """
    with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, params)
        return cur.fetchall()


init_db()
