package services

import (
	"fmt"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/models"
	"dannyswat/learnspeak/repositories"
)

type ConversationService interface {
	CreateConversation(req *dto.CreateConversationRequest, userID uint) (*dto.ConversationResponse, error)
	GetConversation(id uint) (*dto.ConversationResponse, error)
	UpdateConversation(id uint, req *dto.UpdateConversationRequest, userID uint) (*dto.ConversationResponse, error)
	DeleteConversation(id uint, userID uint) error
	ListConversations(params *dto.ConversationFilterParams) (*dto.ConversationListResponse, error)
	GetConversationsByTopic(topicID uint) ([]dto.ConversationResponse, error)
	AddLineToConversation(conversationID uint, req *dto.CreateConversationLineRequest, userID uint) (*dto.ConversationLineResponse, error)
	UpdateLine(conversationID uint, lineID uint, req *dto.UpdateConversationLineRequest, userID uint) (*dto.ConversationLineResponse, error)
	DeleteLine(conversationID uint, lineID uint, userID uint) error
	ReorderLines(conversationID uint, lineIDs []uint, userID uint) error
}

type conversationService struct {
	conversationRepo repositories.ConversationRepository
	languageRepo     repositories.LanguageRepository
}

func NewConversationService(conversationRepo repositories.ConversationRepository, languageRepo repositories.LanguageRepository) ConversationService {
	return &conversationService{
		conversationRepo: conversationRepo,
		languageRepo:     languageRepo,
	}
}

// CreateConversation creates a new conversation with its lines
func (s *conversationService) CreateConversation(req *dto.CreateConversationRequest, userID uint) (*dto.ConversationResponse, error) {
	// Validate language
	language, err := s.languageRepo.GetByCode(req.LanguageCode)
	if err != nil {
		return nil, fmt.Errorf("language not found: %s", req.LanguageCode)
	}

	// Create conversation model with lines
	conversation := &models.Conversation{
		Title:            req.Title,
		Description:      req.Description,
		Context:          req.Context,
		LanguageID:       language.ID,
		DifficultyLevel:  req.DifficultyLevel,
		ScenarioAudioURL: req.ScenarioAudioURL,
		ScenarioImageURL: req.ScenarioImageURL,
		CreatedBy:        userID,
		Lines:            make([]models.ConversationLine, len(req.Lines)),
	}

	// Convert lines
	for i, lineReq := range req.Lines {
		conversation.Lines[i] = models.ConversationLine{
			SequenceOrder: i + 1,
			SpeakerRole:   lineReq.SpeakerRole,
			EnglishText:   lineReq.EnglishText,
			TargetText:    lineReq.TargetText,
			Romanization:  lineReq.Romanization,
			AudioURL:      lineReq.AudioURL,
			ImageURL:      lineReq.ImageURL,
			IsLearnerLine: lineReq.IsLearnerLine,
		}
		if lineReq.WordID != nil && *lineReq.WordID > 0 {
			conversation.Lines[i].WordID = lineReq.WordID
		}
	}

	// Create conversation
	if err := s.conversationRepo.Create(conversation); err != nil {
		return nil, fmt.Errorf("failed to create conversation: %w", err)
	}

	// Fetch the created conversation with relations
	createdConversation, err := s.conversationRepo.GetByID(conversation.ID)
	if err != nil {
		return nil, err
	}

	return s.toConversationResponse(createdConversation)
}

// GetConversation retrieves a conversation by ID
func (s *conversationService) GetConversation(id uint) (*dto.ConversationResponse, error) {
	conversation, err := s.conversationRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	return s.toConversationResponse(conversation)
}

// UpdateConversation updates an existing conversation
func (s *conversationService) UpdateConversation(id uint, req *dto.UpdateConversationRequest, userID uint) (*dto.ConversationResponse, error) {
	// Get existing conversation
	conversation, err := s.conversationRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Check ownership
	if conversation.CreatedBy != userID {
		return nil, fmt.Errorf("unauthorized to update this conversation")
	}

	// Validate language if changed
	if req.LanguageCode != "" {
		language, err := s.languageRepo.GetByCode(req.LanguageCode)
		if err != nil {
			return nil, fmt.Errorf("language not found: %s", req.LanguageCode)
		}
		conversation.LanguageID = language.ID
	}

	// Update fields
	if req.Title != "" {
		conversation.Title = req.Title
	}
	if req.Description != "" {
		conversation.Description = req.Description
	}
	if req.Context != "" {
		conversation.Context = req.Context
	}
	if req.DifficultyLevel != "" {
		conversation.DifficultyLevel = req.DifficultyLevel
	}
	if req.ScenarioAudioURL != "" {
		conversation.ScenarioAudioURL = req.ScenarioAudioURL
	}
	if req.ScenarioImageURL != "" {
		conversation.ScenarioImageURL = req.ScenarioImageURL
	}

	// Update conversation
	if err := s.conversationRepo.Update(conversation); err != nil {
		return nil, fmt.Errorf("failed to update conversation: %w", err)
	}

	// Fetch updated conversation
	updatedConversation, err := s.conversationRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	return s.toConversationResponse(updatedConversation)
}

// DeleteConversation deletes a conversation
func (s *conversationService) DeleteConversation(id uint, userID uint) error {
	// Get existing conversation
	conversation, err := s.conversationRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check ownership
	if conversation.CreatedBy != userID {
		return fmt.Errorf("unauthorized to delete this conversation")
	}

	return s.conversationRepo.Delete(id)
}

// ListConversations retrieves conversations with filtering and pagination
func (s *conversationService) ListConversations(params *dto.ConversationFilterParams) (*dto.ConversationListResponse, error) {
	conversations, total, err := s.conversationRepo.List(
		params.Search,
		params.LanguageCode,
		params.DifficultyLevel,
		params.CreatedBy,
		params.Page,
		params.PageSize,
	)
	if err != nil {
		return nil, err
	}

	// Convert to response DTOs
	conversationResponses := make([]dto.ConversationResponse, len(conversations))
	for i, conv := range conversations {
		resp, err := s.toConversationResponse(&conv)
		if err != nil {
			return nil, err
		}
		conversationResponses[i] = *resp
	}

	return &dto.ConversationListResponse{
		Conversations: conversationResponses,
		Total:         total,
		Page:          params.Page,
		PageSize:      params.PageSize,
	}, nil
}

// GetConversationsByTopic retrieves all conversations for a specific topic
func (s *conversationService) GetConversationsByTopic(topicID uint) ([]dto.ConversationResponse, error) {
	conversations, err := s.conversationRepo.GetByTopicID(topicID)
	if err != nil {
		return nil, err
	}

	// Convert to response DTOs
	conversationResponses := make([]dto.ConversationResponse, len(conversations))
	for i, conv := range conversations {
		resp, err := s.toConversationResponse(&conv)
		if err != nil {
			return nil, err
		}
		conversationResponses[i] = *resp
	}

	return conversationResponses, nil
}

// AddLineToConversation adds a new line to a conversation
func (s *conversationService) AddLineToConversation(conversationID uint, req *dto.CreateConversationLineRequest, userID uint) (*dto.ConversationLineResponse, error) {
	// Verify conversation exists and user owns it
	conversation, err := s.conversationRepo.GetByID(conversationID)
	if err != nil {
		return nil, err
	}

	if conversation.CreatedBy != userID {
		return nil, fmt.Errorf("unauthorized to modify this conversation")
	}

	// Create line
	line := models.ConversationLine{
		ConversationID: conversationID,
		SequenceOrder:  req.SequenceOrder,
		SpeakerRole:    req.SpeakerRole,
		EnglishText:    req.EnglishText,
		TargetText:     req.TargetText,
		Romanization:   req.Romanization,
		AudioURL:       req.AudioURL,
		ImageURL:       req.ImageURL,
		IsLearnerLine:  req.IsLearnerLine,
	}

	if req.WordID != nil && *req.WordID > 0 {
		line.WordID = req.WordID
	}

	if err := s.conversationRepo.AddLinesToConversation(conversationID, []models.ConversationLine{line}); err != nil {
		return nil, fmt.Errorf("failed to add line to conversation: %w", err)
	}

	return s.toConversationLineResponse(&line), nil
}

// UpdateLine updates a conversation line
func (s *conversationService) UpdateLine(conversationID uint, lineID uint, req *dto.UpdateConversationLineRequest, userID uint) (*dto.ConversationLineResponse, error) {
	// Verify conversation exists and user owns it
	conversation, err := s.conversationRepo.GetByID(conversationID)
	if err != nil {
		return nil, err
	}

	if conversation.CreatedBy != userID {
		return nil, fmt.Errorf("unauthorized to modify this conversation")
	}

	// Find the line in the conversation
	var line *models.ConversationLine
	for i := range conversation.Lines {
		if conversation.Lines[i].ID == lineID {
			line = &conversation.Lines[i]
			break
		}
	}

	if line == nil {
		return nil, fmt.Errorf("line not found in conversation")
	}

	// Update fields
	if req.SpeakerRole != "" {
		line.SpeakerRole = req.SpeakerRole
	}
	if req.EnglishText != "" {
		line.EnglishText = req.EnglishText
	}
	if req.TargetText != "" {
		line.TargetText = req.TargetText
	}
	if req.Romanization != "" {
		line.Romanization = req.Romanization
	}
	if req.AudioURL != "" {
		line.AudioURL = req.AudioURL
	}
	if req.ImageURL != "" {
		line.ImageURL = req.ImageURL
	}
	if req.IsLearnerLine != nil {
		line.IsLearnerLine = *req.IsLearnerLine
	}
	if req.WordID != nil {
		line.WordID = req.WordID
	}

	if err := s.conversationRepo.UpdateLine(line); err != nil {
		return nil, fmt.Errorf("failed to update line: %w", err)
	}

	return s.toConversationLineResponse(line), nil
}

// DeleteLine deletes a conversation line
func (s *conversationService) DeleteLine(conversationID uint, lineID uint, userID uint) error {
	// Verify conversation exists and user owns it
	conversation, err := s.conversationRepo.GetByID(conversationID)
	if err != nil {
		return err
	}

	if conversation.CreatedBy != userID {
		return fmt.Errorf("unauthorized to modify this conversation")
	}

	return s.conversationRepo.DeleteLine(lineID)
}

// ReorderLines updates the sequence order of lines
func (s *conversationService) ReorderLines(conversationID uint, lineIDs []uint, userID uint) error {
	// Verify conversation exists and user owns it
	conversation, err := s.conversationRepo.GetByID(conversationID)
	if err != nil {
		return err
	}

	if conversation.CreatedBy != userID {
		return fmt.Errorf("unauthorized to modify this conversation")
	}

	return s.conversationRepo.ReorderLines(conversationID, lineIDs)
}

// Helper function to convert model to response DTO
func (s *conversationService) toConversationResponse(conversation *models.Conversation) (*dto.ConversationResponse, error) {
	lines := make([]dto.ConversationLineResponse, len(conversation.Lines))
	for i, line := range conversation.Lines {
		lines[i] = *s.toConversationLineResponse(&line)
	}

	return &dto.ConversationResponse{
		ID:               conversation.ID,
		Title:            conversation.Title,
		Description:      conversation.Description,
		Context:          conversation.Context,
		LanguageCode:     conversation.Language.Code,
		LanguageName:     conversation.Language.Name,
		DifficultyLevel:  conversation.DifficultyLevel,
		ScenarioAudioURL: conversation.ScenarioAudioURL,
		ScenarioImageURL: conversation.ScenarioImageURL,
		Lines:            lines,
		CreatedBy:        conversation.CreatedBy,
		CreatedAt:        conversation.CreatedAt,
		UpdatedAt:        conversation.UpdatedAt,
	}, nil
}

// Helper function to convert line model to response DTO
func (s *conversationService) toConversationLineResponse(line *models.ConversationLine) *dto.ConversationLineResponse {
	return &dto.ConversationLineResponse{
		ID:            line.ID,
		SequenceOrder: line.SequenceOrder,
		SpeakerRole:   line.SpeakerRole,
		EnglishText:   line.EnglishText,
		TargetText:    line.TargetText,
		Romanization:  line.Romanization,
		AudioURL:      line.AudioURL,
		ImageURL:      line.ImageURL,
		WordID:        line.WordID,
		IsLearnerLine: line.IsLearnerLine,
	}
}
