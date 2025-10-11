-- Migration: 003_triggers_and_functions
-- Created: 2025-10-11
-- Description: Database triggers and functions for automation

-- ============================================================================
-- 1. UPDATE TIMESTAMP TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_words_updated_at 
    BEFORE UPDATE ON words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_word_translations_updated_at 
    BEFORE UPDATE ON word_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at 
    BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journeys_updated_at 
    BEFORE UPDATE ON journeys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_quizzes_updated_at 
    BEFORE UPDATE ON topic_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_lines_updated_at 
    BEFORE UPDATE ON conversation_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notes_updated_at 
    BEFORE UPDATE ON user_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_srs_items_updated_at 
    BEFORE UPDATE ON spaced_repetition_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. ACHIEVEMENT AUTO-GRANT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION check_and_grant_achievements()
RETURNS TRIGGER AS $$
DECLARE
    topic_count INTEGER;
    journey_count INTEGER;
    word_count INTEGER;
    quiz_score DECIMAL;
BEGIN
    -- Check topic completion achievements
    IF NEW.activity_type = 'quiz' AND NEW.completed = TRUE THEN
        SELECT COUNT(DISTINCT topic_id) INTO topic_count
        FROM user_progress
        WHERE user_id = NEW.user_id 
            AND activity_type = 'quiz' 
            AND completed = TRUE;
        
        -- Grant topic completion achievements
        INSERT INTO user_achievements (user_id, achievement_id)
        SELECT NEW.user_id, a.id 
        FROM achievements a
        WHERE a.criteria_type = 'topic_complete' 
            AND a.criteria_value = topic_count
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
    
    -- Check perfect quiz score
    IF NEW.activity_type = 'quiz' AND NEW.completed = TRUE 
       AND NEW.max_score > 0 AND NEW.score IS NOT NULL THEN
        quiz_score := (NEW.score / NEW.max_score * 100);
        
        IF quiz_score >= 100 THEN
            INSERT INTO user_achievements (user_id, achievement_id)
            SELECT NEW.user_id, a.id 
            FROM achievements a
            WHERE a.criteria_type = 'quiz_score' 
                AND a.criteria_value <= quiz_score
            ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END IF;
    END IF;
    
    -- Check total words learned
    IF NEW.activity_type IN ('flashcard', 'pronunciation') AND NEW.completed = TRUE THEN
        SELECT COUNT(DISTINCT w.id) INTO word_count
        FROM words w
        JOIN topic_words tw ON w.id = tw.word_id
        JOIN user_progress up ON tw.topic_id = up.topic_id
        WHERE up.user_id = NEW.user_id 
            AND up.completed = TRUE;
        
        -- Grant word milestone achievements
        INSERT INTO user_achievements (user_id, achievement_id)
        SELECT NEW.user_id, a.id 
        FROM achievements a
        WHERE a.criteria_type = 'total_words' 
            AND a.criteria_value <= word_count
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_grant_achievements
    AFTER INSERT ON user_progress
    FOR EACH ROW EXECUTE FUNCTION check_and_grant_achievements();

-- ============================================================================
-- 3. JOURNEY COMPLETION CHECK
-- ============================================================================

CREATE OR REPLACE FUNCTION check_journey_completion()
RETURNS TRIGGER AS $$
DECLARE
    total_topics INTEGER;
    completed_topics INTEGER;
    v_journey_id INTEGER;
BEGIN
    -- Get journey_id from the progress record
    v_journey_id := NEW.journey_id;
    
    IF v_journey_id IS NOT NULL AND NEW.completed = TRUE THEN
        -- Count total topics in the journey
        SELECT COUNT(*) INTO total_topics
        FROM journey_topics
        WHERE journey_id = v_journey_id;
        
        -- Count completed topics for this user in this journey
        SELECT COUNT(DISTINCT up.topic_id) INTO completed_topics
        FROM user_progress up
        JOIN journey_topics jt ON up.topic_id = jt.topic_id
        WHERE up.user_id = NEW.user_id 
            AND jt.journey_id = v_journey_id
            AND up.completed = TRUE;
        
        -- If all topics completed, update user_journeys status
        IF completed_topics >= total_topics THEN
            UPDATE user_journeys
            SET status = 'completed',
                completed_at = CURRENT_TIMESTAMP
            WHERE user_id = NEW.user_id 
                AND journey_id = v_journey_id
                AND status != 'completed';
            
            -- Grant journey completion achievements
            INSERT INTO user_achievements (user_id, achievement_id)
            SELECT NEW.user_id, a.id 
            FROM achievements a
            WHERE a.criteria_type = 'journey_complete'
                AND a.criteria_value <= (
                    SELECT COUNT(*) FROM user_journeys
                    WHERE user_id = NEW.user_id AND status = 'completed'
                )
            ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_journey_completion_trigger
    AFTER INSERT OR UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION check_journey_completion();

-- ============================================================================
-- 4. ANALYTICS VIEWS
-- ============================================================================

-- User progress summary view
CREATE OR REPLACE VIEW v_user_progress_summary AS
SELECT 
    u.id AS user_id,
    u.username,
    u.name AS user_name,
    COUNT(DISTINCT CASE WHEN up.activity_type = 'quiz' AND up.completed = TRUE THEN up.topic_id END) AS topics_completed,
    COUNT(DISTINCT CASE WHEN uj.status = 'completed' THEN uj.journey_id END) AS journeys_completed,
    COALESCE(SUM(up.time_spent_seconds), 0) / 60 AS total_time_minutes,
    COALESCE(AVG(CASE WHEN up.activity_type = 'quiz' AND up.max_score > 0 
                 THEN (up.score / NULLIF(up.max_score, 0) * 100) END), 0) AS avg_quiz_accuracy,
    COUNT(DISTINCT ua.achievement_id) AS achievements_earned,
    MAX(up.created_at) AS last_activity_at
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_journeys uj ON u.id = uj.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, u.username, u.name;

-- Topic performance view
CREATE OR REPLACE VIEW v_topic_performance AS
SELECT 
    t.id AS topic_id,
    t.name AS topic_name,
    t.level,
    l.name AS language_name,
    COUNT(DISTINCT up.user_id) AS students_attempted,
    COUNT(DISTINCT CASE WHEN up.completed = TRUE THEN up.user_id END) AS students_completed,
    COALESCE(AVG(CASE WHEN up.activity_type = 'quiz' AND up.max_score > 0 
                 THEN (up.score / NULLIF(up.max_score, 0) * 100) END), 0) AS avg_quiz_score,
    COALESCE(AVG(up.time_spent_seconds), 0) / 60 AS avg_time_minutes,
    COUNT(tw.word_id) AS word_count
FROM topics t
LEFT JOIN languages l ON t.language_id = l.id
LEFT JOIN user_progress up ON t.id = up.topic_id
LEFT JOIN topic_words tw ON t.id = tw.topic_id
GROUP BY t.id, t.name, t.level, l.name;

-- Journey progress view
CREATE OR REPLACE VIEW v_journey_progress AS
SELECT 
    j.id AS journey_id,
    j.name AS journey_name,
    l.name AS language_name,
    u.id AS user_id,
    u.name AS user_name,
    uj.status,
    uj.assigned_at,
    uj.started_at,
    uj.completed_at,
    COUNT(jt.topic_id) AS total_topics,
    COUNT(DISTINCT CASE WHEN up.completed = TRUE THEN up.topic_id END) AS completed_topics,
    CASE 
        WHEN COUNT(jt.topic_id) > 0 
        THEN (COUNT(DISTINCT CASE WHEN up.completed = TRUE THEN up.topic_id END)::DECIMAL / COUNT(jt.topic_id) * 100)
        ELSE 0 
    END AS completion_percentage
FROM journeys j
LEFT JOIN languages l ON j.language_id = l.id
LEFT JOIN user_journeys uj ON j.id = uj.journey_id
LEFT JOIN users u ON uj.user_id = u.id
LEFT JOIN journey_topics jt ON j.id = jt.journey_id
LEFT JOIN user_progress up ON u.id = up.user_id AND jt.topic_id = up.topic_id
GROUP BY j.id, j.name, l.name, u.id, u.name, uj.status, uj.assigned_at, uj.started_at, uj.completed_at;
