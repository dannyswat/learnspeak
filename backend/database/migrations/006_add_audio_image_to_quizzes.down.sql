-- Remove audio_url and image_url columns from topic_quizzes table
ALTER TABLE topic_quizzes DROP COLUMN audio_url;
ALTER TABLE topic_quizzes DROP COLUMN image_url;
