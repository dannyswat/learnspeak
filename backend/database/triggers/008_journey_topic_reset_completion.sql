-- =====================================================
-- Trigger: Reset journey completion when new topic added
-- =====================================================
-- When a new topic is added to a journey, any user_journeys 
-- that were marked as 'completed' should be reset to 'in_progress'
-- since there is now new content to complete.
--
-- This ensures learners know they have additional work to do
-- when a teacher adds more topics to a journey they've already finished.
-- =====================================================

-- Function to reset journey completion on new topic
CREATE OR REPLACE FUNCTION reset_journey_completion_on_new_topic()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all user_journeys for this journey from 'completed' to 'in_progress'
    -- This happens when a new topic is added to an existing journey
    UPDATE user_journeys
    SET 
        status = 'in_progress',
        completed_at = NULL
    WHERE 
        journey_id = NEW.journey_id 
        AND status = 'completed';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS journey_topic_reset_completion_trigger ON journey_topics;

-- Create trigger that fires after a new topic is inserted into journey_topics
CREATE TRIGGER journey_topic_reset_completion_trigger
    AFTER INSERT ON journey_topics
    FOR EACH ROW 
    EXECUTE FUNCTION reset_journey_completion_on_new_topic();
