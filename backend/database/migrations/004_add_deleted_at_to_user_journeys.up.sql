-- Add deleted_at column to user_journeys table for soft deletes
ALTER TABLE user_journeys ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index on deleted_at for better query performance
CREATE INDEX idx_user_journeys_deleted_at ON user_journeys(deleted_at);
