-- Create journey_invitations table
CREATE OR REPLACE FUNCTION create_journey_invitations_table() RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'journey_invitations') THEN
        CREATE TABLE journey_invitations (
            id SERIAL PRIMARY KEY,
            journey_id INTEGER NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
            invitation_token VARCHAR(64) NOT NULL UNIQUE,
            created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at TIMESTAMP,
            max_uses INTEGER,
            current_uses INTEGER NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes
        CREATE INDEX idx_journey_invitations_journey_id ON journey_invitations(journey_id);
        CREATE INDEX idx_journey_invitations_token ON journey_invitations(invitation_token);
        CREATE INDEX idx_journey_invitations_created_by ON journey_invitations(created_by);
        CREATE INDEX idx_journey_invitations_is_active ON journey_invitations(is_active);

        -- Add updated_at trigger
        CREATE TRIGGER update_journey_invitations_updated_at
            BEFORE UPDATE ON journey_invitations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT create_journey_invitations_table();
DROP FUNCTION create_journey_invitations_table();
