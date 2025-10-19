-- Function to track journey status changes
CREATE OR REPLACE FUNCTION update_journey_status()
RETURNS TRIGGER AS $$
DECLARE
    total_topics INTEGER;
    completed_topics INTEGER;
    v_journey_id INTEGER;
    current_status VARCHAR(20);
BEGIN
    v_journey_id := NEW.journey_id;
    
    IF v_journey_id IS NOT NULL THEN
        SELECT status INTO current_status
        FROM user_journeys
        WHERE user_id = NEW.user_id AND journey_id = v_journey_id;
        
        -- Mark as in_progress if starting from assigned
        IF current_status = 'assigned' THEN
            UPDATE user_journeys
            SET status = 'in_progress', started_at = CURRENT_TIMESTAMP
            WHERE user_id = NEW.user_id AND journey_id = v_journey_id AND status = 'assigned';
        END IF;
        
        -- Check for completion
        IF NEW.completed = TRUE THEN
            SELECT COUNT(*) INTO total_topics FROM journey_topics WHERE journey_id = v_journey_id;
            
            SELECT COUNT(DISTINCT jt.topic_id) INTO completed_topics
            FROM journey_topics jt
            WHERE jt.journey_id = v_journey_id
                AND EXISTS (SELECT 1 FROM user_progress up WHERE up.user_id = NEW.user_id AND up.topic_id = jt.topic_id AND up.activity_type = 'flashcard' AND up.completed = TRUE)
                AND EXISTS (SELECT 1 FROM user_progress up WHERE up.user_id = NEW.user_id AND up.topic_id = jt.topic_id AND up.activity_type = 'quiz' AND up.completed = TRUE);
            
            IF completed_topics >= total_topics AND total_topics > 0 THEN
                UPDATE user_journeys
                SET status = 'completed', completed_at = CURRENT_TIMESTAMP
                WHERE user_id = NEW.user_id AND journey_id = v_journey_id AND status != 'completed';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
