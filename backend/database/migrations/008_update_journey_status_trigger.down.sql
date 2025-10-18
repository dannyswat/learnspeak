-- Rollback migration: 008_update_journey_status_trigger
-- Restore original function

DROP TRIGGER IF EXISTS update_journey_status_trigger ON user_progress;

-- Restore original function
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
