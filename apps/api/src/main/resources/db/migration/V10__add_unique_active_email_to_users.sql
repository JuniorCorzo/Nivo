-- Flyway migration V10: Prevent duplicate active user registrations and logins DoS
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_active_unique
ON users (LOWER(email))
WHERE deleted_at IS NULL;
