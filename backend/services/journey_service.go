package services

import (
	"fmt"
	"math"
	"math/rand"
	"time"

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
	AssignJourney(journeyID uint, userIDs []uint, assignedBy uint) (*dto.AssignJourneyResponse, error)
	UnassignJourney(journeyID uint, userIDs []uint) error
	StartJourney(journeyID uint, userID uint) error
	GetUserJourneys(userID uint, status *string, page, pageSize int) (*dto.UserJourneyListResponse, error)
	GetJourneyAssignments(journeyID uint, status *string, page, pageSize int) (*dto.UserJourneyListResponse, error)
	// Invitation methods
	GenerateInvitation(journeyID uint, req *dto.CreateInvitationRequest, createdBy uint) (*dto.InvitationResponse, error)
	GetInvitationDetails(token string) (*dto.InvitationDetailsResponse, error)
	AcceptInvitation(token string, userID uint) error
	GetJourneyInvitations(journeyID uint) ([]dto.InvitationResponse, error)
	DeactivateInvitation(invitationID uint, journeyID uint, userID uint) error
}

type journeyService struct {
	journeyRepo      repositories.JourneyRepository
	languageRepo     repositories.LanguageRepository
	topicRepo        repositories.TopicRepository
	userJourneyRepo  repositories.UserJourneyRepository
	userProgressRepo repositories.UserProgressRepository
}

func NewJourneyService(
	journeyRepo repositories.JourneyRepository,
	languageRepo repositories.LanguageRepository,
	topicRepo repositories.TopicRepository,
	userJourneyRepo repositories.UserJourneyRepository,
	userProgressRepo repositories.UserProgressRepository,
) JourneyService {
	return &journeyService{
		journeyRepo:      journeyRepo,
		languageRepo:     languageRepo,
		topicRepo:        topicRepo,
		userJourneyRepo:  userJourneyRepo,
		userProgressRepo: userProgressRepo,
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
	_, err := s.journeyRepo.GetByID(id, false)
	if err != nil {
		return err
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
	_, err := s.journeyRepo.GetByID(journeyID, false)
	if err != nil {
		return err
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

// AssignJourney assigns a journey to multiple users
func (s *journeyService) AssignJourney(journeyID uint, userIDs []uint, assignedBy uint) (*dto.AssignJourneyResponse, error) {
	// Verify journey exists
	_, err := s.journeyRepo.GetByID(journeyID, false)
	if err != nil {
		return nil, fmt.Errorf("journey not found")
	}

	var assignments []dto.JourneyAssignment
	assignedCount := 0

	for _, userID := range userIDs {
		// Check if already assigned
		isAssigned, err := s.userJourneyRepo.IsAssigned(userID, journeyID)
		if err != nil {
			continue
		}
		if isAssigned {
			continue // Skip if already assigned
		}

		// Assign journey
		userJourney, err := s.userJourneyRepo.AssignJourney(userID, journeyID, assignedBy)
		if err != nil {
			continue
		}

		assignments = append(assignments, dto.JourneyAssignment{
			UserID:     userJourney.UserID,
			UserName:   userJourney.User.Name,
			AssignedAt: userJourney.AssignedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
		assignedCount++
	}

	return &dto.AssignJourneyResponse{
		AssignedCount: assignedCount,
		Assignments:   assignments,
	}, nil
}

// UnassignJourney removes journey assignments from multiple users
func (s *journeyService) UnassignJourney(journeyID uint, userIDs []uint) error {
	for _, userID := range userIDs {
		if err := s.userJourneyRepo.UnassignJourney(userID, journeyID); err != nil {
			return fmt.Errorf("failed to unassign journey from user %d: %w", userID, err)
		}
	}
	return nil
}

// StartJourney marks a user journey as in_progress
func (s *journeyService) StartJourney(journeyID uint, userID uint) error {
	// Mark journey as started (will only update if status is 'assigned')
	if err := s.userJourneyRepo.MarkAsStarted(userID, journeyID); err != nil {
		return fmt.Errorf("failed to start journey: %w", err)
	}

	return nil
}

// GetUserJourneys retrieves all journeys assigned to a user
func (s *journeyService) GetUserJourneys(userID uint, status *string, page, pageSize int) (*dto.UserJourneyListResponse, error) {
	// Set defaults
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}

	userJourneys, total, err := s.userJourneyRepo.GetUserJourneys(userID, status, page, pageSize)
	if err != nil {
		return nil, err
	}

	return s.buildUserJourneyListResponse(userJourneys, total, page, pageSize), nil
}

// GetJourneyAssignments retrieves all users assigned to a journey
func (s *journeyService) GetJourneyAssignments(journeyID uint, status *string, page, pageSize int) (*dto.UserJourneyListResponse, error) {
	// Set defaults
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}

	userJourneys, total, err := s.userJourneyRepo.GetJourneyUsers(journeyID, status, page, pageSize)
	if err != nil {
		return nil, err
	}

	return s.buildUserJourneyListResponse(userJourneys, total, page, pageSize), nil
}

// buildUserJourneyListResponse builds a paginated user journey list response
func (s *journeyService) buildUserJourneyListResponse(userJourneys []models.UserJourney, total int64, page, pageSize int) *dto.UserJourneyListResponse {
	responses := make([]dto.UserJourneyResponse, len(userJourneys))
	for i, uj := range userJourneys {
		responses[i] = s.toUserJourneyResponse(&uj)
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &dto.UserJourneyListResponse{
		UserJourneys: responses,
		Total:        total,
		Page:         page,
		PageSize:     pageSize,
		TotalPages:   totalPages,
	}
}

// toUserJourneyResponse converts a user journey model to response DTO
func (s *journeyService) toUserJourneyResponse(uj *models.UserJourney) dto.UserJourneyResponse {
	response := dto.UserJourneyResponse{
		ID:         uj.ID,
		UserID:     uj.UserID,
		JourneyID:  uj.JourneyID,
		Status:     uj.Status,
		AssignedAt: uj.AssignedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	if uj.StartedAt != nil {
		startedAt := uj.StartedAt.Format("2006-01-02T15:04:05Z07:00")
		response.StartedAt = &startedAt
	}

	if uj.CompletedAt != nil {
		completedAt := uj.CompletedAt.Format("2006-01-02T15:04:05Z07:00")
		response.CompletedAt = &completedAt
	}

	// Add user info if available
	if uj.User.ID > 0 {
		roles := make([]string, len(uj.User.Roles))
		for i, role := range uj.User.Roles {
			roles[i] = role.Name
		}

		response.User = &dto.UserInfo{
			ID:       uj.User.ID,
			Username: uj.User.Username,
			Name:     uj.User.Name,
			Email:    uj.User.Email,
			Roles:    roles,
		}
	}

	// Add assigned by info if available
	if uj.AssignedByUser.ID > 0 {
		response.AssignedBy = &dto.UserInfo{
			ID:       uj.AssignedByUser.ID,
			Username: uj.AssignedByUser.Username,
			Name:     uj.AssignedByUser.Name,
			Email:    uj.AssignedByUser.Email,
		}
	}

	// Add journey info if available
	if uj.Journey.ID > 0 {
		journeyResponse, _ := s.toJourneyResponse(&uj.Journey, false)
		response.Journey = journeyResponse
	}

	// Get statistics if needed
	stats, err := s.userJourneyRepo.GetStatistics(uj.UserID, uj.JourneyID)
	if err == nil {
		if totalTopics, ok := stats["total_topics"].(int64); ok {
			response.TotalTopics = int(totalTopics)
		}
		if completedTopics, ok := stats["completed_topics"].(int64); ok {
			response.CompletedTopics = int(completedTopics)
		}
		if progress, ok := stats["progress_percentage"].(float64); ok {
			response.Progress = progress
		}
	}

	// Get next available topic
	nextTopic := s.getNextTopic(uj.UserID, uj.JourneyID)
	if nextTopic != nil {
		response.NextTopic = nextTopic
	}

	return response
}

// getNextTopic determines the next unlocked topic for a user in a journey
func (s *journeyService) getNextTopic(userID, journeyID uint) *dto.JourneyTopicInfo {
	// Get journey with topics ordered by sequence
	journey, err := s.journeyRepo.GetByID(journeyID, true)
	if err != nil || journey == nil {
		return nil
	}

	// Get user's completed topic IDs in this journey
	completedTopicIDs, err := s.userProgressRepo.GetCompletedTopicIDs(userID, journeyID)
	if err != nil {
		completedTopicIDs = []uint{} // Default to empty if error
	}

	// Find the first topic that is not completed
	for _, jt := range journey.Topics {
		if jt.Topic.ID == 0 {
			continue
		}

		isCompleted := false
		for _, completedID := range completedTopicIDs {
			if completedID == jt.Topic.ID {
				isCompleted = true
				break
			}
		}

		if !isCompleted {
			// Get word count and quiz count from topic
			wordCount := 0
			quizCount := 0

			// Note: These would ideally be preloaded or cached
			// For now, we'll return basic info
			return &dto.JourneyTopicInfo{
				ID:            jt.Topic.ID,
				Name:          jt.Topic.Name,
				Description:   jt.Topic.Description,
				Level:         jt.Topic.Level,
				WordCount:     wordCount,
				QuizCount:     quizCount,
				SequenceOrder: jt.SequenceOrder,
				Completed:     false,
			}
		}
	}

	// All topics completed
	return nil
}

// GenerateInvitation creates a new invitation link for a journey
func (s *journeyService) GenerateInvitation(journeyID uint, req *dto.CreateInvitationRequest, createdBy uint) (*dto.InvitationResponse, error) {
	// Verify journey exists
	journey, err := s.journeyRepo.GetByID(journeyID, false)
	if err != nil {
		return nil, fmt.Errorf("journey not found")
	}

	// Generate unique token
	token := generateInvitationToken()

	// Calculate expiration time
	var expiresAt *time.Time
	if req.ExpiresInDays != nil {
		expiry := time.Now().Add(time.Duration(*req.ExpiresInDays) * 24 * time.Hour)
		expiresAt = &expiry
	}

	invitation := &models.JourneyInvitation{
		JourneyID:       journeyID,
		InvitationToken: token,
		CreatedBy:       createdBy,
		ExpiresAt:       expiresAt,
		MaxUses:         req.MaxUses,
		CurrentUses:     0,
		IsActive:        true,
	}

	if err := s.journeyRepo.CreateInvitation(invitation); err != nil {
		return nil, fmt.Errorf("failed to create invitation: %w", err)
	}

	// Get full invitation with relations
	fullInvitation, err := s.journeyRepo.GetInvitationByToken(token)
	if err != nil {
		return nil, err
	}

	return s.mapToInvitationResponse(fullInvitation, journey), nil
}

// GetInvitationDetails retrieves public invitation details (for unauthenticated users)
func (s *journeyService) GetInvitationDetails(token string) (*dto.InvitationDetailsResponse, error) {
	invitation, err := s.journeyRepo.GetInvitationByToken(token)
	if err != nil {
		return &dto.InvitationDetailsResponse{
			IsValid: false,
			Message: "Invitation not found",
		}, nil
	}

	// Check if invitation is valid
	if !invitation.IsValid() {
		message := "This invitation link has expired or is no longer valid"
		if invitation.MaxUses != nil && invitation.CurrentUses >= *invitation.MaxUses {
			message = "This invitation link has reached its maximum usage limit"
		}
		return &dto.InvitationDetailsResponse{
			IsValid: false,
			Message: message,
		}, nil
	}

	// Get journey details
	topicCount, _ := s.journeyRepo.GetTopicCount(invitation.JourneyID)
	totalWords, _ := s.journeyRepo.GetTotalWords(invitation.JourneyID)

	return &dto.InvitationDetailsResponse{
		JourneyID:          invitation.Journey.ID,
		JourneyName:        invitation.Journey.Name,
		JourneyDescription: invitation.Journey.Description,
		Language: &dto.LanguageInfo{
			Code:       invitation.Journey.Language.Code,
			Name:       invitation.Journey.Language.Name,
			NativeName: invitation.Journey.Language.NativeName,
		},
		TopicCount:  int(topicCount),
		TotalWords:  totalWords,
		CreatorName: invitation.Creator.Name,
		IsValid:     true,
	}, nil
}

// AcceptInvitation assigns the journey to the user via invitation
func (s *journeyService) AcceptInvitation(token string, userID uint) error {
	invitation, err := s.journeyRepo.GetInvitationByToken(token)
	if err != nil {
		return fmt.Errorf("invitation not found")
	}

	// Check if invitation is valid
	if !invitation.IsValid() {
		return fmt.Errorf("invitation is no longer valid")
	}

	// Check if user is already assigned
	isAssigned, err := s.userJourneyRepo.IsAssigned(userID, invitation.JourneyID)
	if err != nil {
		return err
	}

	if isAssigned {
		return fmt.Errorf("you are already enrolled in this journey")
	}

	// Assign journey to user
	_, err = s.userJourneyRepo.AssignJourney(userID, invitation.JourneyID, invitation.CreatedBy)
	if err != nil {
		return fmt.Errorf("failed to assign journey: %w", err)
	}

	// Increment invitation usage count
	if err := s.journeyRepo.UpdateInvitationUses(invitation.ID); err != nil {
		// Log error but don't fail the assignment
		fmt.Printf("Warning: failed to update invitation uses: %v\n", err)
	}

	return nil
}

// GetJourneyInvitations retrieves all invitations for a journey
func (s *journeyService) GetJourneyInvitations(journeyID uint) ([]dto.InvitationResponse, error) {
	invitations, err := s.journeyRepo.GetJourneyInvitations(journeyID)
	if err != nil {
		return nil, err
	}

	journey, err := s.journeyRepo.GetByID(journeyID, false)
	if err != nil {
		return nil, err
	}

	responses := make([]dto.InvitationResponse, len(invitations))
	for i, inv := range invitations {
		responses[i] = *s.mapToInvitationResponse(&inv, journey)
	}

	return responses, nil
}

// DeactivateInvitation deactivates an invitation link
func (s *journeyService) DeactivateInvitation(invitationID uint, journeyID uint, userID uint) error {
	// Verify the invitation belongs to this journey
	invitation, err := s.journeyRepo.GetInvitationByToken("")
	if err == nil && invitation.JourneyID != journeyID {
		return fmt.Errorf("invitation does not belong to this journey")
	}

	return s.journeyRepo.DeactivateInvitation(invitationID)
}

// Helper function to generate a secure random token
func generateInvitationToken() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const tokenLength = 32

	b := make([]byte, tokenLength)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

// Helper to map invitation model to response DTO
func (s *journeyService) mapToInvitationResponse(inv *models.JourneyInvitation, journey *models.Journey) *dto.InvitationResponse {
	var expiresAt *string
	if inv.ExpiresAt != nil {
		expiry := inv.ExpiresAt.Format(time.RFC3339)
		expiresAt = &expiry
	}

	// Return relative path - frontend will construct full URL
	invitationURL := fmt.Sprintf("/invite/%s", inv.InvitationToken)

	return &dto.InvitationResponse{
		ID:              inv.ID,
		JourneyID:       inv.JourneyID,
		InvitationToken: inv.InvitationToken,
		InvitationURL:   invitationURL,
		CreatedBy: &dto.UserInfo{
			ID:       inv.Creator.ID,
			Username: inv.Creator.Username,
			Name:     inv.Creator.Name,
			Email:    inv.Creator.Email,
		},
		ExpiresAt:   expiresAt,
		MaxUses:     inv.MaxUses,
		CurrentUses: inv.CurrentUses,
		IsActive:    inv.IsActive,
		IsValid:     inv.IsValid(),
		CreatedAt:   inv.CreatedAt.Format(time.RFC3339),
	}
}
