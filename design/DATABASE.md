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
│ profile_pic │                                  ┌─────────────┐
│ created_at  │                                  │  languages  │
│ updated_at  │                                  │─────────────│
└─────────────┘                                  │ id (PK)     │
      │                                          │ code        │
      │                                          │ name        │
      │                                          │ direction   │
      │                                          └─────────────┘
      │                                                  │
      ├──────────────────────────────────┐              │
      │                                  │              │
      ▼                                  ▼              ▼
┌─────────────┐                   ┌──────────────┐    │
│   words     │                   │  journeys    │    │
│─────────────│                   │──────────────│    │
│ id (PK)     │                   │ id (PK)      │    │
│ base_word   │                   │ name         │    │
│ image_url   │                   │ description  │    │
│ notes       │                   │ language_id  │────┘
│ created_by  │                   │ created_by   │
│ created_at  │                   │ created_at   │
│ updated_at  │                   │ updated_at   │
└─────────────┘                   └──────────────┘
      │                                  │
      │                                  │
      ▼                                  ▼
┌──────────────────┐            ┌──────────────────┐
│word_translations │            │ journey_topics   │
│──────────────────│            │──────────────────│
│ id (PK)          │            │ id (PK)          │
│ word_id (FK)     │            │ journey_id (FK)  │
│ language_id (FK) │            │ topic_id (FK)    │
│ translation      │            │ sequence_order   │
│ romanization     │            └──────────────────┘
│ audio_url        │                     │
│ created_at       │                     │
│ updated_at       │                     ▼
└──────────────────┘              ┌─────────────┐
      │                           │   topics    │
      │                           │─────────────│
      │                           │ id (PK)     │
      ▼                           │ name        │
┌──────────────┐                  │ description │
│ topic_words  │                  │ level       │
│──────────────│<─────────────────│ language_id │
│ id (PK)      │                  │ created_by  │
│ topic_id(FK) │                  │ created_at  │
│ word_id (FK) │                  │ updated_at  │
│ sequence     │                  └─────────────┘
└──────────────┘                        │
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

#### `languages`
Supported languages in the platform.

```sql
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    direction VARCHAR(3) DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_languages_code ON languages(code);
CREATE INDEX idx_languages_active ON languages(is_active);

-- Seed data for supported languages
INSERT INTO languages (code, name, native_name, direction) VALUES
    ('en', 'English', 'English', 'ltr'),
    ('zh-HK', 'Cantonese (Traditional)', '廣東話（繁體）', 'ltr'),
    ('zh-CN', 'Mandarin (Simplified)', '普通话（简体）', 'ltr'),
    ('es', 'Spanish', 'Español', 'ltr'),
    ('fr', 'French', 'Français', 'ltr'),
    ('ja', 'Japanese', '日本語', 'ltr'),
    ('ko', 'Korean', '한국어', 'ltr');
```

**Fields**:
- `id`: Primary key
- `code`: ISO 639-1 language code with optional region (e.g., 'en', 'zh-HK')
- `name`: English name of the language
- `native_name`: Language name in its native script
- `direction`: Text direction (ltr = left-to-right, rtl = right-to-left)
- `is_active`: Whether the language is currently supported

---

#### `words`
Base vocabulary words (language-agnostic).

```sql
CREATE TABLE words (
    id SERIAL PRIMARY KEY,
    base_word VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_words_created_by ON words(created_by);
CREATE INDEX idx_words_base_word ON words(base_word);
```

**Fields**:
- `id`: Primary key
- `base_word`: Reference word (typically English or primary language)
- `image_url`: URL to associated image (shared across all languages)
- `notes`: Additional notes for teachers (language-agnostic)
- `created_by`: User ID of creator (teacher)

**Design Rationale**: The `words` table now stores language-agnostic information. All language-specific content (translations, romanization, audio) is moved to the `word_translations` table.

---

#### `word_translations`
Language-specific translations and pronunciations for words.

```sql
CREATE TABLE word_translations (
    id SERIAL PRIMARY KEY,
    word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    translation TEXT NOT NULL,
    romanization VARCHAR(255),
    audio_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(word_id, language_id)
);

CREATE INDEX idx_word_translations_word_id ON word_translations(word_id);
CREATE INDEX idx_word_translations_language_id ON word_translations(language_id);
CREATE INDEX idx_word_translations_translation ON word_translations USING gin(to_tsvector('simple', translation));
```

**Fields**:
- `id`: Primary key
- `word_id`: Reference to base word
- `language_id`: Reference to language
- `translation`: Translation in the target language
- `romanization`: Romanization/transliteration (e.g., Jyutping for Cantonese, Pinyin for Mandarin, Romaji for Japanese)
- `audio_url`: URL to pronunciation audio file for this specific language

**Design Rationale**: This structure allows:
- A single word to have translations in multiple languages
- Each translation to have its own audio pronunciation
- Language-specific romanization systems
- Easy addition of new languages without schema changes

**Example Data**:
```sql
-- Word: Apple
INSERT INTO words (id, base_word, image_url, created_by) 
VALUES (1, 'apple', '/images/apple.jpg', 1);

-- English translation
INSERT INTO word_translations (word_id, language_id, translation, romanization, audio_url)
VALUES (1, 1, 'apple', NULL, '/audio/en/apple.mp3');

-- Cantonese translation
INSERT INTO word_translations (word_id, language_id, translation, romanization, audio_url)
VALUES (1, 2, '蘋果', 'ping4 gwo2', '/audio/zh-HK/apple.mp3');

-- Mandarin translation
INSERT INTO word_translations (word_id, language_id, translation, romanization, audio_url)
VALUES (1, 3, '苹果', 'píng guǒ', '/audio/zh-CN/apple.mp3');
```

---

#### `topics`
Learning topics containing groups of words.

```sql
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    language_id INTEGER NOT NULL REFERENCES languages(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_topics_level ON topics(level);
CREATE INDEX idx_topics_language_id ON topics(language_id);
CREATE INDEX idx_topics_created_by ON topics(created_by);
CREATE INDEX idx_topics_language_level ON topics(language_id, level);
```

**Fields**:
- `id`: Primary key
- `name`: Topic name (e.g., "Colors", "Food", "Family")
- `description`: Detailed description
- `level`: Difficulty level (beginner, intermediate, advanced)
- `language_id`: Target language being taught in this topic
- `created_by`: User ID of creator

**Design Rationale**: Topics are now language-specific. A "Colors" topic for Cantonese is separate from a "Colors" topic for Mandarin or Spanish. This allows:
- Language-specific teaching progression
- Different word selections per language
- Language-specific difficulty levels

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
    language_id INTEGER NOT NULL REFERENCES languages(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journeys_language_id ON journeys(language_id);
CREATE INDEX idx_journeys_created_by ON journeys(created_by);
CREATE INDEX idx_journeys_language_creator ON journeys(language_id, created_by);
```

**Fields**:
- `id`: Primary key
- `name`: Journey name (e.g., "My First 100 Words", "Everyday Conversations")
- `description`: Journey description
- `language_id`: Target language for this learning journey
- `created_by`: User ID of creator

**Design Rationale**: Journeys are now language-specific. This ensures:
- A journey only contains topics in the same language
- Learners can have separate progress for different languages
- Teachers can create parallel journeys for different languages

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

CREATE TRIGGER update_word_translations_updated_at BEFORE UPDATE ON word_translations
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
-- Languages are already seeded in the languages table definition

-- Create default admin user (password should be changed)
INSERT INTO users (username, password_hash, name, email)
VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'Administrator', 'admin@learnspeak.local');

-- Assign admin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'admin';

-- Sample word with translations
-- Word: Hello
INSERT INTO words (id, base_word, image_url, created_by, notes)
VALUES (1, 'hello', '/images/hello.jpg', 1, 'Common greeting');

-- English
INSERT INTO word_translations (word_id, language_id, translation, audio_url)
SELECT 1, id, 'hello', '/audio/en/hello.mp3'
FROM languages WHERE code = 'en';

-- Cantonese
INSERT INTO word_translations (word_id, language_id, translation, romanization, audio_url)
SELECT 1, id, '你好', 'nei5 hou2', '/audio/zh-HK/hello.mp3'
FROM languages WHERE code = 'zh-HK';

-- Mandarin
INSERT INTO word_translations (word_id, language_id, translation, romanization, audio_url)
SELECT 1, id, '你好', 'nǐ hǎo', '/audio/zh-CN/hello.mp3'
FROM languages WHERE code = 'zh-CN';

-- Spanish
INSERT INTO word_translations (word_id, language_id, translation, audio_url)
SELECT 1, id, 'hola', '/audio/es/hello.mp3'
FROM languages WHERE code = 'es';
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

### Get user's assigned journeys with progress (language-specific)
```sql
SELECT 
    j.id,
    j.name,
    l.name AS language_name,
    l.code AS language_code,
    uj.status,
    COUNT(jt.id) AS total_topics,
    COUNT(CASE WHEN up.completed = TRUE THEN 1 END) AS completed_topics
FROM user_journeys uj
JOIN journeys j ON uj.journey_id = j.id
JOIN languages l ON j.language_id = l.id
JOIN journey_topics jt ON j.id = jt.journey_id
LEFT JOIN user_progress up ON up.topic_id = jt.topic_id AND up.user_id = uj.user_id
WHERE uj.user_id = $1
GROUP BY j.id, j.name, l.name, l.code, uj.status
ORDER BY l.name, j.name;
```

### Get words due for SRS review with translations
```sql
SELECT 
    w.id,
    w.base_word,
    w.image_url,
    wt.translation,
    wt.romanization,
    wt.audio_url,
    l.name AS language_name,
    sri.next_review_date,
    sri.interval_days,
    sri.ease_factor
FROM spaced_repetition_items sri
JOIN words w ON sri.word_id = w.id
JOIN word_translations wt ON w.id = wt.word_id
JOIN languages l ON wt.language_id = l.id
WHERE sri.user_id = $1 
  AND sri.next_review_date <= CURRENT_DATE
  AND wt.language_id = $2
ORDER BY sri.next_review_date ASC
LIMIT 20;
```

### Get topic with all words and translations
```sql
SELECT 
    t.id,
    t.name,
    t.level,
    t.description,
    l.name AS language_name,
    l.code AS language_code,
    json_agg(
        json_build_object(
            'id', w.id,
            'base_word', w.base_word,
            'translation', wt.translation,
            'romanization', wt.romanization,
            'audio_url', wt.audio_url,
            'image_url', w.image_url,
            'sequence_order', tw.sequence_order
        ) ORDER BY tw.sequence_order
    ) AS words
FROM topics t
JOIN languages l ON t.language_id = l.id
JOIN topic_words tw ON t.id = tw.topic_id
JOIN words w ON tw.word_id = w.id
JOIN word_translations wt ON w.id = wt.word_id AND wt.language_id = t.language_id
WHERE t.id = $1
GROUP BY t.id, t.name, t.level, t.description, l.name, l.code;
```

### Get all translations for a word
```sql
SELECT 
    w.id,
    w.base_word,
    w.image_url,
    l.code AS language_code,
    l.name AS language_name,
    wt.translation,
    wt.romanization,
    wt.audio_url
FROM words w
JOIN word_translations wt ON w.id = wt.word_id
JOIN languages l ON wt.language_id = l.id
WHERE w.id = $1
ORDER BY l.name;
```

### Get learner's progress by language
```sql
SELECT 
    l.code AS language_code,
    l.name AS language_name,
    COUNT(DISTINCT t.id) AS total_topics,
    COUNT(DISTINCT CASE WHEN up.completed = TRUE THEN t.id END) AS completed_topics,
    COUNT(DISTINCT j.id) AS total_journeys,
    COUNT(DISTINCT CASE WHEN uj.status = 'completed' THEN j.id END) AS completed_journeys,
    COALESCE(SUM(up.time_spent_seconds), 0) / 60 AS total_time_minutes
FROM languages l
LEFT JOIN topics t ON l.id = t.language_id
LEFT JOIN user_progress up ON t.id = up.topic_id AND up.user_id = $1
LEFT JOIN journeys j ON l.id = j.language_id
LEFT JOIN user_journeys uj ON j.id = uj.journey_id AND uj.user_id = $1
WHERE l.is_active = TRUE
GROUP BY l.code, l.name
ORDER BY l.name;
```

### Search words across languages
```sql
SELECT 
    w.id,
    w.base_word,
    w.image_url,
    json_agg(
        json_build_object(
            'language_code', l.code,
            'language_name', l.name,
            'translation', wt.translation,
            'romanization', wt.romanization,
            'audio_url', wt.audio_url
        )
    ) AS translations
FROM words w
JOIN word_translations wt ON w.id = wt.word_id
JOIN languages l ON wt.language_id = l.id
WHERE wt.translation ILIKE '%' || $1 || '%'
   OR w.base_word ILIKE '%' || $1 || '%'
GROUP BY w.id, w.base_word, w.image_url
LIMIT 50;
```

### Get available journeys for a specific language
```sql
SELECT 
    j.id,
    j.name,
    j.description,
    l.name AS language_name,
    l.code AS language_code,
    COUNT(DISTINCT jt.topic_id) AS topic_count,
    COUNT(DISTINCT tw.word_id) AS total_words,
    u.name AS created_by_name
FROM journeys j
JOIN languages l ON j.language_id = l.id
JOIN users u ON j.created_by = u.id
LEFT JOIN journey_topics jt ON j.id = jt.journey_id
LEFT JOIN topic_words tw ON jt.topic_id = tw.topic_id
WHERE l.code = $1
  AND l.is_active = TRUE
GROUP BY j.id, j.name, j.description, l.name, l.code, u.name
ORDER BY j.created_at DESC;
```

---

## Multi-Language Migration Strategy

### Phase 1: Add Language Support (Current Sprint)
1. Create `languages` table with seed data
2. Modify `words` table (rename columns, add `base_word`)
3. Create `word_translations` table
4. Add `language_id` to `topics` and `journeys`
5. Migrate existing Cantonese data to new structure

### Phase 2: Data Migration Script
```sql
-- Migration script for existing Cantonese data
BEGIN;

-- Get Cantonese language ID
DO $$
DECLARE
    cantonese_id INTEGER;
    english_id INTEGER;
BEGIN
    SELECT id INTO cantonese_id FROM languages WHERE code = 'zh-HK';
    SELECT id INTO english_id FROM languages WHERE code = 'en';
    
    -- Migrate words (assuming old schema had english, cantonese, romanization, audio_url)
    -- Step 1: Rename old words table
    ALTER TABLE words RENAME TO words_old;
    
    -- Step 2: Create new words table (already done above)
    
    -- Step 3: Migrate data
    INSERT INTO words (id, base_word, image_url, notes, created_by, created_at, updated_at)
    SELECT id, english, image_url, notes, created_by, created_at, updated_at
    FROM words_old;
    
    -- Step 4: Create English translations
    INSERT INTO word_translations (word_id, language_id, translation, audio_url, created_at)
    SELECT id, english_id, english, NULL, created_at
    FROM words_old;
    
    -- Step 5: Create Cantonese translations
    INSERT INTO word_translations (word_id, language_id, translation, romanization, audio_url, created_at)
    SELECT id, cantonese_id, cantonese, romanization, audio_url, created_at
    FROM words_old;
    
    -- Step 6: Update topics to use Cantonese
    UPDATE topics SET language_id = cantonese_id WHERE language_id IS NULL;
    
    -- Step 7: Update journeys to use Cantonese
    UPDATE journeys SET language_id = cantonese_id WHERE language_id IS NULL;
    
    -- Step 8: Drop old table
    DROP TABLE words_old;
END $$;

COMMIT;
```

### Phase 3: Add Additional Languages
- Add new language records to `languages` table
- Teachers create content (words, topics, journeys) for new languages
- System automatically supports new languages without schema changes

---

## Scalability Considerations

### Multi-Language Scalability Features

1. **Language-Agnostic Word IDs**: Words can be shared across languages with different translations
2. **Independent Language Paths**: Each language has its own topics and journeys
3. **Flexible Romanization**: Different romanization systems per language (Jyutping, Pinyin, Romaji, etc.)
4. **Language-Specific Audio**: Each translation has its own pronunciation audio
5. **Easy Language Addition**: New languages require only a row in `languages` table
6. **Cross-Language Word Reuse**: Same word concept (with same image) can have translations in 10+ languages
7. **Language Filtering**: All queries can be efficiently filtered by `language_id`
8. **Mixed-Language Learning**: Users can learn multiple languages simultaneously with separate progress tracking

### Database Performance at Scale

- **Indexed Foreign Keys**: All language_id columns are indexed
- **Composite Indexes**: `(language_id, level)` for topics, `(language_id, created_by)` for journeys
- **Unique Constraints**: Prevent duplicate translations for same word-language pair
- **Efficient Joins**: Normalized structure allows efficient joins without data duplication

### Future Expansion Examples

**Adding Japanese**:
```sql
-- Add Japanese
INSERT INTO languages (code, name, native_name) 
VALUES ('ja', 'Japanese', '日本語');

-- Reuse existing word, add Japanese translation
INSERT INTO word_translations (word_id, language_id, translation, romanization, audio_url)
VALUES (1, (SELECT id FROM languages WHERE code = 'ja'), 'こんにちは', 'konnichiwa', '/audio/ja/hello.mp3');
```

**Adding Arabic (RTL language)**:
```sql
INSERT INTO languages (code, name, native_name, direction) 
VALUES ('ar', 'Arabic', 'العربية', 'rtl');
```


