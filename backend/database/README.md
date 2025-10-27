# Database SQL Migrations

This directory contains SQL migration files for database functions, triggers, and views.

## Directory Structure

```
database/
├── functions/     # Database functions
├── triggers/      # Database triggers
└── views/         # Database views
```

## Execution Order

Migrations are executed in this order at startup:
1. **Functions** (`database/functions/*.sql`) - Database functions must be created first
2. **Triggers** (`database/triggers/*.sql`) - Triggers depend on functions
3. **Views** (`database/views/*.sql`) - Views query tables and can be created last

Within each directory, files are executed in alphabetical order (001, 002, 003...).

## Idempotency

All SQL files use idempotent patterns to allow safe re-execution:
- Functions: `CREATE OR REPLACE FUNCTION`
- Triggers: `DROP TRIGGER IF EXISTS` followed by `CREATE TRIGGER`
- Views: `CREATE OR REPLACE VIEW`

This means migrations can be safely run multiple times without errors.

## Files

### Functions

| File | Purpose |
|------|---------|
| `001_update_updated_at.sql` | Auto-update `updated_at` timestamp on row updates |
| `002_update_journey_status.sql` | Track journey status changes (assigned → in_progress → completed) |

### Triggers

| File | Purpose |
|------|---------|
| `001_users_updated_at.sql` | Apply timestamp trigger to users table |
| `002_words_updated_at.sql` | Apply timestamp trigger to words table |
| `003_word_translations_updated_at.sql` | Apply timestamp trigger to word_translations table |
| `004_topics_updated_at.sql` | Apply timestamp trigger to topics table |
| `005_journeys_updated_at.sql` | Apply timestamp trigger to journeys table |
| `006_topic_quizzes_updated_at.sql` | Apply timestamp trigger to topic_quizzes table |
| `007_journey_status_tracking.sql` | Track journey status based on user progress |
| `008_journey_topic_reset_completion.sql` | Reset completed journeys to in_progress when new topic added |

### Views

| File | Purpose |
|------|---------|
| `001_user_progress_summary.sql` | Per-user learning metrics (topics/journeys completed, time, accuracy) |
| `002_topic_performance.sql` | Per-topic performance metrics (students, scores, time) |
| `003_journey_progress.sql` | Journey completion tracking per user |

## Adding New Migrations

### 1. Choose the Right Directory

- **Function**: Place in `functions/` if it's a reusable PostgreSQL function
- **Trigger**: Place in `triggers/` if it responds to table events (INSERT, UPDATE, DELETE)
- **View**: Place in `views/` if it's a query abstraction

### 2. Name the File

Use format: `NNN_descriptive_name.sql` where NNN is next number (e.g., `008_my_new_trigger.sql`)

### 3. Make It Idempotent

**Functions:**
```sql
CREATE OR REPLACE FUNCTION my_function() 
RETURNS TRIGGER AS $$
BEGIN
    -- function logic
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Triggers:**
```sql
DROP TRIGGER IF EXISTS my_trigger ON my_table;
CREATE TRIGGER my_trigger 
    BEFORE UPDATE ON my_table
    FOR EACH ROW EXECUTE FUNCTION my_function();
```

**Views:**
```sql
CREATE OR REPLACE VIEW my_view AS
SELECT column1, column2
FROM my_table;
```

### 4. Test Locally

```bash
# Run migrations
cd backend
./run.sh

# Check logs for SQL execution
# Should see: "Executing SQL file: XXX_my_migration.sql"
# Should see: "Successfully executed: XXX_my_migration.sql"
```

## Migration Execution

Migrations run automatically at application startup via `database/migrate.go`:

```go
func Migrate() error {
    // 1. GORM AutoMigrate (tables, columns)
    DB.AutoMigrate(&models.User{}, ...)
    
    // 2. Seed essential data (roles, languages)
    seedEssentialData()
    
    // 3. Run SQL migrations (functions, triggers, views)
    runSQLMigrations()
    
    return nil
}
```

The `runSQLMigrations()` function:
- Reads `database/functions/*.sql` (sorted)
- Reads `database/triggers/*.sql` (sorted)
- Reads `database/views/*.sql` (sorted)
- Executes each file
- Logs warnings but continues on errors (idempotency handles "already exists")

## Benefits of SQL Files

- ✅ **Separation of Concerns**: Database logic in SQL, app logic in Go
- ✅ **Easy to Review**: SQL diffs show exactly what database changes
- ✅ **IDE Support**: Syntax highlighting, formatting for `.sql` files
- ✅ **Reusable**: Functions/triggers/views can be tested in psql
- ✅ **Idempotent**: Safe to run multiple times
- ✅ **Modular**: Each function/trigger/view in its own file

## Troubleshooting

### "Function already exists"
Normal - `CREATE OR REPLACE` handles this. Check logs for "Successfully executed".

### "Trigger already exists"
Normal - `DROP IF EXISTS` followed by `CREATE` handles this.

### "View already exists"
Normal - `CREATE OR REPLACE` handles this.

### Syntax Error
1. Test SQL in psql: `psql -U postgres -d learnspeak -f path/to/file.sql`
2. Check PostgreSQL version compatibility
3. Verify dependent objects exist (tables, functions)

### Migration Not Running
1. Check file is in correct directory (`functions/`, `triggers/`, or `views/`)
2. Check file has `.sql` extension
3. Check file naming (should sort correctly: `001`, `002`, `003...`)
4. Check logs: "Executing SQL file: ..."

## Examples

### Example Function

```sql
-- database/functions/003_calculate_completion.sql
CREATE OR REPLACE FUNCTION calculate_completion_percentage(p_user_id INTEGER, p_journey_id INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    total INTEGER;
    completed INTEGER;
BEGIN
    SELECT COUNT(*) INTO total 
    FROM journey_topics 
    WHERE journey_id = p_journey_id;
    
    SELECT COUNT(DISTINCT topic_id) INTO completed
    FROM user_progress
    WHERE user_id = p_user_id 
      AND journey_id = p_journey_id 
      AND completed = TRUE;
    
    IF total = 0 THEN RETURN 0; END IF;
    RETURN (completed::DECIMAL / total * 100);
END;
$$ LANGUAGE plpgsql;
```

### Example Trigger

```sql
-- database/triggers/008_audit_word_changes.sql
DROP TRIGGER IF EXISTS audit_word_changes ON words;
CREATE TRIGGER audit_word_changes
    AFTER UPDATE ON words
    FOR EACH ROW EXECUTE FUNCTION log_word_changes();
```

### Example View

```sql
-- database/views/004_active_learners.sql
CREATE OR REPLACE VIEW v_active_learners AS
SELECT 
    u.id,
    u.username,
    u.name,
    COUNT(DISTINCT up.topic_id) as active_topics,
    MAX(up.created_at) as last_activity
FROM users u
JOIN user_progress up ON u.id = up.user_id
WHERE up.created_at > NOW() - INTERVAL '30 days'
  AND u.deleted_at IS NULL
GROUP BY u.id, u.username, u.name
HAVING COUNT(DISTINCT up.topic_id) > 0
ORDER BY last_activity DESC;
```

## Migration History

All migrations are tracked and safe to re-run. The system handles:
- First-time execution
- Re-execution (idempotent patterns)
- New migrations added later
- Order dependencies (functions → triggers → views)
