-- Seed Data for LearnSpeak
-- Run after initial schema migration

-- ============================================================================
-- 1. ROLES
-- ============================================================================

-- Only insert roles if the table is empty
INSERT INTO roles (name, description)
SELECT 'learner', 'Student learning languages'
WHERE NOT EXISTS (SELECT 1 FROM roles LIMIT 1)
UNION ALL
SELECT 'teacher', 'Teacher managing content and learners'
WHERE NOT EXISTS (SELECT 1 FROM roles LIMIT 1)
UNION ALL
SELECT 'admin', 'System administrator'
WHERE NOT EXISTS (SELECT 1 FROM roles LIMIT 1)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. LANGUAGES
-- ============================================================================

-- Only insert languages if the table is empty
INSERT INTO languages (code, name, native_name, direction, is_active)
SELECT 'en', 'English', 'English', 'ltr', true
WHERE NOT EXISTS (SELECT 1 FROM languages LIMIT 1)
UNION ALL
SELECT 'zh-HK', 'Cantonese (Traditional)', '廣東話（繁體）', 'ltr', true
WHERE NOT EXISTS (SELECT 1 FROM languages LIMIT 1)
UNION ALL
SELECT 'zh-CN', 'Mandarin (Simplified)', '普通话（简体）', 'ltr', true
WHERE NOT EXISTS (SELECT 1 FROM languages LIMIT 1)
UNION ALL
SELECT 'es', 'Spanish', 'Español', 'ltr', true
WHERE NOT EXISTS (SELECT 1 FROM languages LIMIT 1)
UNION ALL
SELECT 'fr', 'French', 'Français', 'ltr', true
WHERE NOT EXISTS (SELECT 1 FROM languages LIMIT 1)
UNION ALL
SELECT 'ja', 'Japanese', '日本語', 'ltr', true
WHERE NOT EXISTS (SELECT 1 FROM languages LIMIT 1)
UNION ALL
SELECT 'ko', 'Korean', '한국어', 'ltr', true
WHERE NOT EXISTS (SELECT 1 FROM languages LIMIT 1)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 3. ACHIEVEMENTS
-- ============================================================================

-- Only insert achievements if the table is empty
INSERT INTO achievements (name, description, criteria_type, criteria_value, badge_icon_url)
SELECT 'First Topic', 'Complete your first topic', 'topic_complete', 1, '/badges/first-topic.svg'
WHERE NOT EXISTS (SELECT 1 FROM achievements LIMIT 1)
UNION ALL
SELECT 'Journey Beginner', 'Complete your first journey', 'journey_complete', 1, '/badges/first-journey.svg'
WHERE NOT EXISTS (SELECT 1 FROM achievements LIMIT 1)
UNION ALL
SELECT 'Perfect Score', 'Get 100% on a quiz', 'quiz_score', 100, '/badges/perfect-score.svg'
WHERE NOT EXISTS (SELECT 1 FROM achievements LIMIT 1)
UNION ALL
SELECT 'Word Master 50', 'Learn 50 words', 'total_words', 50, '/badges/word-master-50.svg'
WHERE NOT EXISTS (SELECT 1 FROM achievements LIMIT 1)
UNION ALL
SELECT 'Word Master 100', 'Learn 100 words', 'total_words', 100, '/badges/word-master-100.svg'
WHERE NOT EXISTS (SELECT 1 FROM achievements LIMIT 1)
UNION ALL
SELECT 'Word Master 500', 'Learn 500 words', 'total_words', 500, '/badges/word-master-500.svg'
WHERE NOT EXISTS (SELECT 1 FROM achievements LIMIT 1)
UNION ALL
SELECT 'Journey Master', 'Complete 5 journeys', 'journey_complete', 5, '/badges/journey-master.svg'
WHERE NOT EXISTS (SELECT 1 FROM achievements LIMIT 1)
UNION ALL
SELECT 'Topic Expert', 'Complete 10 topics', 'topic_complete', 10, '/badges/topic-expert.svg'
WHERE NOT EXISTS (SELECT 1 FROM achievements LIMIT 1)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. SAMPLE DATA (Optional - for development/testing)
-- ============================================================================

-- Note: In production, you may want to skip or modify this section
-- This creates sample words, topics, and journeys for testing
-- Only runs if words table is empty

DO $$
DECLARE
    v_user_id INTEGER;
    v_word_id INTEGER;
    v_topic_id INTEGER;
    v_journey_id INTEGER;
    v_lang_en INTEGER;
    v_lang_cantonese INTEGER;
    v_word_count INTEGER;
BEGIN
    -- Check if words table is empty
    SELECT COUNT(*) INTO v_word_count FROM words;
    
    IF v_word_count > 0 THEN
        RAISE NOTICE 'Words table already contains data. Skipping sample data creation.';
        RETURN;
    END IF;
    
    -- Get the first admin/teacher user (or create a system user)
    SELECT id INTO v_user_id FROM users 
    WHERE EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.id 
        WHERE ur.user_id = users.id AND r.name IN ('admin', 'teacher')
    ) LIMIT 1;
    
    -- If no admin/teacher exists, get first user
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id FROM users LIMIT 1;
    END IF;
    
    -- If still no user, skip sample data
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No users found. Skipping sample data creation.';
        RETURN;
    END IF;
    
    -- Get language IDs
    SELECT id INTO v_lang_en FROM languages WHERE code = 'en';
    SELECT id INTO v_lang_cantonese FROM languages WHERE code = 'zh-HK';
    
    -- Create sample words
    -- Word 1: Hello
    INSERT INTO words (base_word, image_url, notes, created_by)
    VALUES ('hello', '/images/words/hello.jpg', 'Common greeting', v_user_id)
    RETURNING id INTO v_word_id;
    
    INSERT INTO word_translations (word_id, language_id, translation, romanization, audio_url) VALUES
        (v_word_id, v_lang_en, 'hello', NULL, '/audio/en/hello.mp3'),
        (v_word_id, v_lang_cantonese, '你好', 'nei5 hou2', '/audio/zh-HK/hello.mp3');
    
    -- Word 2: Goodbye
    INSERT INTO words (base_word, image_url, notes, created_by)
    VALUES ('goodbye', '/images/words/goodbye.jpg', 'Farewell greeting', v_user_id)
    RETURNING id INTO v_word_id;
    
    INSERT INTO word_translations (word_id, language_id, translation, romanization, audio_url) VALUES
        (v_word_id, v_lang_en, 'goodbye', NULL, '/audio/en/goodbye.mp3'),
        (v_word_id, v_lang_cantonese, '再見', 'zoi3 gin3', '/audio/zh-HK/goodbye.mp3');
    
    -- Word 3: Thank you
    INSERT INTO words (base_word, image_url, notes, created_by)
    VALUES ('thank you', '/images/words/thank_you.jpg', 'Expression of gratitude', v_user_id)
    RETURNING id INTO v_word_id;
    
    INSERT INTO word_translations (word_id, language_id, translation, romanization, audio_url) VALUES
        (v_word_id, v_lang_en, 'thank you', NULL, '/audio/en/thank_you.mp3'),
        (v_word_id, v_lang_cantonese, '多謝', 'do1 ze6', '/audio/zh-HK/thank_you.mp3');
    
    -- Create a sample topic
    INSERT INTO topics (name, description, level, language_id, created_by)
    VALUES ('Basic Greetings', 'Learn common Cantonese greetings', 'beginner', v_lang_cantonese, v_user_id)
    RETURNING id INTO v_topic_id;
    
    -- Add words to topic
    INSERT INTO topic_words (topic_id, word_id, sequence_order)
    SELECT v_topic_id, id, ROW_NUMBER() OVER (ORDER BY id)
    FROM words WHERE created_by = v_user_id;
    
    -- Create a sample journey
    INSERT INTO journeys (name, description, language_id, created_by)
    VALUES ('First Steps in Cantonese', 'Begin your Cantonese learning journey with essential words and phrases', v_lang_cantonese, v_user_id)
    RETURNING id INTO v_journey_id;
    
    -- Add topic to journey
    INSERT INTO journey_topics (journey_id, topic_id, sequence_order)
    VALUES (v_journey_id, v_topic_id, 1);
    
    RAISE NOTICE 'Sample data created successfully';
END $$;
