-- Migration: 008_update_journey_status_trigger
-- Created: 2025-10-18
-- Description: Enhanced journey status tracking - automatically update status to 'in_progress' when activities start

-- Drop existing trigger
DROP TRIGGER IF EXISTS check_journey_completion_trigger ON user_progress;

-- Enhanced function to handle both in_progress and completed statuses
CREATE OR REPLACE FUNCTION update_journey_status()
RETURNS TRIGGER AS $$
DECLARE
    total_topics INTEGER;
    completed_topics INTEGER;
    v_journey_id INTEGER;
    current_status VARCHAR(20);
BEGIN
    -- Get journey_id from the progress record
    v_journey_id := NEW.journey_id;
    
    IF v_journey_id IS NOT NULL THEN
        -- Get current journey status
        SELECT status INTO current_status
        FROM user_journeys
        WHERE user_id = NEW.user_id AND journey_id = v_journey_id;
        
        -- If journey is 'assigned' and user has started an activity, mark as 'in_progress'
        IF current_status = 'assigned' THEN
            UPDATE user_journeys
            SET status = 'in_progress',
                started_at = CURRENT_TIMESTAMP
            WHERE user_id = NEW.user_id 
                AND journey_id = v_journey_id
                AND status = 'assigned';
        END IF;
        
        -- Check for completion if activity is completed
        IF NEW.completed = TRUE THEN
            -- Count total topics in the journey
            SELECT COUNT(*) INTO total_topics
            FROM journey_topics
            WHERE journey_id = v_journey_id;
            
            -- Count completed topics for this user in this journey
            -- A topic is considered completed if ALL required activities are done
            SELECT COUNT(DISTINCT jt.topic_id) INTO completed_topics
            FROM journey_topics jt
            WHERE jt.journey_id = v_journey_id
                AND EXISTS (
                    SELECT 1 FROM user_progress up
                    WHERE up.user_id = NEW.user_id
                        AND up.topic_id = jt.topic_id
                        AND up.activity_type = 'flashcard'
                        AND up.completed = TRUE
                )
                AND EXISTS (
                    SELECT 1 FROM user_progress up
                    WHERE up.user_id = NEW.user_id
                        AND up.topic_id = jt.topic_id
                        AND up.activity_type = 'quiz'
                        AND up.completed = TRUE
                );
            
            -- If all topics completed, update user_journeys status
            IF completed_topics >= total_topics AND total_topics > 0 THEN
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the updated trigger
CREATE TRIGGER update_journey_status_trigger
    AFTER INSERT OR UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_journey_status();
