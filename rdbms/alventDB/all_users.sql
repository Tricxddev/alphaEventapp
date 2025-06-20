CREATE TABLE IF NOT EXISTS all_users (
    user_id UUID NOT NULL,
    user_name VARCHAR,
    email VARCHAR,
    google_id VARCHAR,
    user_role VARCHAR DEFAULT 'none' CHECK (user_role IN ('attendee', 'organizer', 'admin', 'none')),
    accnt_status VARCHAR DEFAULT 'active' CHECK (accnt_status IN ('active', 'suspended')),
    restpassword_otp VARCHAR,
    restpassword_otp_expires TIMESTAMPTZ,
    profile_pic TEXT,
    last_login TIMESTAMPTZ,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT current_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT current_timestamp()
);