-- Trigger to track journey status changes
DROP TRIGGER IF EXISTS update_journey_status_trigger ON user_progress;
CREATE TRIGGER update_journey_status_trigger 
    AFTER INSERT OR UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_journey_status();
