-- Migration: 001_initial_schema
-- Created: 2025-10-11
-- Description: Initial database schema with all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USER MANAGEMENT
-- ============================================================================

-- Roles table (may already exist from GORM)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table (already exists, but ensuring it has all columns)
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_pic_url VARCHAR(500);

-- User roles junction table (may already exist from GORM)
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- ============================================================================
-- 2. CONTENT MANAGEMENT
-- ============================================================================

-- Languages table
CREATE TABLE IF NOT EXISTS languages (
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

-- Words table (base vocabulary, language-agnostic)
CREATE TABLE IF NOT EXISTS words (
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

-- Word translations (language-specific)
CREATE TABLE IF NOT EXISTS word_translations (
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

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
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

-- Topic-Word junction table
CREATE TABLE IF NOT EXISTS topic_words (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(topic_id, word_id)
);

CREATE INDEX idx_topic_words_topic_id ON topic_words(topic_id);
CREATE INDEX idx_topic_words_word_id ON topic_words(word_id);

-- Journeys table
CREATE TABLE IF NOT EXISTS journeys (
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

-- Journey-Topic junction table
CREATE TABLE IF NOT EXISTS journey_topics (
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

-- ============================================================================
-- 3. ASSESSMENT
-- ============================================================================

-- Topic quizzes
CREATE TABLE IF NOT EXISTS topic_quizzes (
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

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    context TEXT,
    language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_language_id ON conversations(language_id);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversations_difficulty ON conversations(difficulty_level);

-- Conversation lines
CREATE TABLE IF NOT EXISTS conversation_lines (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    speaker_role VARCHAR(100) NOT NULL,
    english_text TEXT NOT NULL,
    target_text TEXT NOT NULL,
    romanization TEXT,
    audio_url VARCHAR(500),
    word_id INTEGER REFERENCES words(id) ON DELETE SET NULL,
    is_learner_line BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, sequence_order)
);

CREATE INDEX idx_conversation_lines_conversation_id ON conversation_lines(conversation_id);
CREATE INDEX idx_conversation_lines_word_id ON conversation_lines(word_id);
CREATE INDEX idx_conversation_lines_sequence ON conversation_lines(conversation_id, sequence_order);

-- Topic-Conversation junction table
CREATE TABLE IF NOT EXISTS topic_conversations (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(topic_id, conversation_id)
);

CREATE INDEX idx_topic_conversations_topic_id ON topic_conversations(topic_id);
CREATE INDEX idx_topic_conversations_conversation_id ON topic_conversations(conversation_id);
CREATE INDEX idx_topic_conversations_sequence ON topic_conversations(topic_id, sequence_order);

-- ============================================================================
-- 4. USER PROGRESS & ASSIGNMENTS
-- ============================================================================

-- User journeys (assignments)
CREATE TABLE IF NOT EXISTS user_journeys (
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

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
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

-- User conversation progress
CREATE TABLE IF NOT EXISTS user_conversation_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
    completed BOOLEAN DEFAULT FALSE,
    replay_count INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, conversation_id)
);

CREATE INDEX idx_user_conversation_progress_user_id ON user_conversation_progress(user_id);
CREATE INDEX idx_user_conversation_progress_conversation_id ON user_conversation_progress(conversation_id);
CREATE INDEX idx_user_conversation_progress_topic_id ON user_conversation_progress(topic_id);
CREATE INDEX idx_user_conversation_progress_completed ON user_conversation_progress(completed);

-- ============================================================================
-- 5. GAMIFICATION
-- ============================================================================

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    badge_icon_url VARCHAR(500),
    criteria_type VARCHAR(50) NOT NULL CHECK (criteria_type IN ('topic_complete', 'journey_complete', 'quiz_score', 'streak', 'total_words')),
    criteria_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- ============================================================================
-- 6. PERSONALIZATION
-- ============================================================================

-- User bookmarks
CREATE TABLE IF NOT EXISTS user_bookmarks (
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

-- User notes
CREATE TABLE IF NOT EXISTS user_notes (
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

-- ============================================================================
-- 7. SPACED REPETITION SYSTEM
-- ============================================================================

-- Spaced repetition items
CREATE TABLE IF NOT EXISTS spaced_repetition_items (
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

-- ============================================================================
-- 8. ANALYTICS
-- ============================================================================

-- Learning sessions
CREATE TABLE IF NOT EXISTS learning_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    activities_completed INTEGER DEFAULT 0
);

CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_started_at ON learning_sessions(started_at);
