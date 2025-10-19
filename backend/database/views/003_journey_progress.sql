-- View: Journey progress tracking
CREATE OR REPLACE VIEW v_journey_progress AS
SELECT 
    j.id AS journey_id, 
    j.name AS journey_name, 
    l.name AS language_name,
    u.id AS user_id, 
    u.name AS user_name, 
    uj.status,
    uj.assigned_at, 
    uj.started_at, 
    uj.completed_at,
    COUNT(jt.topic_id) AS total_topics,
    COUNT(DISTINCT CASE WHEN up.completed = TRUE THEN up.topic_id END) AS completed_topics,
    CASE 
        WHEN COUNT(jt.topic_id) > 0 
        THEN (COUNT(DISTINCT CASE WHEN up.completed = TRUE THEN up.topic_id END)::DECIMAL / COUNT(jt.topic_id) * 100) 
        ELSE 0 
    END AS completion_percentage
FROM journeys j
LEFT JOIN languages l ON j.language_id = l.id
LEFT JOIN user_journeys uj ON j.id = uj.journey_id
LEFT JOIN users u ON uj.user_id = u.id AND u.deleted_at IS NULL
LEFT JOIN journey_topics jt ON j.id = jt.journey_id
LEFT JOIN user_progress up ON u.id = up.user_id AND jt.topic_id = up.topic_id
WHERE uj.deleted_at IS NULL
GROUP BY j.id, j.name, l.name, u.id, u.name, uj.status, uj.assigned_at, uj.started_at, uj.completed_at;
