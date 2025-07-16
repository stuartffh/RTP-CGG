CREATE TABLE IF NOT EXISTS rtp_history (
    game_id INTEGER,
    name TEXT,
    provider TEXT,
    rtp REAL,
    extra INTEGER,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
