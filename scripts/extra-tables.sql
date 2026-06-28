-- Additional table required for setup/verification links (schools, candidates, etc.)
-- Run this in addition to the schema you already created.

CREATE TABLE IF NOT EXISTS verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    purpose TEXT NOT NULL,              -- 'school_setup' | 'student_otp' | 'candidate_pitch'
    target_table TEXT NOT NULL,         -- 'schools' | 'students' | 'candidates'
    target_id UUID NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);

-- Helpful index for system admin dashboard sorting/filtering
CREATE INDEX IF NOT EXISTS idx_schools_verified ON schools(verified);

-- One-time codes sent to a student's email during login
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_student ON otp_codes(student_id);
