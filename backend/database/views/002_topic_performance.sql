-- View: Topic performance metrics
CREATE OR REPLACE VIEW v_topic_performance AS
SELECT 
    t.id AS topic_id, 
    t.name AS topic_name, 
    t.level, 
    l.name AS language_name,
    COUNT(DISTINCT up.user_id) AS students_attempted,
    COUNT(DISTINCT CASE WHEN up.completed = TRUE THEN up.user_id END) AS students_completed,
    COALESCE(AVG(CASE WHEN up.activity_type = 'quiz' AND up.max_score > 0 THEN (up.score / NULLIF(up.max_score, 0) * 100) END), 0) AS avg_quiz_score,
    COALESCE(AVG(up.time_spent_seconds), 0) / 60 AS avg_time_minutes,
    COUNT(tw.word_id) AS word_count
FROM topics t
LEFT JOIN languages l ON t.language_id = l.id
LEFT JOIN user_progress up ON t.id = up.topic_id
LEFT JOIN topic_words tw ON t.id = tw.topic_id
GROUP BY t.id, t.name, t.level, l.name;
