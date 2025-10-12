-- Add audio_url and image_url columns to topic_quizzes table
ALTER TABLE topic_quizzes ADD COLUMN audio_url VARCHAR(255);
ALTER TABLE topic_quizzes ADD COLUMN image_url VARCHAR(255);
