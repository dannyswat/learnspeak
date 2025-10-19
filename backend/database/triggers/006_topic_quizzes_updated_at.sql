-- Trigger to auto-update updated_at on topic_quizzes table
DROP TRIGGER IF EXISTS update_topic_quizzes_updated_at ON topic_quizzes;
CREATE TRIGGER update_topic_quizzes_updated_at 
    BEFORE UPDATE ON topic_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
