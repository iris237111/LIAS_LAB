ALTER TABLE membership_requests ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
