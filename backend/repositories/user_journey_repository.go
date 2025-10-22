package repositories

import (
	"dannyswat/learnspeak/models"
	"time"

	"gorm.io/gorm"
)

type UserJourneyRepository interface {
	// AssignJourney assigns a journey to a user
	AssignJourney(userID, journeyID, assignedBy uint) (*models.UserJourney, error)

	// UnassignJourney removes a journey assignment
	UnassignJourney(userID, journeyID uint) error

	// GetByID retrieves a user journey by ID
	GetByID(id uint) (*models.UserJourney, error)

	// GetUserJourneys retrieves all journeys assigned to a user
	GetUserJourneys(userID uint, status *string, page, pageSize int) ([]models.UserJourney, int64, error)

	// GetJourneyUsers retrieves all users assigned to a journey
	GetJourneyUsers(journeyID uint, status *string, page, pageSize int) ([]models.UserJourney, int64, error)

	// IsAssigned checks if a journey is assigned to a user
	IsAssigned(userID, journeyID uint) (bool, error)

	// UpdateStatus updates the status of a user journey
	UpdateStatus(id uint, status string) error

	// MarkAsStarted marks a journey as started
	MarkAsStarted(userID, journeyID uint) error

	// MarkAsCompleted marks a journey as completed
	MarkAsCompleted(userID, journeyID uint) error

	// GetStatistics gets statistics for a user journey
	GetStatistics(userID, journeyID uint) (map[string]interface{}, error)
}

type userJourneyRepository struct {
	db *gorm.DB
}

func NewUserJourneyRepository(db *gorm.DB) UserJourneyRepository {
	return &userJourneyRepository{db: db}
}

// AssignJourney assigns a journey to a user
func (r *userJourneyRepository) AssignJourney(userID, journeyID, assignedBy uint) (*models.UserJourney, error) {
	userJourney := &models.UserJourney{
		UserID:     userID,
		JourneyID:  journeyID,
		AssignedBy: assignedBy,
		Status:     "assigned",
		AssignedAt: time.Now(),
	}

	err := r.db.Create(userJourney).Error
	if err != nil {
		return nil, err
	}

	// Load relationships
	err = r.db.Preload("User.Roles").
		Preload("Journey.Language").
		Preload("Journey.Creator").
		Preload("AssignedByUser").
		First(userJourney, userJourney.ID).Error

	return userJourney, err
}

// UnassignJourney removes a journey assignment (soft delete)
func (r *userJourneyRepository) UnassignJourney(userID, journeyID uint) error {
	return r.db.Where("user_id = ? AND journey_id = ?", userID, journeyID).
		Delete(&models.UserJourney{}).Error
}

// GetByID retrieves a user journey by ID with relationships
func (r *userJourneyRepository) GetByID(id uint) (*models.UserJourney, error) {
	var userJourney models.UserJourney
	err := r.db.Preload("User.Roles").
		Preload("Journey.Language").
		Preload("Journey.Creator").
		Preload("Journey.Topics.Topic").
		Preload("AssignedByUser").
		First(&userJourney, id).Error

	return &userJourney, err
}

// GetUserJourneys retrieves all journeys assigned to a user
func (r *userJourneyRepository) GetUserJourneys(userID uint, status *string, page, pageSize int) ([]models.UserJourney, int64, error) {
	var userJourneys []models.UserJourney
	var total int64

	query := r.db.Model(&models.UserJourney{}).
		Where("user_id = ?", userID).
		Preload("Journey.Language").
		Preload("Journey.Creator").
		Preload("AssignedByUser")

	// Add status filter if provided
	if status != nil && *status != "" {
		query = query.Where("status = ?", *status)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).
		Order("assigned_at DESC").
		Find(&userJourneys).Error

	return userJourneys, total, err
}

// GetJourneyUsers retrieves all users assigned to a journey
func (r *userJourneyRepository) GetJourneyUsers(journeyID uint, status *string, page, pageSize int) ([]models.UserJourney, int64, error) {
	var userJourneys []models.UserJourney
	var total int64

	query := r.db.Model(&models.UserJourney{}).
		Where("journey_id = ?", journeyID).
		Preload("User.Roles").
		Preload("AssignedByUser")

	// Add status filter if provided
	if status != nil && *status != "" {
		query = query.Where("status = ?", *status)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).
		Order("assigned_at DESC").
		Find(&userJourneys).Error

	return userJourneys, total, err
}

// IsAssigned checks if a journey is assigned to a user
func (r *userJourneyRepository) IsAssigned(userID, journeyID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.UserJourney{}).
		Where("user_id = ? AND journey_id = ?", userID, journeyID).
		Count(&count).Error

	return count > 0, err
}

// UpdateStatus updates the status of a user journey
func (r *userJourneyRepository) UpdateStatus(id uint, status string) error {
	updates := map[string]interface{}{
		"status": status,
	}

	if status == "in_progress" {
		updates["started_at"] = time.Now()
	} else if status == "completed" {
		updates["completed_at"] = time.Now()
	}

	return r.db.Model(&models.UserJourney{}).
		Where("id = ?", id).
		Updates(updates).Error
}

// MarkAsStarted marks a journey as started
func (r *userJourneyRepository) MarkAsStarted(userID, journeyID uint) error {
	return r.db.Model(&models.UserJourney{}).
		Where("user_id = ? AND journey_id = ? AND status = ?", userID, journeyID, "assigned").
		Updates(map[string]interface{}{
			"status":     "in_progress",
			"started_at": time.Now(),
		}).Error
}

// MarkAsCompleted marks a journey as completed
func (r *userJourneyRepository) MarkAsCompleted(userID, journeyID uint) error {
	return r.db.Model(&models.UserJourney{}).
		Where("user_id = ? AND journey_id = ?", userID, journeyID).
		Updates(map[string]interface{}{
			"status":       "completed",
			"completed_at": time.Now(),
		}).Error
}

// GetStatistics gets statistics for a user journey
func (r *userJourneyRepository) GetStatistics(userID, journeyID uint) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Get user journey
	var userJourney models.UserJourney
	err := r.db.Where("user_id = ? AND journey_id = ?", userID, journeyID).
		First(&userJourney).Error
	if err != nil {
		return nil, err
	}

	// Get total topics in journey
	var totalTopics int64
	err = r.db.Model(&models.JourneyTopic{}).
		Where("journey_id = ?", journeyID).
		Count(&totalTopics).Error
	if err != nil {
		return nil, err
	}

	// Get completed topics using the same logic as GetCompletedTopicIDs
	// A topic is completed when flashcard is done AND (no quizzes OR quiz is done)
	var completedTopicIDs []uint
	err = r.db.Raw(`
		SELECT DISTINCT up1.topic_id
		FROM user_progress up1
		INNER JOIN topics t ON t.id = up1.topic_id
		INNER JOIN journey_topics jt ON jt.topic_id = t.id
		WHERE up1.user_id = ?
			AND jt.journey_id = ?
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
						AND up2.activity_type = 'quiz'
						AND up2.completed = true
				)
			)
	`, userID, journeyID).Pluck("topic_id", &completedTopicIDs).Error

	var completedTopics int64
	if err != nil {
		completedTopics = 0 // If error, default to 0
	} else {
		completedTopics = int64(len(completedTopicIDs))
	}

	// Calculate progress percentage (rounded to 1 decimal place)
	var progress float64
	if totalTopics > 0 {
		progress = float64(completedTopics) / float64(totalTopics) * 100
		progress = float64(int(progress*10+0.5)) / 10 // Round to 1 decimal place
	}

	stats["status"] = userJourney.Status
	stats["assigned_at"] = userJourney.AssignedAt
	stats["started_at"] = userJourney.StartedAt
	stats["completed_at"] = userJourney.CompletedAt
	stats["total_topics"] = totalTopics
	stats["completed_topics"] = completedTopics
	stats["progress_percentage"] = progress

	return stats, nil
}
