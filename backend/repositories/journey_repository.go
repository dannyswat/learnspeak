package repositories

import (
	"fmt"
	"strings"

	"dannyswat/learnspeak/models"

	"gorm.io/gorm"
)

type JourneyRepository interface {
	Create(journey *models.Journey) error
	GetByID(id uint, includeTopics bool) (*models.Journey, error)
	Update(journey *models.Journey) error
	Delete(id uint) error
	List(search string, languageCode string, createdBy uint, page, pageSize int, includeTopics bool) ([]models.Journey, int64, error)
	AddTopics(journeyID uint, topicIDs []uint) error
	RemoveTopics(journeyID uint, topicIDs []uint) error
	ReorderTopics(journeyID uint, topicIDs []uint) error
	GetJourneyTopics(journeyID uint) ([]models.JourneyTopic, error)
	GetTopicCount(journeyID uint) (int64, error)
	GetTotalWords(journeyID uint) (int, error)
	GetAssignedUserCount(journeyID uint) (int64, error)
}

type journeyRepository struct {
	db *gorm.DB
}

func NewJourneyRepository(db *gorm.DB) JourneyRepository {
	return &journeyRepository{db: db}
}

// Create creates a new journey
func (r *journeyRepository) Create(journey *models.Journey) error {
	return r.db.Create(journey).Error
}

// GetByID retrieves a journey by ID
func (r *journeyRepository) GetByID(id uint, includeTopics bool) (*models.Journey, error) {
	var journey models.Journey
	query := r.db.Preload("Language").Preload("Creator")

	if includeTopics {
		query = query.Preload("Topics", func(db *gorm.DB) *gorm.DB {
			return db.Order("sequence_order ASC")
		}).Preload("Topics.Topic").Preload("Topics.Topic.Language")
	}

	err := query.First(&journey, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("journey not found")
		}
		return nil, err
	}

	return &journey, nil
}

// Update updates an existing journey
func (r *journeyRepository) Update(journey *models.Journey) error {
	return r.db.Save(journey).Error
}

// Delete deletes a journey by ID
func (r *journeyRepository) Delete(id uint) error {
	// First delete all journey_topics associations
	if err := r.db.Where("journey_id = ?", id).Delete(&models.JourneyTopic{}).Error; err != nil {
		return err
	}

	// Then delete the journey
	result := r.db.Delete(&models.Journey{}, id)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("journey not found")
	}

	return nil
}

// List retrieves journeys with filtering and pagination
func (r *journeyRepository) List(search string, languageCode string, createdBy uint, page, pageSize int, includeTopics bool) ([]models.Journey, int64, error) {
	var journeys []models.Journey
	var total int64

	query := r.db.Model(&models.Journey{})

	// Apply filters
	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", searchPattern, searchPattern)
	}

	if languageCode != "" {
		// Join with languages table to filter by language code
		query = query.Joins("JOIN languages ON languages.id = journeys.language_id").
			Where("languages.code = ?", languageCode)
	}

	if createdBy > 0 {
		query = query.Where("created_by = ?", createdBy)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (page - 1) * pageSize
	query = query.Offset(offset).Limit(pageSize)

	// Fetch with relations
	query = query.Preload("Language").Preload("Creator")

	if includeTopics {
		query = query.Preload("Topics", func(db *gorm.DB) *gorm.DB {
			return db.Order("sequence_order ASC")
		}).Preload("Topics.Topic").Preload("Topics.Topic.Language")
	}

	err := query.Order("created_at DESC").Find(&journeys).Error
	if err != nil {
		return nil, 0, err
	}

	return journeys, total, nil
}

// AddTopics adds topics to a journey
func (r *journeyRepository) AddTopics(journeyID uint, topicIDs []uint) error {
	// Get current max sequence order
	var maxOrder int
	r.db.Model(&models.JourneyTopic{}).
		Where("journey_id = ?", journeyID).
		Select("COALESCE(MAX(sequence_order), 0)").
		Scan(&maxOrder)

	// Add new topics with sequential ordering
	for i, topicID := range topicIDs {
		// Check if topic is already in journey
		var existing models.JourneyTopic
		err := r.db.Where("journey_id = ? AND topic_id = ?", journeyID, topicID).First(&existing).Error
		if err == nil {
			// Topic already exists, skip
			continue
		}

		journeyTopic := models.JourneyTopic{
			JourneyID:     journeyID,
			TopicID:       topicID,
			SequenceOrder: maxOrder + i + 1,
		}
		if err := r.db.Create(&journeyTopic).Error; err != nil {
			return err
		}
	}

	return nil
}

// RemoveTopics removes topics from a journey
func (r *journeyRepository) RemoveTopics(journeyID uint, topicIDs []uint) error {
	return r.db.Where("journey_id = ? AND topic_id IN ?", journeyID, topicIDs).
		Delete(&models.JourneyTopic{}).Error
}

// ReorderTopics reorders topics in a journey
func (r *journeyRepository) ReorderTopics(journeyID uint, topicIDs []uint) error {
	// Update sequence order for each topic
	for i, topicID := range topicIDs {
		if err := r.db.Model(&models.JourneyTopic{}).
			Where("journey_id = ? AND topic_id = ?", journeyID, topicID).
			Update("sequence_order", i+1).Error; err != nil {
			return err
		}
	}
	return nil
}

// GetJourneyTopics retrieves all topics in a journey
func (r *journeyRepository) GetJourneyTopics(journeyID uint) ([]models.JourneyTopic, error) {
	var journeyTopics []models.JourneyTopic
	err := r.db.
		Preload("Topic").
		Preload("Topic.Language").
		Where("journey_id = ?", journeyID).
		Order("sequence_order ASC").
		Find(&journeyTopics).Error

	return journeyTopics, err
}

// GetTopicCount returns the number of topics in a journey
func (r *journeyRepository) GetTopicCount(journeyID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.JourneyTopic{}).Where("journey_id = ?", journeyID).Count(&count).Error
	return count, err
}

// GetTotalWords returns the total number of words across all topics in a journey
func (r *journeyRepository) GetTotalWords(journeyID uint) (int, error) {
	var total int64
	err := r.db.Table("topic_words").
		Joins("JOIN journey_topics ON topic_words.topic_id = journey_topics.topic_id").
		Where("journey_topics.journey_id = ?", journeyID).
		Count(&total).Error
	return int(total), err
}

// GetAssignedUserCount returns the number of users assigned to this journey
func (r *journeyRepository) GetAssignedUserCount(journeyID uint) (int64, error) {
	var count int64
	// Assuming there's a user_journeys table
	err := r.db.Table("user_journeys").Where("journey_id = ?", journeyID).Count(&count).Error
	return count, err
}
