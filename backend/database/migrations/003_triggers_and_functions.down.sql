-- Rollback triggers and functions

-- Drop views
DROP VIEW IF EXISTS v_journey_progress;
DROP VIEW IF EXISTS v_topic_performance;
DROP VIEW IF EXISTS v_user_progress_summary;

-- Drop triggers
DROP TRIGGER IF EXISTS check_journey_completion_trigger ON user_progress;
DROP TRIGGER IF EXISTS auto_grant_achievements ON user_progress;
DROP TRIGGER IF EXISTS update_srs_items_updated_at ON spaced_repetition_items;
DROP TRIGGER IF EXISTS update_user_notes_updated_at ON user_notes;
DROP TRIGGER IF EXISTS update_conversation_lines_updated_at ON conversation_lines;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS update_topic_quizzes_updated_at ON topic_quizzes;
DROP TRIGGER IF EXISTS update_journeys_updated_at ON journeys;
DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
DROP TRIGGER IF EXISTS update_word_translations_updated_at ON word_translations;
DROP TRIGGER IF EXISTS update_words_updated_at ON words;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop functions
DROP FUNCTION IF EXISTS check_journey_completion();
DROP FUNCTION IF EXISTS check_and_grant_achievements();
DROP FUNCTION IF EXISTS update_updated_at_column();
