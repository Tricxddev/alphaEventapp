CREATE TABLE IF NOT EXISTS payments (
    payment_id UUID NOT NULL,
    ticket_id UUID REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    user_id UUID REFERENCES all_users(user_id) ON DELETE CASCADE,
    payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    payment_method VARCHAR CHECK (payment_method IN ('credit_card', 'debit_card', 'paypal', 'bank_transfer')),
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMPTZ DEFAULT current_timestamp(),
);