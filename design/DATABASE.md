# LearnSpeak - Database Schema

**Database**: PostgreSQL 15+  
**Version**: 1.0  
**Date**: October 11, 2025

---

## 1. Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   users     │         │ user_roles   │         │   roles     │
│─────────────│         │──────────────│         │─────────────│
│ id (PK)     │────────<│ user_id (FK) │>────────│ id (PK)     │
│ username    │         │ role_id (FK) │         │ name        │
│ password    │         └──────────────┘         │ description │
│ email       │                                  └─────────────┘
│ name        │
│ profile_pic │
│ created_at  │
│ updated_at  │
└─────────────┘
      │
      │
      ├──────────────────────────────────┐
      │                                  │
      ▼                                  ▼
┌─────────────┐                   ┌──────────────┐
│   words     │                   │  journeys    │
│─────────────│                   │──────────────│
│ id (PK)     │                   │ id (PK)      │
│ english     │                   │ name         │
│ cantonese   │                   │ description  │
│ romanization│                   │ created_by   │
│ audio_url   │                   │ created_at   │
│ image_url   │                   │ updated_at   │
│ created_by  │                   └──────────────┘
│ created_at  │                          │
│ updated_at  │                          │
└─────────────┘                          │
      │                                  │
      │                                  ▼
      │                         ┌──────────────────┐
      │                         │ journey_topics   │
      │                         │──────────────────│
      │                         │ id (PK)          │
      │                         │ journey_id (FK)  │
      │                         │ topic_id (FK)    │
      │                         │ sequence_order   │
      │                         └──────────────────┘
      │                                  │
      │                                  │
      ▼                                  ▼
┌──────────────┐                  ┌─────────────┐
│ topic_words  │                  │   topics    │
│──────────────│                  │─────────────│
│ id (PK)      │<─────────────────│ id (PK)     │
│ topic_id(FK) │                  │ name        │
│ word_id (FK) │                  │ description │
│ sequence     │                  │ level       │
└──────────────┘                  │ created_by  │
                                  │ created_at  │
                                  │ updated_at  │
                                  └─────────────┘
                                        │
                                        │
                                        ▼
                                  ┌──────────────┐
                                  │topic_quizzes │
                                  │──────────────│
                                  │ id (PK)      │
                                  │ topic_id(FK) │
                                  │ question     │
                                  │ correct_ans  │
                                  │ option_a     │
                                  │ option_b     │
                                  │ option_c     │
                                  │ option_d     │
                                  └──────────────┘

┌──────────────────┐       ┌────────────────────┐
│ user_journeys    │       │ user_progress      │
│──────────────────│       │────────────────────│
│ id (PK)          │       │ id (PK)            │
│ user_id (FK)     │       │ user_id (FK)       │
│ journey_id (FK)  │       │ topic_id (FK)      │
│ assigned_by (FK) │       │ journey_id (FK)    │
│ status           │       │ completed          │
│ assigned_at      │       │ score              │
│ completed_at     │       │ time_spent_mins    │
└──────────────────┘       │ completed_at       │
                           └────────────────────┘

┌──────────────────┐       ┌────────────────────┐
│ user_achievements│       │  achievements      │
│──────────────────│       │────────────────────│
│ id (PK)          │       │ id (PK)            │
│ user_id (FK)     │       │ name               │
│ achievement_id   │──────>│ description        │
│ earned_at        │       │ badge_icon_url     │
└──────────────────┘       │ criteria_type      │
                           │ criteria_value     │
                           └────────────────────┘

┌──────────────────┐       ┌────────────────────┐
│ user_bookmarks   │       │   user_notes       │
│──────────────────│       │────────────────────│
│ id (PK)          │       │ id (PK)            │
│ user_id (FK)     │       │ user_id (FK)       │
│ word_id (FK)     │       │ word_id (FK)       │
│ topic_id (FK)    │       │ note_text          │
│ created_at       │       │ created_at         │
└──────────────────┘       │ updated_at         │
                           └────────────────────┘

┌──────────────────────────┐
│ spaced_repetition_items  │
│──────────────────────────│
│ id (PK)                  │
│ user_id (FK)             │
│ word_id (FK)             │
│ ease_factor              │
│ interval_days            │
│ repetitions              │
│ next_review_date         │
│ last_reviewed_at         │
└──────────────────────────┘

┌──────────────────┐
│ learning_sessions│
│──────────────────│
│ id (PK)          │
│ user_id (FK)     │
│ started_at       │
│ ended_at         │
│ duration_mins    │
└──────────────────┘
```

---

## 2. Table Definitions

### 2.1 User Management

#### `users`
Primary table for all user accounts.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(100) NOT NULL,
    profile_pic_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

**Fields**:
- `id`: Auto-incrementing primary key
- `username`: Unique login identifier
- `password_hash`: Bcrypt hashed password
- `email`: Optional email address
- `name`: Display name
- `profile_pic_url`: URL to profile picture (local or cloud storage)
- `created_at`: Account creation timestamp
- `updated_at`: Last profile update timestamp

---

#### `roles`
Defines user roles in the system.

```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO roles (name, description) VALUES
    ('learner', 'Student learning languages'),
    ('teacher', 'Teacher managing content and learners'),
    ('admin', 'System administrator');
```

**Fields**:
- `id`: Primary key
- `name`: Role name (learner, teacher, admin)
- `description`: Role description

---

#### `user_roles`
Many-to-many relationship between users and roles.

```sql
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
```

---

### 2.2 Content Management

#### `words`
Vocabulary words with translations and media.

```sql
CREATE TABLE words (
    id SERIAL PRIMARY KEY,
    english TEXT NOT NULL,
    cantonese TEXT NOT NULL,
    romanization VARCHAR(100),
    audio_url VARCHAR(500),
    image_url VARCHAR(500),
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_words_created_by ON words(created_by);
CREATE INDEX idx_words_english ON words USING gin(to_tsvector('english', english));
CREATE INDEX idx_words_cantonese ON words(cantonese);
```

**Fields**:
- `id`: Primary key
- `english`: English translation
- `cantonese`: Cantonese text (traditional Chinese)
- `romanization`: Jyutping or Yale romanization
- `audio_url`: URL to pronunciation audio file
- `image_url`: URL to associated image
- `notes`: Additional notes for teachers
- `created_by`: User ID of creator (teacher)

---

#### `topics`
Learning topics containing groups of words.

```sql
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_topics_level ON topics(level);
CREATE INDEX idx_topics_created_by ON topics(created_by);
```

**Fields**:
- `id`: Primary key
- `name`: Topic name (e.g., "Colors", "Food", "Family")
- `description`: Detailed description
- `level`: Difficulty level (beginner, intermediate, advanced)
- `created_by`: User ID of creator

---

#### `topic_words`
Many-to-many relationship between topics and words.

```sql
CREATE TABLE topic_words (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(topic_id, word_id)
);

CREATE INDEX idx_topic_words_topic_id ON topic_words(topic_id);
CREATE INDEX idx_topic_words_word_id ON topic_words(word_id);
```

**Fields**:
- `sequence_order`: Order of word within topic for structured learning

---

#### `journeys`
Learning paths containing ordered topics.

```sql
CREATE TABLE journeys (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journeys_created_by ON journeys(created_by);
```

**Fields**:
- `id`: Primary key
- `name`: Journey name (e.g., "My First 100 Words", "Everyday Conversations")
- `description`: Journey description

---

#### `journey_topics`
Many-to-many relationship defining topic order in journeys.

```sql
CREATE TABLE journey_topics (
    id SERIAL PRIMARY KEY,
    journey_id INTEGER NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(journey_id, topic_id)
);

CREATE INDEX idx_journey_topics_journey_id ON journey_topics(journey_id);
CREATE INDEX idx_journey_topics_topic_id ON journey_topics(topic_id);
CREATE INDEX idx_journey_topics_sequence ON journey_topics(journey_id, sequence_order);
```

**Fields**:
- `sequence_order`: Order of topic within journey (enforces sequential learning)

---

### 2.3 Assessment

#### `topic_quizzes`
Multiple choice questions for topics.

```sql
CREATE TABLE topic_quizzes (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    word_id INTEGER REFERENCES words(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('translation', 'listening', 'image')),
    question_text TEXT NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_topic_quizzes_topic_id ON topic_quizzes(topic_id);
CREATE INDEX idx_topic_quizzes_word_id ON topic_quizzes(word_id);
```

**Fields**:
- `question_type`: Type of question (translation, listening, image-based)
- `word_id`: Optional reference to specific word being tested
- `correct_answer`: Must match one of the options (a, b, c, or d)

---

### 2.4 User Progress & Assignments

#### `user_journeys`
Assignment of journeys to learners.

```sql
CREATE TABLE user_journeys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    journey_id INTEGER NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    assigned_by INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, journey_id)
);

CREATE INDEX idx_user_journeys_user_id ON user_journeys(user_id);
CREATE INDEX idx_user_journeys_journey_id ON user_journeys(journey_id);
CREATE INDEX idx_user_journeys_status ON user_journeys(status);
```

---

#### `user_progress`
Tracks learner progress on topics and journeys.

```sql
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    journey_id INTEGER REFERENCES journeys(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('flashcard', 'pronunciation', 'conversation', 'quiz')),
    completed BOOLEAN DEFAULT FALSE,
    score DECIMAL(5,2),
    max_score DECIMAL(5,2),
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_topic_id ON user_progress(topic_id);
CREATE INDEX idx_user_progress_journey_id ON user_progress(journey_id);
CREATE INDEX idx_user_progress_completed ON user_progress(completed);
CREATE INDEX idx_user_progress_activity_type ON user_progress(activity_type);
```

**Fields**:
- `activity_type`: Type of learning activity completed
- `score`: Points earned (for quizzes)
- `max_score`: Maximum possible points
- `time_spent_seconds`: Duration of activity

---

### 2.5 Gamification

#### `achievements`
Defines available achievements and badges.

```sql
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    badge_icon_url VARCHAR(500),
    criteria_type VARCHAR(50) NOT NULL CHECK (criteria_type IN ('topic_complete', 'journey_complete', 'quiz_score', 'streak', 'total_words')),
    criteria_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed achievements
INSERT INTO achievements (name, description, criteria_type, criteria_value, badge_icon_url) VALUES
    ('First Topic', 'Complete your first topic', 'topic_complete', 1, '/badges/first-topic.svg'),
    ('Journey Beginner', 'Complete your first journey', 'journey_complete', 1, '/badges/first-journey.svg'),
    ('Perfect Score', 'Get 100% on a quiz', 'quiz_score', 100, '/badges/perfect-score.svg'),
    ('Word Master 50', 'Learn 50 words', 'total_words', 50, '/badges/word-master-50.svg'),
    ('Word Master 100', 'Learn 100 words', 'total_words', 100, '/badges/word-master-100.svg');
```

---

#### `user_achievements`
Tracks achievements earned by users.

```sql
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
```

---

### 2.6 Personalization

#### `user_bookmarks`
Words and topics bookmarked by users.

```sql
CREATE TABLE user_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id INTEGER REFERENCES words(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (word_id IS NOT NULL AND topic_id IS NULL) OR
        (word_id IS NULL AND topic_id IS NOT NULL)
    )
);

CREATE INDEX idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_word_id ON user_bookmarks(word_id);
CREATE INDEX idx_user_bookmarks_topic_id ON user_bookmarks(topic_id);
```

---

#### `user_notes`
Personal notes on words (Nice-to-Have).

```sql
CREATE TABLE user_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, word_id)
);

CREATE INDEX idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX idx_user_notes_word_id ON user_notes(word_id);
```

---

### 2.7 Spaced Repetition System

#### `spaced_repetition_items`
SRS algorithm data for vocabulary review.

```sql
CREATE TABLE spaced_repetition_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    ease_factor DECIMAL(4,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    next_review_date DATE NOT NULL,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, word_id)
);

CREATE INDEX idx_srs_items_user_id ON spaced_repetition_items(user_id);
CREATE INDEX idx_srs_items_next_review ON spaced_repetition_items(user_id, next_review_date);
```

**Fields**:
- `ease_factor`: SM-2 algorithm ease factor (2.5 default)
- `interval_days`: Days until next review
- `repetitions`: Number of successful reviews
- `next_review_date`: Date when word should be reviewed

---

### 2.8 Analytics

#### `learning_sessions`
Tracks user learning sessions for analytics.

```sql
CREATE TABLE learning_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    activities_completed INTEGER DEFAULT 0
);

CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_started_at ON learning_sessions(started_at);
```

---

## 3. Views for Analytics

### 3.1 User Progress Summary

```sql
CREATE VIEW v_user_progress_summary AS
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    COUNT(DISTINCT CASE WHEN up.activity_type = 'quiz' AND up.completed = TRUE THEN up.topic_id END) AS topics_completed,
    COUNT(DISTINCT CASE WHEN uj.status = 'completed' THEN uj.journey_id END) AS journeys_completed,
    COALESCE(SUM(up.time_spent_seconds), 0) / 60 AS total_time_minutes,
    COALESCE(AVG(CASE WHEN up.activity_type = 'quiz' THEN (up.score / NULLIF(up.max_score, 0) * 100) END), 0) AS avg_quiz_accuracy,
    COUNT(DISTINCT ua.achievement_id) AS achievements_earned
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_journeys uj ON u.id = uj.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, u.name;
```

### 3.2 Topic Performance

```sql
CREATE VIEW v_topic_performance AS
SELECT 
    t.id AS topic_id,
    t.name AS topic_name,
    t.level,
    COUNT(DISTINCT up.user_id) AS students_attempted,
    COUNT(DISTINCT CASE WHEN up.completed = TRUE THEN up.user_id END) AS students_completed,
    COALESCE(AVG(CASE WHEN up.activity_type = 'quiz' THEN (up.score / NULLIF(up.max_score, 0) * 100) END), 0) AS avg_quiz_score,
    COALESCE(AVG(up.time_spent_seconds), 0) / 60 AS avg_time_minutes
FROM topics t
LEFT JOIN user_progress up ON t.id = up.topic_id
GROUP BY t.id, t.name, t.level;
```

---

## 4. Database Functions & Triggers

### 4.1 Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journeys_updated_at BEFORE UPDATE ON journeys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 Achievement Auto-Grant Function

```sql
CREATE OR REPLACE FUNCTION check_and_grant_achievements()
RETURNS TRIGGER AS $$
DECLARE
    topic_count INTEGER;
    journey_count INTEGER;
    word_count INTEGER;
BEGIN
    -- Check topic completion achievements
    IF NEW.activity_type = 'quiz' AND NEW.completed = TRUE THEN
        SELECT COUNT(DISTINCT topic_id) INTO topic_count
        FROM user_progress
        WHERE user_id = NEW.user_id AND activity_type = 'quiz' AND completed = TRUE;
        
        INSERT INTO user_achievements (user_id, achievement_id)
        SELECT NEW.user_id, id FROM achievements
        WHERE criteria_type = 'topic_complete' AND criteria_value = topic_count
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_grant_achievements
AFTER INSERT ON user_progress
FOR EACH ROW EXECUTE FUNCTION check_and_grant_achievements();
```

---

## 5. Initial Seed Data

```sql
-- Create default admin user (password should be changed)
INSERT INTO users (username, password_hash, name, email)
VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'Administrator', 'admin@learnspeak.local');

-- Assign admin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'admin';

-- Sample topic levels enum values are enforced by CHECK constraint
-- beginner, intermediate, advanced
```

---

## 6. Database Optimization & Indexing Strategy

### 6.1 Query Optimization
- Full-text search index on `words.english` for search functionality
- Composite indexes on foreign keys frequently used in joins
- Indexes on status and date fields for filtering

### 6.2 Partitioning (Future)
- Consider partitioning `user_progress` by date when data grows
- Consider partitioning `learning_sessions` by month

### 6.3 Caching Strategy
- Cache frequently accessed words and topics
- Cache user progress summaries
- Cache achievement criteria

---

## 7. Backup & Maintenance

### 7.1 Backup Strategy
```bash
# Daily backup
pg_dump learnspeak_db > backup_$(date +%Y%m%d).sql

# Retention: 30 days
```

### 7.2 Vacuum & Analyze
```sql
-- Weekly maintenance
VACUUM ANALYZE;

-- Reindex monthly
REINDEX DATABASE learnspeak_db;
```

---

## 8. Migration Notes

### Version Control
- Use migration tool: golang-migrate or similar
- Sequential versioning: `001_initial_schema.up.sql`
- Always provide `.down.sql` for rollbacks

### Migration Order
1. Core tables: users, roles, user_roles
2. Content tables: words, topics, journeys, relationships
3. Progress tables: user_progress, user_journeys
4. Gamification: achievements, user_achievements
5. Personalization: bookmarks, notes, SRS
6. Views and functions
7. Seed data

---

## Appendix: Sample Queries

### Get user's assigned journeys with progress
```sql
SELECT 
    j.id,
    j.name,
    uj.status,
    COUNT(jt.id) AS total_topics,
    COUNT(CASE WHEN up.completed = TRUE THEN 1 END) AS completed_topics
FROM user_journeys uj
JOIN journeys j ON uj.journey_id = j.id
JOIN journey_topics jt ON j.id = jt.journey_id
LEFT JOIN user_progress up ON up.topic_id = jt.topic_id AND up.user_id = uj.user_id
WHERE uj.user_id = $1
GROUP BY j.id, j.name, uj.status;
```

### Get words due for SRS review
```sql
SELECT w.*, sri.next_review_date, sri.interval_days
FROM spaced_repetition_items sri
JOIN words w ON sri.word_id = w.id
WHERE sri.user_id = $1 AND sri.next_review_date <= CURRENT_DATE
ORDER BY sri.next_review_date ASC
LIMIT 20;
```

### Get topic with all words
```sql
SELECT 
    t.*,
    json_agg(
        json_build_object(
            'id', w.id,
            'english', w.english,
            'cantonese', w.cantonese,
            'romanization', w.romanization,
            'audio_url', w.audio_url,
            'image_url', w.image_url
        ) ORDER BY tw.sequence_order
    ) AS words
FROM topics t
JOIN topic_words tw ON t.id = tw.topic_id
JOIN words w ON tw.word_id = w.id
WHERE t.id = $1
GROUP BY t.id;
```
