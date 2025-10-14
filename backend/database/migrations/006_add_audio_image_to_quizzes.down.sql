-- Remove audio_url and image_url columns from topic_quizzes table
ALTER TABLE topic_quizzes DROP COLUMN IF EXISTS audio_url;
ALTER TABLE topic_quizzes DROP COLUMN IF EXISTS image_url;