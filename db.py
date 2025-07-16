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
        conn.executemany(
            "INSERT INTO rtp_history (game_id, name, provider, rtp, extra) VALUES (?, ?, ?, ?, ?)",
            [
                (
                    g.get("id"),
                    g.get("name"),
                    (
                        g.get("provider", {}).get("name")
                        if isinstance(g.get("provider"), dict)
                        else g.get("provider")
                    ),
                    g.get("rtp"),
                    g.get("extra"),
                )
                for g in games
            ],
        )
        conn.commit()


def query_history(period: str = "daily"):
    period_map = {
        "daily": "strftime('%Y-%m-%d', timestamp)",
        "weekly": "strftime('%Y-%W', timestamp)",
        "monthly": "strftime('%Y-%m', timestamp)",
    }
    group_by = period_map.get(period)
    if not group_by:
        raise ValueError("Periodo invalido")
    with get_connection() as conn:
        cur = conn.execute(
            f"""
            SELECT
                game_id,
                name,
                provider,
                AVG(rtp) AS rtp,
                AVG(extra) AS extra,
                {group_by} AS periodo
            FROM rtp_history
            GROUP BY game_id, periodo
            ORDER BY periodo DESC
        """
        )
        return [dict(row) for row in cur.fetchall()]


init_db()
