package services

import (
	"fmt"
	"math"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/models"
	"dannyswat/learnspeak/repositories"
)

type JourneyService interface {
	CreateJourney(req *dto.CreateJourneyRequest, userID uint) (*dto.JourneyResponse, error)
	GetJourney(id uint, includeTopics bool) (*dto.JourneyResponse, error)
	UpdateJourney(id uint, req *dto.UpdateJourneyRequest, userID uint) (*dto.JourneyResponse, error)
	DeleteJourney(id uint, userID uint) error
	ListJourneys(params *dto.JourneyFilterParams) (*dto.JourneyListResponse, error)
	ReorderTopics(journeyID uint, topicIDs []uint, userID uint) error
}

type journeyService struct {
	journeyRepo  repositories.JourneyRepository
	languageRepo repositories.LanguageRepository
	topicRepo    repositories.TopicRepository
}

func NewJourneyService(
	journeyRepo repositories.JourneyRepository,
	languageRepo repositories.LanguageRepository,
	topicRepo repositories.TopicRepository,
) JourneyService {
	return &journeyService{
		journeyRepo:  journeyRepo,
		languageRepo: languageRepo,
		topicRepo:    topicRepo,
	}
}

// CreateJourney creates a new journey with topics
func (s *journeyService) CreateJourney(req *dto.CreateJourneyRequest, userID uint) (*dto.JourneyResponse, error) {
	// Validate language
	language, err := s.languageRepo.GetByCode(req.LanguageCode)
	if err != nil {
		return nil, fmt.Errorf("language not found: %s", req.LanguageCode)
	}

	// Validate that all topics belong to the same language
	if len(req.TopicIDs) > 0 {
		for _, topicID := range req.TopicIDs {
			topic, err := s.topicRepo.GetByID(topicID, false)
			if err != nil {
				return nil, fmt.Errorf("topic %d not found", topicID)
			}
			if topic.LanguageID != language.ID {
				return nil, fmt.Errorf("topic '%s' (ID:%d) does not match journey language '%s'", topic.Name, topicID, language.Name)
			}
		}
	}

	// Create journey model
	journey := &models.Journey{
		Name:        req.Name,
		Description: req.Description,
		LanguageID:  language.ID,
		CreatedBy:   userID,
	}

	// Create journey
	if err := s.journeyRepo.Create(journey); err != nil {
		return nil, fmt.Errorf("failed to create journey: %w", err)
	}

	// Add topics if provided
	if len(req.TopicIDs) > 0 {
		if err := s.journeyRepo.AddTopics(journey.ID, req.TopicIDs); err != nil {
			return nil, fmt.Errorf("failed to add topics to journey: %w", err)
		}
	}

	// Fetch the created journey with relations
	createdJourney, err := s.journeyRepo.GetByID(journey.ID, false)
	if err != nil {
		return nil, err
	}

	return s.toJourneyResponse(createdJourney, false)
}

// GetJourney retrieves a journey by ID
func (s *journeyService) GetJourney(id uint, includeTopics bool) (*dto.JourneyResponse, error) {
	journey, err := s.journeyRepo.GetByID(id, includeTopics)
	if err != nil {
		return nil, err
	}

	return s.toJourneyResponse(journey, includeTopics)
}

// UpdateJourney updates an existing journey
func (s *journeyService) UpdateJourney(id uint, req *dto.UpdateJourneyRequest, userID uint) (*dto.JourneyResponse, error) {
	// Fetch existing journey
	journey, err := s.journeyRepo.GetByID(id, false)
	if err != nil {
		return nil, err
	}

	// Check ownership (only creator can update)
	if journey.CreatedBy != userID {
		return nil, fmt.Errorf("unauthorized: only the creator can update this journey")
	}

	// Update journey fields
	if req.Name != nil {
		journey.Name = *req.Name
	}
	if req.Description != nil {
		journey.Description = *req.Description
	}
	if req.LanguageCode != nil {
		language, err := s.languageRepo.GetByCode(*req.LanguageCode)
		if err != nil {
			return nil, fmt.Errorf("language not found: %s", *req.LanguageCode)
		}
		journey.LanguageID = language.ID
	}

	// Save journey updates
	if err := s.journeyRepo.Update(journey); err != nil {
		return nil, fmt.Errorf("failed to update journey: %w", err)
	}

	// Update topics if provided
	if req.TopicIDs != nil {
		// Validate all topics belong to the journey's language
		for _, topicID := range *req.TopicIDs {
			topic, err := s.topicRepo.GetByID(topicID, false)
			if err != nil {
				return nil, fmt.Errorf("topic %d not found", topicID)
			}
			if topic.LanguageID != journey.LanguageID {
				return nil, fmt.Errorf("topic '%s' (ID:%d) does not match journey language", topic.Name, topicID)
			}
		}

		// Get current topics
		currentTopics, err := s.journeyRepo.GetJourneyTopics(id)
		if err != nil {
			return nil, fmt.Errorf("failed to get current topics: %w", err)
		}

		// Create maps for comparison
		currentTopicMap := make(map[uint]bool)
		for _, jt := range currentTopics {
			currentTopicMap[jt.TopicID] = true
		}

		newTopicMap := make(map[uint]bool)
		for _, topicID := range *req.TopicIDs {
			newTopicMap[topicID] = true
		}

		// Find topics to add (in new but not in current)
		var topicsToAdd []uint
		for _, topicID := range *req.TopicIDs {
			if !currentTopicMap[topicID] {
				topicsToAdd = append(topicsToAdd, topicID)
			}
		}

		// Find topics to remove (in current but not in new)
		var topicsToRemove []uint
		for _, jt := range currentTopics {
			if !newTopicMap[jt.TopicID] {
				topicsToRemove = append(topicsToRemove, jt.TopicID)
			}
		}

		// Add new topics
		if len(topicsToAdd) > 0 {
			if err := s.journeyRepo.AddTopics(id, topicsToAdd); err != nil {
				return nil, fmt.Errorf("failed to add topics: %w", err)
			}
		}

		// Remove old topics
		if len(topicsToRemove) > 0 {
			if err := s.journeyRepo.RemoveTopics(id, topicsToRemove); err != nil {
				return nil, fmt.Errorf("failed to remove topics: %w", err)
			}
		}

		// Reorder all topics
		if len(*req.TopicIDs) > 0 {
			if err := s.journeyRepo.ReorderTopics(id, *req.TopicIDs); err != nil {
				return nil, fmt.Errorf("failed to reorder topics: %w", err)
			}
		}
	}

	// Fetch updated journey
	updatedJourney, err := s.journeyRepo.GetByID(id, false)
	if err != nil {
		return nil, err
	}

	return s.toJourneyResponse(updatedJourney, false)
}

// DeleteJourney deletes a journey
func (s *journeyService) DeleteJourney(id uint, userID uint) error {
	// Fetch existing journey to check ownership
	journey, err := s.journeyRepo.GetByID(id, false)
	if err != nil {
		return err
	}

	// Check ownership (only creator can delete)
	if journey.CreatedBy != userID {
		return fmt.Errorf("unauthorized: only the creator can delete this journey")
	}

	// Check if journey is assigned to users
	assignedCount, err := s.journeyRepo.GetAssignedUserCount(id)
	if err != nil {
		return fmt.Errorf("failed to check journey assignments: %w", err)
	}

	if assignedCount > 0 {
		return fmt.Errorf("journey is assigned to %d user(s) and cannot be deleted", assignedCount)
	}

	return s.journeyRepo.Delete(id)
}

// ListJourneys retrieves journeys with filtering and pagination
func (s *journeyService) ListJourneys(params *dto.JourneyFilterParams) (*dto.JourneyListResponse, error) {
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

	journeys, total, err := s.journeyRepo.List(
		params.Search,
		params.LanguageCode,
		params.CreatedBy,
		params.Page,
		params.PageSize,
		params.IncludeTopics,
	)
	if err != nil {
		return nil, err
	}

	// Convert to response DTOs
	journeyResponses := make([]dto.JourneyResponse, len(journeys))
	for i, journey := range journeys {
		response, err := s.toJourneyResponse(&journey, params.IncludeTopics)
		if err != nil {
			return nil, err
		}
		journeyResponses[i] = *response
	}

	totalPages := int(math.Ceil(float64(total) / float64(params.PageSize)))

	return &dto.JourneyListResponse{
		Journeys:   journeyResponses,
		Total:      total,
		Page:       params.Page,
		PageSize:   params.PageSize,
		TotalPages: totalPages,
	}, nil
}

// ReorderTopics reorders topics in a journey
func (s *journeyService) ReorderTopics(journeyID uint, topicIDs []uint, userID uint) error {
	// Fetch journey to check ownership
	journey, err := s.journeyRepo.GetByID(journeyID, false)
	if err != nil {
		return err
	}

	// Check ownership
	if journey.CreatedBy != userID {
		return fmt.Errorf("unauthorized: only the creator can reorder topics")
	}

	return s.journeyRepo.ReorderTopics(journeyID, topicIDs)
}

// toJourneyResponse converts a journey model to response DTO
func (s *journeyService) toJourneyResponse(journey *models.Journey, includeTopics bool) (*dto.JourneyResponse, error) {
	// Get counts
	topicCount, _ := s.journeyRepo.GetTopicCount(journey.ID)
	totalWords, _ := s.journeyRepo.GetTotalWords(journey.ID)
	assignedToCount, _ := s.journeyRepo.GetAssignedUserCount(journey.ID)

	response := &dto.JourneyResponse{
		ID:              journey.ID,
		Name:            journey.Name,
		Description:     journey.Description,
		TopicCount:      int(topicCount),
		TotalWords:      totalWords,
		AssignedToCount: int(assignedToCount),
		CreatedAt:       journey.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:       journey.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	// Add language info
	if journey.Language.ID > 0 {
		response.Language = &dto.LanguageInfo{
			ID:         journey.Language.ID,
			Code:       journey.Language.Code,
			Name:       journey.Language.Name,
			NativeName: journey.Language.NativeName,
		}
	}

	// Add creator info
	if journey.Creator.ID > 0 {
		response.CreatedBy = &dto.CreatorInfo{
			ID:    journey.Creator.ID,
			Name:  journey.Creator.Name,
			Email: journey.Creator.Email,
		}
	}

	// Add topics if requested
	if includeTopics && len(journey.Topics) > 0 {
		topics := make([]dto.JourneyTopicInfo, len(journey.Topics))
		for i, jt := range journey.Topics {
			topic := jt.Topic

			// Get word count and quiz count for the topic
			wordCount, _ := s.topicRepo.GetWordCount(topic.ID)
			quizCount, _ := s.topicRepo.GetQuizCount(topic.ID)

			topics[i] = dto.JourneyTopicInfo{
				ID:            topic.ID,
				Name:          topic.Name,
				Description:   topic.Description,
				Level:         topic.Level,
				WordCount:     int(wordCount),
				QuizCount:     int(quizCount),
				SequenceOrder: jt.SequenceOrder,
			}
		}
		response.Topics = topics
	}

	return response, nil
}
