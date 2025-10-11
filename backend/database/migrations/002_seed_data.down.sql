-- Rollback seed data
-- This only removes the sample data, not roles/languages/achievements

DELETE FROM journey_topics WHERE journey_id IN (
    SELECT id FROM journeys WHERE name = 'First Steps in Cantonese'
);

DELETE FROM journeys WHERE name = 'First Steps in Cantonese';

DELETE FROM topic_words WHERE topic_id IN (
    SELECT id FROM topics WHERE name = 'Basic Greetings'
);

DELETE FROM topics WHERE name = 'Basic Greetings';

DELETE FROM word_translations WHERE word_id IN (
    SELECT id FROM words WHERE base_word IN ('hello', 'goodbye', 'thank you')
);

DELETE FROM words WHERE base_word IN ('hello', 'goodbye', 'thank you');

-- Note: We don't delete roles, languages, or achievements as they might be referenced
