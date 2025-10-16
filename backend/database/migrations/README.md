# Database Migrations

This directory contains SQL migration files for the LearnSpeak database schema.

## Migration Files

Migrations are numbered sequentially and have both `.up.sql` and `.down.sql` versions:

### 001 - Initial Schema
- **001_initial_schema.up.sql** - Creates all 25 database tables
- **001_initial_schema.down.sql** - Drops all tables

### 002 - Seed Data
- **002_seed_data.up.sql** - Inserts roles, languages, achievements, and sample content
- **002_seed_data.down.sql** - Removes sample data

### 003 - Triggers and Functions
- **003_triggers_and_functions.up.sql** - Creates triggers, functions, and views
- **003_triggers_and_functions.down.sql** - Removes automation

## Running Migrations

Migrations run automatically when the backend starts:

```bash
cd backend
sh run.sh
```

The migration system:
1. Runs GORM AutoMigrate for `users`, `roles`, and `user_roles`
2. Executes SQL migration files in numerical order
3. Skips already-applied migrations gracefully
4. Logs all migration steps

## Manual Migration

To run migrations manually using psql:

```bash
# Run all migrations
psql -d learnspeak -f migrations/001_initial_schema.up.sql
psql -d learnspeak -f migrations/002_seed_data.up.sql
psql -d learnspeak -f migrations/003_triggers_and_functions.up.sql

# Rollback (in reverse order)
psql -d learnspeak -f migrations/003_triggers_and_functions.down.sql
psql -d learnspeak -f migrations/002_seed_data.down.sql
psql -d learnspeak -f migrations/001_initial_schema.down.sql
```

## Creating New Migrations

1. Create sequential numbered files:
   ```
   004_your_migration_name.up.sql
   004_your_migration_name.down.sql
   ```

2. Write SQL in the `.up.sql` file

3. Write rollback SQL in the `.down.sql` file

4. Test both directions:
   ```bash
   psql -d learnspeak -f migrations/004_your_migration_name.up.sql
   psql -d learnspeak -f migrations/004_your_migration_name.down.sql
   ```

## Database Schema

For complete schema documentation, see:
- [DATABASE.md](../../design/DATABASE.md) - Full schema specification
- [SPRINT_1.2_COMPLETION.md](../../docs/SPRINT_1.2_COMPLETION.md) - Implementation details

## Tables Overview

| Category | Tables |
|----------|--------|
| User Management | roles, users, user_roles |
| Content | languages, words, word_translations, topics, topic_words, journeys, journey_topics |
| Assessment | topic_quizzes, conversations, conversation_lines, topic_conversations |
| Progress | user_journeys, user_progress, user_conversation_progress |
| Gamification | achievements, user_achievements |
| Personalization | user_bookmarks, user_notes |
| SRS | spaced_repetition_items |
| Analytics | learning_sessions |

**Total**: 25 tables

## Triggers & Functions

- `update_updated_at_column()` - Auto-updates timestamps
- `check_and_grant_achievements()` - Auto-awards achievements
- `check_journey_completion()` - Auto-completes journeys

## Views

- `v_user_progress_summary` - User statistics
- `v_topic_performance` - Topic analytics
- `v_journey_progress` - Journey progress tracking

## Verification

Check if migrations ran successfully:

```sql
-- List all tables
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check seed data
SELECT * FROM roles;
SELECT * FROM languages;
SELECT * FROM achievements;

-- Test views
SELECT * FROM v_user_progress_summary LIMIT 5;
```
