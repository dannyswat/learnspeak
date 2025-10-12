-- Remove deleted_at column from user_journeys table
DROP INDEX IF EXISTS idx_user_journeys_deleted_at;
ALTER TABLE user_journeys DROP COLUMN IF EXISTS deleted_at;
