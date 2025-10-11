-- Migration: 001_initial_schema (down)
-- This file rolls back the initial schema migration

DROP TABLE IF EXISTS learning_sessions CASCADE;
DROP TABLE IF EXISTS spaced_repetition_items CASCADE;
DROP TABLE IF EXISTS user_notes CASCADE;
DROP TABLE IF EXISTS user_bookmarks CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_conversation_progress CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS user_journeys CASCADE;
DROP TABLE IF EXISTS topic_conversations CASCADE;
DROP TABLE IF EXISTS conversation_lines CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS topic_quizzes CASCADE;
DROP TABLE IF EXISTS journey_topics CASCADE;
DROP TABLE IF EXISTS journeys CASCADE;
DROP TABLE IF EXISTS topic_words CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS word_translations CASCADE;
DROP TABLE IF EXISTS words CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Note: We don't drop the users table as it was created in the initial setup
-- ALTER TABLE users DROP COLUMN IF EXISTS profile_pic_url;
