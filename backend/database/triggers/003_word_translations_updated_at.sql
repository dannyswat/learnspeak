-- Trigger to auto-update updated_at on word_translations table
DROP TRIGGER IF EXISTS update_word_translations_updated_at ON word_translations;
CREATE TRIGGER update_word_translations_updated_at 
    BEFORE UPDATE ON word_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
