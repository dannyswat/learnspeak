-- View: User progress summary
CREATE OR REPLACE VIEW v_user_progress_summary AS
SELECT 
    u.id AS user_id, 
    u.username, 
    u.name AS user_name,
    COUNT(DISTINCT CASE WHEN up.activity_type = 'quiz' AND up.completed = TRUE THEN up.topic_id END) AS topics_completed,
    COUNT(DISTINCT CASE WHEN uj.status = 'completed' THEN uj.journey_id END) AS journeys_completed,
    COALESCE(SUM(up.time_spent_seconds), 0) / 60 AS total_time_minutes,
    COALESCE(AVG(CASE WHEN up.activity_type = 'quiz' AND up.max_score > 0 THEN (up.score / NULLIF(up.max_score, 0) * 100) END), 0) AS avg_quiz_accuracy,
    MAX(up.created_at) AS last_activity_at
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_journeys uj ON u.id = uj.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.username, u.name;
