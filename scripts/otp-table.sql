-- Run this alongside extra-tables.sql

CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_student ON otp_codes(student_id);

-- Useful index for results tallying
CREATE INDEX IF NOT EXISTS idx_votes_session_candidate ON votes(session_id, candidate_id);
