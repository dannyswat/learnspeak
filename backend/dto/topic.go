package dto

// CreateTopicRequest represents the request to create a new topic
type CreateTopicRequest struct {
	Name         string `json:"name" validate:"required,min=1,max=200"`
	Description  string `json:"description" validate:"omitempty,max=1000"`
	Level        string `json:"level" validate:"required,oneof=beginner intermediate advanced"`
	LanguageCode string `json:"languageCode" validate:"required"`
	WordIDs      []uint `json:"wordIds" validate:"omitempty"`
	IsPublic     bool   `json:"isPublic"`
}

// UpdateTopicRequest represents the request to update a topic
type UpdateTopicRequest struct {
	Name         *string `json:"name" validate:"omitempty,min=1,max=200"`
	Description  *string `json:"description" validate:"omitempty,max=1000"`
	Level        *string `json:"level" validate:"omitempty,oneof=beginner intermediate advanced"`
	LanguageCode *string `json:"languageCode" validate:"omitempty"`
	WordIDs      *[]uint `json:"wordIds" validate:"omitempty"`
	IsPublic     *bool   `json:"isPublic"`
}

// ReorderTopicWordsRequest represents the request to reorder words in a topic
type ReorderTopicWordsRequest struct {
	WordIDs []uint `json:"wordIds" validate:"required,min=1"`
}

// TopicResponse represents a topic in response
type TopicResponse struct {
	ID                uint            `json:"id"`
	Name              string          `json:"name"`
	Description       string          `json:"description"`
	Level             string          `json:"level"`
	IsPublic          bool            `json:"isPublic"`
	Language          *LanguageInfo   `json:"language,omitempty"`
	CreatedBy         *CreatorInfo    `json:"createdBy,omitempty"`
	WordCount         int             `json:"wordCount"`
	Words             []TopicWordInfo `json:"words,omitempty"`
	QuizCount         int             `json:"quizCount"`
	ConversationCount int             `json:"conversationCount"`
	UsedInJourneys    int             `json:"usedInJourneys"`
	CreatedAt         string          `json:"createdAt"`
	UpdatedAt         string          `json:"updatedAt"`
}

// TopicWordInfo represents a word within a topic
type TopicWordInfo struct {
	ID            uint   `json:"id"`
	BaseWord      string `json:"baseWord"`
	Translation   string `json:"translation"`
	Romanization  string `json:"romanization"`
	AudioURL      string `json:"audioUrl"`
	ImageURL      string `json:"imageUrl"`
	SequenceOrder int    `json:"sequenceOrder"`
}

// TopicListResponse represents paginated topic list
type TopicListResponse struct {
	Topics     []TopicResponse `json:"topics"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	PageSize   int             `json:"pageSize"`
	TotalPages int             `json:"totalPages"`
}

// TopicFilterParams represents query parameters for filtering topics
type TopicFilterParams struct {
	Search       string `query:"search"`
	Level        string `query:"level"`
	LanguageCode string `query:"languageCode"`
	CreatedBy    uint   `query:"createdBy"`
	IsPublic     *bool  `query:"isPublic"`
	Page         int    `query:"page"`
	PageSize     int    `query:"pageSize"`
	IncludeWords bool   `query:"includeWords"`
}
