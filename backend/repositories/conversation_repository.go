package repositories

import (
	"fmt"
	"strings"

	"dannyswat/learnspeak/models"

	"gorm.io/gorm"
)

type ConversationRepository interface {
	Create(conversation *models.Conversation) error
	GetByID(id uint) (*models.Conversation, error)
	Update(conversation *models.Conversation) error
	Delete(id uint) error
	List(search string, languageCode string, difficultyLevel string, createdBy uint, page, pageSize int) ([]models.Conversation, int64, error)
	GetByTopicID(topicID uint) ([]models.Conversation, error)
	AddLinesToConversation(conversationID uint, lines []models.ConversationLine) error
	UpdateLine(line *models.ConversationLine) error
	DeleteLine(lineID uint) error
	ReorderLines(conversationID uint, lineIDs []uint) error
	LinkToTopic(conversationID uint, topicID uint) error
}

type conversationRepository struct {
	db *gorm.DB
}

func NewConversationRepository(db *gorm.DB) ConversationRepository {
	return &conversationRepository{db: db}
}

// Create creates a new conversation with its lines
func (r *conversationRepository) Create(conversation *models.Conversation) error {
	return r.db.Create(conversation).Error
}

// GetByID retrieves a conversation by ID with all its lines
func (r *conversationRepository) GetByID(id uint) (*models.Conversation, error) {
	var conversation models.Conversation
	query := r.db.Preload("Language").Preload("Creator").
		Preload("Lines", func(db *gorm.DB) *gorm.DB {
			return db.Order("sequence_order ASC")
		}).Preload("Lines.Word").Preload("Lines.Word.Translations")

	err := query.First(&conversation, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("conversation not found")
		}
		return nil, err
	}

	return &conversation, nil
}

// Update updates an existing conversation (not including lines)
func (r *conversationRepository) Update(conversation *models.Conversation) error {
	return r.db.Model(conversation).Updates(map[string]interface{}{
		"title":            conversation.Title,
		"description":      conversation.Description,
		"context":          conversation.Context,
		"language_id":      conversation.LanguageID,
		"difficulty_level": conversation.DifficultyLevel,
	}).Error
}

// Delete deletes a conversation by ID (cascade deletes lines)
func (r *conversationRepository) Delete(id uint) error {
	result := r.db.Delete(&models.Conversation{}, id)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("conversation not found")
	}

	return nil
}

// List retrieves conversations with filtering and pagination
func (r *conversationRepository) List(search string, languageCode string, difficultyLevel string, createdBy uint, page, pageSize int) ([]models.Conversation, int64, error) {
	var conversations []models.Conversation
	var total int64

	query := r.db.Model(&models.Conversation{})

	// Apply filters
	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", searchPattern, searchPattern)
	}

	if difficultyLevel != "" {
		query = query.Where("difficulty_level = ?", difficultyLevel)
	}

	if createdBy > 0 {
		query = query.Where("created_by = ?", createdBy)
	}

	if languageCode != "" {
		query = query.Joins("JOIN languages ON languages.id = conversations.language_id").
			Where("languages.code = ?", languageCode)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (page - 1) * pageSize
	query = query.Offset(offset).Limit(pageSize)

	// Load relations and order
	query = query.Preload("Language").Preload("Creator").
		Preload("Lines", func(db *gorm.DB) *gorm.DB {
			return db.Order("sequence_order ASC")
		}).
		Order("created_at DESC")

	if err := query.Find(&conversations).Error; err != nil {
		return nil, 0, err
	}

	return conversations, total, nil
}

// GetByTopicID retrieves all conversations for a specific topic
func (r *conversationRepository) GetByTopicID(topicID uint) ([]models.Conversation, error) {
	var conversations []models.Conversation

	err := r.db.
		Joins("JOIN topic_conversations ON topic_conversations.conversation_id = conversations.id").
		Where("topic_conversations.topic_id = ?", topicID).
		Preload("Language").
		Preload("Lines", func(db *gorm.DB) *gorm.DB {
			return db.Order("sequence_order ASC")
		}).
		Order("topic_conversations.sequence_order ASC").
		Find(&conversations).Error

	if err != nil {
		return nil, err
	}

	return conversations, nil
}

// AddLinesToConversation adds new lines to a conversation
func (r *conversationRepository) AddLinesToConversation(conversationID uint, lines []models.ConversationLine) error {
	// Set conversation ID for all lines
	for i := range lines {
		lines[i].ConversationID = conversationID
	}

	return r.db.Create(&lines).Error
}

// UpdateLine updates a single conversation line
func (r *conversationRepository) UpdateLine(line *models.ConversationLine) error {
	return r.db.Save(line).Error
}

// DeleteLine deletes a conversation line
func (r *conversationRepository) DeleteLine(lineID uint) error {
	result := r.db.Delete(&models.ConversationLine{}, lineID)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("conversation line not found")
	}

	return nil
}

// ReorderLines updates the sequence order of lines
func (r *conversationRepository) ReorderLines(conversationID uint, lineIDs []uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for i, lineID := range lineIDs {
			if err := tx.Model(&models.ConversationLine{}).
				Where("id = ? AND conversation_id = ?", lineID, conversationID).
				Update("sequence_order", i+1).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// LinkToTopic creates a link between a conversation and a topic
func (r *conversationRepository) LinkToTopic(conversationID uint, topicID uint) error {
	// Get the max sequence order for this topic
	var maxOrder int
	err := r.db.Model(&models.TopicConversation{}).
		Where("topic_id = ?", topicID).
		Select("COALESCE(MAX(sequence_order), 0)").
		Scan(&maxOrder).Error
	if err != nil {
		return err
	}

	// Create the link
	topicConversation := &models.TopicConversation{
		TopicID:        topicID,
		ConversationID: conversationID,
		SequenceOrder:  maxOrder + 1,
	}

	return r.db.Create(topicConversation).Error
}
