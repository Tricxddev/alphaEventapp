CREATE TABLE IF NOT EXISTS tickets (
    ticket_id  NOT NULL,
    event_id  REFERENCES events(event_id) ON DELETE CASCADE,
    user_id  REFERENCES all_users(user_id) ON DELETE CASCADE,
    ticket_type VARCHAR CHECK (ticket_type IN ('Paid','Free')),
    ticket_status VARCHAR DEFAULT 'active' CHECK (ticket_status IN ('active', 'inactive')),
    ticket_price NUMERIC NOT NULL CHECK (ticket_price >= 0),
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ  DEFAULT current_timestamp
);