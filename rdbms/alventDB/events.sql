CREATE TABLE IF NOT EXISTS events (
    event_id  NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    event_type VARCHAR CHECK (event_type IN ('Virtual', 'Physical')),
    event_status VARCHAR DEFAULT 'upcoming' CHECK (event_status IN ('upcoming', 'ongoing', 'completed')),
    organizer_id NOT NULL,
    promo_id VARCHAR,
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ 
);