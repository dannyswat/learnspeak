package repositories

import (
	"fmt"
	"strings"

	"dannyswat/learnspeak/models"

	"gorm.io/gorm"
)

type TopicRepository interface {
	Create(topic *models.Topic) error
	GetByID(id uint, includeWords bool) (*models.Topic, error)
	Update(topic *models.Topic) error
	Delete(id uint) error
	List(search string, level, languageCode string, createdBy uint, page, pageSize int, includeWords bool) ([]models.Topic, int64, error)
	AddWords(topicID uint, wordIDs []uint) error
	RemoveWords(topicID uint, wordIDs []uint) error
	ReorderWords(topicID uint, wordIDs []uint) error
	GetTopicWords(topicID uint) ([]models.TopicWord, error)
	GetWordCount(topicID uint) (int64, error)
	GetQuizCount(topicID uint) (int64, error)
	GetJourneyUsageCount(topicID uint) (int64, error)
}

type topicRepository struct {
	db *gorm.DB
}

func NewTopicRepository(db *gorm.DB) TopicRepository {
	return &topicRepository{db: db}
}

// Create creates a new topic
func (r *topicRepository) Create(topic *models.Topic) error {
	return r.db.Create(topic).Error
}

// GetByID retrieves a topic by ID
func (r *topicRepository) GetByID(id uint, includeWords bool) (*models.Topic, error) {
	var topic models.Topic
	query := r.db.Preload("Language").Preload("Creator")

	if includeWords {
		query = query.Preload("Words", func(db *gorm.DB) *gorm.DB {
			return db.Order("sequence_order ASC")
		}).Preload("Words.Word").Preload("Words.Word.Translations")
	}

	err := query.First(&topic, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("topic not found")
		}
		return nil, err
	}

	return &topic, nil
}

// Update updates an existing topic
func (r *topicRepository) Update(topic *models.Topic) error {
	return r.db.Save(topic).Error
}

// Delete deletes a topic by ID
func (r *topicRepository) Delete(id uint) error {
	// First delete all topic_words associations
	if err := r.db.Where("topic_id = ?", id).Delete(&models.TopicWord{}).Error; err != nil {
		return err
	}

	// Then delete the topic
	result := r.db.Delete(&models.Topic{}, id)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("topic not found")
	}

	return nil
}

// List retrieves topics with filtering and pagination
func (r *topicRepository) List(search string, level, languageCode string, createdBy uint, page, pageSize int, includeWords bool) ([]models.Topic, int64, error) {
	var topics []models.Topic
	var total int64

	query := r.db.Model(&models.Topic{})

	// Apply filters
	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", searchPattern, searchPattern)
	}

	if level != "" {
		query = query.Where("level = ?", level)
	}

	if languageCode != "" {
		// Join with languages table to filter by language code
		query = query.Joins("JOIN languages ON languages.id = topics.language_id").
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

	if includeWords {
		query = query.Preload("Words", func(db *gorm.DB) *gorm.DB {
			return db.Order("sequence_order ASC")
		}).Preload("Words.Word").Preload("Words.Word.Translations")
	}

	err := query.Order("created_at DESC").Find(&topics).Error
	if err != nil {
		return nil, 0, err
	}

	return topics, total, nil
}

// AddWords adds words to a topic
func (r *topicRepository) AddWords(topicID uint, wordIDs []uint) error {
	// Get current max sequence order
	var maxOrder int
	r.db.Model(&models.TopicWord{}).
		Where("topic_id = ?", topicID).
		Select("COALESCE(MAX(sequence_order), 0)").
		Scan(&maxOrder)

	// Add new words with sequential ordering
	for i, wordID := range wordIDs {
		// Check if word is already in topic
		var existing models.TopicWord
		err := r.db.Where("topic_id = ? AND word_id = ?", topicID, wordID).First(&existing).Error
		if err == nil {
			// Word already exists, skip
			continue
		}

		topicWord := models.TopicWord{
			TopicID:       topicID,
			WordID:        wordID,
			SequenceOrder: maxOrder + i + 1,
		}
		if err := r.db.Create(&topicWord).Error; err != nil {
			return err
		}
	}

	return nil
}

// RemoveWords removes words from a topic
func (r *topicRepository) RemoveWords(topicID uint, wordIDs []uint) error {
	return r.db.Where("topic_id = ? AND word_id IN ?", topicID, wordIDs).
		Delete(&models.TopicWord{}).Error
}

// ReorderWords reorders words in a topic
func (r *topicRepository) ReorderWords(topicID uint, wordIDs []uint) error {
	// Update sequence order for each word
	for i, wordID := range wordIDs {
		if err := r.db.Model(&models.TopicWord{}).
			Where("topic_id = ? AND word_id = ?", topicID, wordID).
			Update("sequence_order", i+1).Error; err != nil {
			return err
		}
	}
	return nil
}

// GetTopicWords retrieves all words in a topic
func (r *topicRepository) GetTopicWords(topicID uint) ([]models.TopicWord, error) {
	var topicWords []models.TopicWord
	err := r.db.
		Preload("Word").
		Preload("Word.Translations").
		Where("topic_id = ?", topicID).
		Order("sequence_order ASC").
		Find(&topicWords).Error

	return topicWords, err
}

// GetWordCount returns the number of words in a topic
func (r *topicRepository) GetWordCount(topicID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.TopicWord{}).Where("topic_id = ?", topicID).Count(&count).Error
	return count, err
}

// GetQuizCount returns the number of quizzes for a topic
func (r *topicRepository) GetQuizCount(topicID uint) (int64, error) {
	var count int64
	// Assuming there's a topic_quizzes table
	err := r.db.Table("topic_quizzes").Where("topic_id = ?", topicID).Count(&count).Error
	return count, err
}

// GetJourneyUsageCount returns the number of journeys using this topic
func (r *topicRepository) GetJourneyUsageCount(topicID uint) (int64, error) {
	var count int64
	// Assuming there's a journey_topics table
	err := r.db.Table("journey_topics").Where("topic_id = ?", topicID).Count(&count).Error
	return count, err
}
