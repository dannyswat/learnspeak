package dto

import "time"

// CreateConversationRequest represents the request to create a new conversation
type CreateConversationRequest struct {
	Title            string                          `json:"title" validate:"required,min=1,max=200"`
	Description      string                          `json:"description" validate:"omitempty,max=1000"`
	Context          string                          `json:"context" validate:"omitempty,max=2000"`
	LanguageCode     string                          `json:"languageCode" validate:"required"`
	DifficultyLevel  string                          `json:"difficultyLevel" validate:"required,oneof=beginner intermediate advanced"`
	ScenarioAudioURL string                          `json:"scenarioAudioUrl" validate:"omitempty,url"`
	ScenarioImageURL string                          `json:"scenarioImageUrl" validate:"omitempty,url"`
	Lines            []CreateConversationLineRequest `json:"lines" validate:"required,min=1,dive"`
}

// UpdateConversationRequest represents the request to update a conversation
type UpdateConversationRequest struct {
	Title            string `json:"title" validate:"omitempty,min=1,max=200"`
	Description      string `json:"description" validate:"omitempty,max=1000"`
	Context          string `json:"context" validate:"omitempty,max=2000"`
	LanguageCode     string `json:"languageCode" validate:"omitempty"`
	DifficultyLevel  string `json:"difficultyLevel" validate:"omitempty,oneof=beginner intermediate advanced"`
	ScenarioAudioURL string `json:"scenarioAudioUrl" validate:"omitempty,url"`
	ScenarioImageURL string `json:"scenarioImageUrl" validate:"omitempty,url"`
}

// CreateConversationLineRequest represents a line in a conversation
type CreateConversationLineRequest struct {
	SequenceOrder int    `json:"sequenceOrder" validate:"required,min=1"`
	SpeakerRole   string `json:"speakerRole" validate:"required,min=1,max=100"`
	EnglishText   string `json:"englishText" validate:"required,min=1"`
	TargetText    string `json:"targetText" validate:"required,min=1"`
	Romanization  string `json:"romanization" validate:"omitempty"`
	AudioURL      string `json:"audioUrl" validate:"omitempty,url"`
	ImageURL      string `json:"imageUrl" validate:"omitempty,url"`
	WordID        *uint  `json:"wordId" validate:"omitempty"`
	IsLearnerLine bool   `json:"isLearnerLine"`
}

// UpdateConversationLineRequest represents the request to update a conversation line
type UpdateConversationLineRequest struct {
	SpeakerRole   string `json:"speakerRole" validate:"omitempty,min=1,max=100"`
	EnglishText   string `json:"englishText" validate:"omitempty,min=1"`
	TargetText    string `json:"targetText" validate:"omitempty,min=1"`
	Romanization  string `json:"romanization" validate:"omitempty"`
	AudioURL      string `json:"audioUrl" validate:"omitempty,url"`
	ImageURL      string `json:"imageUrl" validate:"omitempty,url"`
	WordID        *uint  `json:"wordId" validate:"omitempty"`
	IsLearnerLine *bool  `json:"isLearnerLine" validate:"omitempty"`
}

// ReorderConversationLinesRequest represents the request to reorder lines in a conversation
type ReorderConversationLinesRequest struct {
	LineIDs []uint `json:"lineIds" validate:"required,min=1"`
}

// ConversationResponse represents a conversation in response
type ConversationResponse struct {
	ID               uint                       `json:"id"`
	Title            string                     `json:"title"`
	Description      string                     `json:"description"`
	Context          string                     `json:"context"`
	LanguageCode     string                     `json:"languageCode"`
	LanguageName     string                     `json:"languageName"`
	DifficultyLevel  string                     `json:"difficultyLevel"`
	ScenarioAudioURL string                     `json:"scenarioAudioUrl"`
	ScenarioImageURL string                     `json:"scenarioImageUrl"`
	Lines            []ConversationLineResponse `json:"lines"`
	CreatedBy        uint                       `json:"createdBy"`
	CreatedAt        time.Time                  `json:"createdAt"`
	UpdatedAt        time.Time                  `json:"updatedAt"`
}

// ConversationLineResponse represents a conversation line in response
type ConversationLineResponse struct {
	ID            uint   `json:"id"`
	SequenceOrder int    `json:"sequenceOrder"`
	SpeakerRole   string `json:"speakerRole"`
	EnglishText   string `json:"englishText"`
	TargetText    string `json:"targetText"`
	Romanization  string `json:"romanization"`
	AudioURL      string `json:"audioUrl"`
	ImageURL      string `json:"imageUrl"`
	WordID        *uint  `json:"wordId"`
	IsLearnerLine bool   `json:"isLearnerLine"`
}

// ConversationListResponse represents paginated conversation list
type ConversationListResponse struct {
	Conversations []ConversationResponse `json:"conversations"`
	Total         int64                  `json:"total"`
	Page          int                    `json:"page"`
	PageSize      int                    `json:"pageSize"`
	TotalPages    int                    `json:"totalPages"`
}

// ConversationFilterParams represents query parameters for filtering conversations
type ConversationFilterParams struct {
	Search          string `query:"search"`
	LanguageCode    string `query:"languageCode"`
	DifficultyLevel string `query:"difficultyLevel"`
	CreatedBy       uint   `query:"createdBy"`
	Page            int    `query:"page"`
	PageSize        int    `query:"pageSize"`
}
