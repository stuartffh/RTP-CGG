import sqlite3

DB_PATH = "rtp.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS rtp_history (
            game_id INTEGER,
            name TEXT,
            provider TEXT,
            rtp REAL,
            extra INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )"""
        )
        conn.commit()


def insert_games(games: list[dict]):
    if not games:
        return
    with get_connection() as conn:
        records = []
        for game in games:
            game_id = game.get("id")
            if game_id is None:
                continue
            cur = conn.execute(
                "SELECT rtp, extra FROM rtp_history WHERE game_id=? ORDER BY timestamp DESC LIMIT 1",
                (game_id,),
            )
            last = cur.fetchone()
            rtp = game.get("rtp")
            extra = game.get("extra")
            if last is None or last["rtp"] != rtp or last["extra"] != extra:
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
                    )
                )
        if records:
            conn.executemany(
                "INSERT INTO rtp_history (game_id, name, provider, rtp, extra) VALUES (?, ?, ?, ?, ?)",
                records,
            )
            conn.commit()


def query_history(
    period: str = "daily", game_id: int | None = None, name: str | None = None
):
    period_map = {
        "daily": "strftime('%Y-%m-%d', timestamp)",
        "weekly": "strftime('%Y-%W', timestamp)",
        "monthly": "strftime('%Y-%m', timestamp)",
    }
    group_by = period_map.get(period)
    if not group_by:
        raise ValueError("Periodo invalido")

    where_clauses: list[str] = []
    params: list = []
    if game_id is not None:
        where_clauses.append("game_id = ?")
        params.append(game_id)
    if name:
        where_clauses.append("lower(name) LIKE ?")
        params.append(f"%{name.lower()}%")

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
    with get_connection() as conn:
        cur = conn.execute(query, params)
        return [dict(row) for row in cur.fetchall()]


def list_games() -> list[dict]:
    """Retorna jogos distintos armazenados no banco."""
    with get_connection() as conn:
        cur = conn.execute(
            "SELECT DISTINCT game_id, name FROM rtp_history ORDER BY name"
        )
        return [dict(row) for row in cur.fetchall()]


def game_history(game_id: int) -> list[dict]:
    """Retorna todos os registros de um jogo ordenados por data."""
    with get_connection() as conn:
        cur = conn.execute(
            """
            SELECT game_id, name, provider, rtp, extra, timestamp
            FROM rtp_history
            WHERE game_id = ?
            ORDER BY timestamp DESC
            """,
            (game_id,),
        )
        return [dict(row) for row in cur.fetchall()]


init_db()
