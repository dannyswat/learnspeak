package repositories

import (
	"dannyswat/learnspeak/models"

	"gorm.io/gorm"
)

type UserProgressRepository interface {
	Create(progress *models.UserProgress) error
	GetByID(id uint) (*models.UserProgress, error)
	GetUserTopicProgress(userID, topicID uint) ([]models.UserProgress, error)
	GetCompletedTopicIDs(userID, journeyID uint) ([]uint, error)
	GetJourneyProgress(userID, journeyID uint) (*JourneyProgressStats, error)
	CountCompletionsByTeacher(teacherID uint) (int64, error)
}

type userProgressRepository struct {
	db *gorm.DB
}

type JourneyProgressStats struct {
	TotalTopics     int
	CompletedTopics int
	ProgressPercent float64
}

func NewUserProgressRepository(db *gorm.DB) UserProgressRepository {
	return &userProgressRepository{db: db}
}

// Create creates a new user progress record
func (r *userProgressRepository) Create(progress *models.UserProgress) error {
	return r.db.Create(progress).Error
}

// GetByID retrieves a user progress record by ID
func (r *userProgressRepository) GetByID(id uint) (*models.UserProgress, error) {
	var progress models.UserProgress
	err := r.db.First(&progress, id).Error
	return &progress, err
}

// GetUserTopicProgress gets all progress records for a user and topic
func (r *userProgressRepository) GetUserTopicProgress(userID, topicID uint) ([]models.UserProgress, error) {
	var progress []models.UserProgress
	err := r.db.Where("user_id = ? AND topic_id = ?", userID, topicID).Find(&progress).Error
	return progress, err
}

// GetCompletedTopicIDs gets all topic IDs completed by a user in a journey
// A topic is considered completed when:
// 1. Flashcard activity is completed, AND
// 2. If the topic has quizzes, the quiz activity must also be completed
func (r *userProgressRepository) GetCompletedTopicIDs(userID, journeyID uint) ([]uint, error) {
	var topicIDs []uint

	// Find topics where flashcard is completed
	// AND either (topic has no quizzes) OR (quiz is also completed)
	err := r.db.Raw(`
		SELECT DISTINCT up1.topic_id
		FROM user_progress up1
		INNER JOIN topics t ON t.id = up1.topic_id
		WHERE up1.user_id = ?
			AND up1.journey_id = ?
			AND up1.topic_id IS NOT NULL
			AND up1.activity_type = 'flashcard'
			AND up1.completed = true
			AND (
				-- Either topic has no quizzes (quiz_count = 0 or NULL)
				(SELECT COUNT(*) FROM topic_quizzes WHERE topic_id = t.id) = 0
				OR
				-- Or quiz is completed
				EXISTS (
					SELECT 1 
					FROM user_progress up2
					WHERE up2.user_id = up1.user_id
						AND up2.topic_id = up1.topic_id
						AND up2.journey_id = up1.journey_id
						AND up2.activity_type = 'quiz'
						AND up2.completed = true
				)
			)
	`, userID, journeyID).Pluck("topic_id", &topicIDs).Error

	return topicIDs, err
}

// GetJourneyProgress calculates the progress for a user in a journey
func (r *userProgressRepository) GetJourneyProgress(userID, journeyID uint) (*JourneyProgressStats, error) {
	stats := &JourneyProgressStats{}

	// Get total topics in journey
	var totalTopics int64
	err := r.db.Table("journey_topics").
		Where("journey_id = ?", journeyID).
		Count(&totalTopics).Error
	if err != nil {
		return nil, err
	}
	stats.TotalTopics = int(totalTopics)

	// Get completed topics (flashcard completed AND quiz completed if topic has quizzes)
	var completedTopicIDs []uint
	err = r.db.Raw(`
		SELECT DISTINCT up1.topic_id
		FROM user_progress up1
		INNER JOIN topics t ON t.id = up1.topic_id
		WHERE up1.user_id = ?
			AND up1.journey_id = ?
			AND up1.topic_id IS NOT NULL
			AND up1.activity_type = 'flashcard'
			AND up1.completed = true
			AND (
				-- Either topic has no quizzes
				(SELECT COUNT(*) FROM topic_quizzes WHERE topic_id = t.id) = 0
				OR
				-- Or quiz is completed
				EXISTS (
					SELECT 1 
					FROM user_progress up2
					WHERE up2.user_id = up1.user_id
						AND up2.topic_id = up1.topic_id
						AND up2.journey_id = up1.journey_id
						AND up2.activity_type = 'quiz'
						AND up2.completed = true
				)
			)
	`, userID, journeyID).Pluck("topic_id", &completedTopicIDs).Error
	if err != nil {
		return nil, err
	}

	stats.CompletedTopics = len(completedTopicIDs)

	if stats.TotalTopics > 0 {
		stats.ProgressPercent = float64(stats.CompletedTopics) / float64(stats.TotalTopics) * 100
		// Round to 1 decimal place
		stats.ProgressPercent = float64(int(stats.ProgressPercent*10+0.5)) / 10
	}

	return stats, nil
}

// CountCompletionsByTeacher counts total topic completions for a teacher's topics
func (r *userProgressRepository) CountCompletionsByTeacher(teacherID uint) (int64, error) {
	var count int64
	err := r.db.Table("user_progress").
		Joins("INNER JOIN topics ON topics.id = user_progress.topic_id").
		Where("topics.created_by = ? AND user_progress.completed = ? AND user_progress.activity_type = ?",
			teacherID, true, "flashcard").
		Count(&count).Error
	return count, err
}
