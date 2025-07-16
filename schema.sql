CREATE TABLE IF NOT EXISTS rtp_history (
    game_id BIGINT,
    name TEXT,
    provider TEXT,
    rtp REAL,
    extra BIGINT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
