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
func (r *userProgressRepository) GetCompletedTopicIDs(userID, journeyID uint) ([]uint, error) {
	var topicIDs []uint

	err := r.db.Model(&models.UserProgress{}).
		Select("DISTINCT topic_id").
		Where("user_id = ? AND journey_id = ? AND completed = ? AND topic_id IS NOT NULL", userID, journeyID, true).
		Pluck("topic_id", &topicIDs).Error

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

	// Get completed topics
	var completedTopicIDs []uint
	err = r.db.Model(&models.UserProgress{}).
		Select("DISTINCT topic_id").
		Where("user_id = ? AND journey_id = ? AND completed = ? AND topic_id IS NOT NULL", userID, journeyID, true).
		Pluck("topic_id", &completedTopicIDs).Error
	if err != nil {
		return nil, err
	}

	stats.CompletedTopics = len(completedTopicIDs)

	if stats.TotalTopics > 0 {
		stats.ProgressPercent = float64(stats.CompletedTopics) / float64(stats.TotalTopics) * 100
	}

	return stats, nil
}
