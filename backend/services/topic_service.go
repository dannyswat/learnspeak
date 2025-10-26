package services

import (
	"fmt"
	"math"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/models"
	"dannyswat/learnspeak/repositories"
)

type TopicService interface {
	CreateTopic(req *dto.CreateTopicRequest, userID uint) (*dto.TopicResponse, error)
	GetTopic(id uint, includeWords bool) (*dto.TopicResponse, error)
	UpdateTopic(id uint, req *dto.UpdateTopicRequest, userID uint) (*dto.TopicResponse, error)
	DeleteTopic(id uint, userID uint) error
	ListTopics(params *dto.TopicFilterParams) (*dto.TopicListResponse, error)
	ReorderWords(topicID uint, wordIDs []uint, userID uint) error
	AddWordsToTopic(topicID uint, wordIDs []uint, userID uint) error
}

type topicService struct {
	topicRepo    repositories.TopicRepository
	languageRepo repositories.LanguageRepository
}

func NewTopicService(topicRepo repositories.TopicRepository, languageRepo repositories.LanguageRepository) TopicService {
	return &topicService{
		topicRepo:    topicRepo,
		languageRepo: languageRepo,
	}
}

// CreateTopic creates a new topic with words
func (s *topicService) CreateTopic(req *dto.CreateTopicRequest, userID uint) (*dto.TopicResponse, error) {
	// Validate language
	language, err := s.languageRepo.GetByCode(req.LanguageCode)
	if err != nil {
		return nil, fmt.Errorf("language not found: %s", req.LanguageCode)
	}

	// Create topic model
	topic := &models.Topic{
		Name:        req.Name,
		Description: req.Description,
		Level:       req.Level,
		LanguageID:  language.ID,
		CreatedBy:   userID,
		IsPublic:    req.IsPublic,
	}

	// Create topic
	if err := s.topicRepo.Create(topic); err != nil {
		return nil, fmt.Errorf("failed to create topic: %w", err)
	}

	// Add words if provided
	if len(req.WordIDs) > 0 {
		if err := s.topicRepo.AddWords(topic.ID, req.WordIDs); err != nil {
			return nil, fmt.Errorf("failed to add words to topic: %w", err)
		}
	}

	// Fetch the created topic with relations
	createdTopic, err := s.topicRepo.GetByID(topic.ID, false)
	if err != nil {
		return nil, err
	}

	return s.toTopicResponse(createdTopic, false)
}

// GetTopic retrieves a topic by ID
func (s *topicService) GetTopic(id uint, includeWords bool) (*dto.TopicResponse, error) {
	topic, err := s.topicRepo.GetByID(id, includeWords)
	if err != nil {
		return nil, err
	}

	return s.toTopicResponse(topic, includeWords)
}

// UpdateTopic updates an existing topic
func (s *topicService) UpdateTopic(id uint, req *dto.UpdateTopicRequest, userID uint) (*dto.TopicResponse, error) {
	// Fetch existing topic
	topic, err := s.topicRepo.GetByID(id, false)
	if err != nil {
		return nil, err
	}

	// Update topic fields
	if req.Name != nil {
		topic.Name = *req.Name
	}
	if req.Description != nil {
		topic.Description = *req.Description
	}
	if req.Level != nil {
		topic.Level = *req.Level
	}
	if req.IsPublic != nil {
		topic.IsPublic = *req.IsPublic
	}
	if req.LanguageCode != nil {
		language, err := s.languageRepo.GetByCode(*req.LanguageCode)
		if err != nil {
			return nil, fmt.Errorf("language not found: %s", *req.LanguageCode)
		}
		topic.LanguageID = language.ID
	}

	// Save topic updates
	if err := s.topicRepo.Update(topic); err != nil {
		return nil, fmt.Errorf("failed to update topic: %w", err)
	}

	// Update words if provided
	if req.WordIDs != nil {
		// Get current words
		currentWords, err := s.topicRepo.GetTopicWords(id)
		if err != nil {
			return nil, fmt.Errorf("failed to get current words: %w", err)
		}

		// Create maps for comparison
		currentWordMap := make(map[uint]bool)
		for _, tw := range currentWords {
			currentWordMap[tw.WordID] = true
		}

		newWordMap := make(map[uint]bool)
		for _, wordID := range *req.WordIDs {
			newWordMap[wordID] = true
		}

		// Find words to add (in new but not in current)
		var wordsToAdd []uint
		for _, wordID := range *req.WordIDs {
			if !currentWordMap[wordID] {
				wordsToAdd = append(wordsToAdd, wordID)
			}
		}

		// Find words to remove (in current but not in new)
		var wordsToRemove []uint
		for _, tw := range currentWords {
			if !newWordMap[tw.WordID] {
				wordsToRemove = append(wordsToRemove, tw.WordID)
			}
		}

		// Add new words
		if len(wordsToAdd) > 0 {
			if err := s.topicRepo.AddWords(id, wordsToAdd); err != nil {
				return nil, fmt.Errorf("failed to add words: %w", err)
			}
		}

		// Remove old words
		if len(wordsToRemove) > 0 {
			if err := s.topicRepo.RemoveWords(id, wordsToRemove); err != nil {
				return nil, fmt.Errorf("failed to remove words: %w", err)
			}
		}

		// Reorder all words
		if len(*req.WordIDs) > 0 {
			if err := s.topicRepo.ReorderWords(id, *req.WordIDs); err != nil {
				return nil, fmt.Errorf("failed to reorder words: %w", err)
			}
		}
	}

	// Fetch updated topic
	updatedTopic, err := s.topicRepo.GetByID(id, false)
	if err != nil {
		return nil, err
	}

	return s.toTopicResponse(updatedTopic, false)
}

// DeleteTopic deletes a topic
func (s *topicService) DeleteTopic(id uint, userID uint) error {
	// Fetch existing topic to check ownership
	_, err := s.topicRepo.GetByID(id, false)
	if err != nil {
		return err
	}

	// Check if topic is used in journeys
	usageCount, err := s.topicRepo.GetJourneyUsageCount(id)
	if err != nil {
		return fmt.Errorf("failed to check topic usage: %w", err)
	}

	if usageCount > 0 {
		return fmt.Errorf("topic is used in %d journey(s) and cannot be deleted", usageCount)
	}

	return s.topicRepo.Delete(id)
}

// ListTopics retrieves topics with filtering and pagination
func (s *topicService) ListTopics(params *dto.TopicFilterParams) (*dto.TopicListResponse, error) {
	// Set defaults
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}
	if params.PageSize > 100 {
		params.PageSize = 100
	}

	topics, total, err := s.topicRepo.List(
		params.Search,
		params.Level,
		params.LanguageCode,
		params.CreatedBy,
		params.IsPublic,
		params.Page,
		params.PageSize,
		params.IncludeWords,
	)
	if err != nil {
		return nil, err
	}

	// Convert to response DTOs
	topicResponses := make([]dto.TopicResponse, len(topics))
	for i, topic := range topics {
		response, err := s.toTopicResponse(&topic, params.IncludeWords)
		if err != nil {
			return nil, err
		}
		topicResponses[i] = *response
	}

	totalPages := int(math.Ceil(float64(total) / float64(params.PageSize)))

	return &dto.TopicListResponse{
		Topics:     topicResponses,
		Total:      total,
		Page:       params.Page,
		PageSize:   params.PageSize,
		TotalPages: totalPages,
	}, nil
}

// ReorderWords reorders words in a topic
func (s *topicService) ReorderWords(topicID uint, wordIDs []uint, userID uint) error {
	// Fetch topic to check ownership
	_, err := s.topicRepo.GetByID(topicID, false)
	if err != nil {
		return err
	}

	return s.topicRepo.ReorderWords(topicID, wordIDs)
}

// AddWordsToTopic adds words to an existing topic
func (s *topicService) AddWordsToTopic(topicID uint, wordIDs []uint, userID uint) error {
	// Fetch topic to check ownership
	_, err := s.topicRepo.GetByID(topicID, false)
	if err != nil {
		return err
	}

	// Add words to topic
	return s.topicRepo.AddWords(topicID, wordIDs)
}

// toTopicResponse converts a topic model to response DTO
func (s *topicService) toTopicResponse(topic *models.Topic, includeWords bool) (*dto.TopicResponse, error) {
	// Get counts
	wordCount, _ := s.topicRepo.GetWordCount(topic.ID)
	quizCount, _ := s.topicRepo.GetQuizCount(topic.ID)
	usedInJourneys, _ := s.topicRepo.GetJourneyUsageCount(topic.ID)

	response := &dto.TopicResponse{
		ID:             topic.ID,
		Name:           topic.Name,
		Description:    topic.Description,
		Level:          topic.Level,
		IsPublic:       topic.IsPublic,
		WordCount:      int(wordCount),
		QuizCount:      int(quizCount),
		UsedInJourneys: int(usedInJourneys),
		CreatedAt:      topic.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:      topic.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	// Add language info
	if topic.Language.ID > 0 {
		response.Language = &dto.LanguageInfo{
			ID:         topic.Language.ID,
			Code:       topic.Language.Code,
			Name:       topic.Language.Name,
			NativeName: topic.Language.NativeName,
		}
	}

	// Add creator info
	if topic.Creator.ID > 0 {
		response.CreatedBy = &dto.CreatorInfo{
			ID:    topic.Creator.ID,
			Name:  topic.Creator.Name,
			Email: topic.Creator.Email,
		}
	}

	// Add words if requested
	if includeWords && len(topic.Words) > 0 {
		words := make([]dto.TopicWordInfo, len(topic.Words))
		for i, tw := range topic.Words {
			word := tw.Word

			// Find translation for the topic's language
			var translation, romanization, audioURL string
			for _, trans := range word.Translations {
				if trans.LanguageID == topic.LanguageID {
					translation = trans.Translation
					romanization = trans.Romanization
					audioURL = trans.AudioURL
					break
				}
			}

			words[i] = dto.TopicWordInfo{
				ID:            word.ID,
				BaseWord:      word.BaseWord,
				Translation:   translation,
				Romanization:  romanization,
				AudioURL:      audioURL,
				ImageURL:      word.ImageURL,
				SequenceOrder: tw.SequenceOrder,
			}
		}
		response.Words = words
	}

	return response, nil
}
