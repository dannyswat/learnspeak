package dto

// CreateJourneyRequest represents the request to create a new journey
type CreateJourneyRequest struct {
	Name         string `json:"name" validate:"required,min=1,max=200"`
	Description  string `json:"description" validate:"omitempty,max=1000"`
	LanguageCode string `json:"languageCode" validate:"required"`
	TopicIDs     []uint `json:"topicIds" validate:"omitempty"`
}

// UpdateJourneyRequest represents the request to update a journey
type UpdateJourneyRequest struct {
	Name         *string `json:"name" validate:"omitempty,min=1,max=200"`
	Description  *string `json:"description" validate:"omitempty,max=1000"`
	LanguageCode *string `json:"languageCode" validate:"omitempty"`
	TopicIDs     *[]uint `json:"topicIds" validate:"omitempty"`
}

// ReorderJourneyTopicsRequest represents the request to reorder topics in a journey
type ReorderJourneyTopicsRequest struct {
	TopicIDs []uint `json:"topicIds" validate:"required,min=1"`
}

// JourneyTopicInfo represents a topic within a journey
type JourneyTopicInfo struct {
	ID            uint   `json:"id"`
	Name          string `json:"name"`
	Description   string `json:"description"`
	Level         string `json:"level"`
	WordCount     int    `json:"wordCount"`
	QuizCount     int    `json:"quizCount"`
	SequenceOrder int    `json:"sequenceOrder"`
	Completed     bool   `json:"completed,omitempty"`
	QuizScore     *int   `json:"quizScore,omitempty"`
}

// JourneyResponse represents a journey in response
type JourneyResponse struct {
	ID              uint               `json:"id"`
	Name            string             `json:"name"`
	Description     string             `json:"description"`
	Language        *LanguageInfo      `json:"language,omitempty"`
	CreatedBy       *CreatorInfo       `json:"createdBy,omitempty"`
	TopicCount      int                `json:"topicCount"`
	TotalWords      int                `json:"totalWords"`
	Topics          []JourneyTopicInfo `json:"topics,omitempty"`
	AssignedToCount int                `json:"assignedToCount"`
	Progress        int                `json:"progress,omitempty"`
	CreatedAt       string             `json:"createdAt"`
	UpdatedAt       string             `json:"updatedAt"`
}

// JourneyListResponse represents paginated journey list
type JourneyListResponse struct {
	Journeys   []JourneyResponse `json:"journeys"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"pageSize"`
	TotalPages int               `json:"totalPages"`
}

// JourneyFilterParams represents query parameters for filtering journeys
type JourneyFilterParams struct {
	Search        string `query:"search"`
	LanguageCode  string `query:"languageCode"`
	CreatedBy     uint   `query:"createdBy"`
	Page          int    `query:"page"`
	PageSize      int    `query:"pageSize"`
	IncludeTopics bool   `query:"includeTopics"`
}

// AssignJourneyRequest represents the request to assign a journey to users
type AssignJourneyRequest struct {
	UserIDs []uint `json:"userIds" validate:"required,min=1"`
	Message string `json:"message" validate:"omitempty,max=500"`
}

// JourneyAssignment represents an assignment
type JourneyAssignment struct {
	UserID     uint   `json:"userId"`
	UserName   string `json:"userName"`
	AssignedAt string `json:"assignedAt"`
}

// AssignJourneyResponse represents the response after assigning a journey
type AssignJourneyResponse struct {
	AssignedCount int                 `json:"assignedCount"`
	Assignments   []JourneyAssignment `json:"assignments"`
}

// UserJourneyResponse represents a journey assignment for a user
type UserJourneyResponse struct {
	ID              uint             `json:"id"`
	UserID          uint             `json:"userId"`
	JourneyID       uint             `json:"journeyId"`
	Journey         *JourneyResponse `json:"journey,omitempty"`
	User            *UserInfo        `json:"user,omitempty"`
	AssignedBy      *UserInfo        `json:"assignedBy,omitempty"`
	Status          string           `json:"status"`
	AssignedAt      string           `json:"assignedAt"`
	StartedAt       *string          `json:"startedAt,omitempty"`
	CompletedAt     *string          `json:"completedAt,omitempty"`
	Progress        float64          `json:"progress,omitempty"`
	TotalTopics     int              `json:"totalTopics,omitempty"`
	CompletedTopics int              `json:"completedTopics,omitempty"`
}

// UserInfo represents basic user information
type UserInfo struct {
	ID       uint     `json:"id"`
	Username string   `json:"username"`
	Name     string   `json:"name"`
	Email    string   `json:"email"`
	Roles    []string `json:"roles,omitempty"`
}

// UnassignJourneyRequest represents the request to unassign a journey
type UnassignJourneyRequest struct {
	UserIDs []uint `json:"userIds" validate:"required,min=1"`
}

// UserJourneyListResponse represents paginated user journey list
type UserJourneyListResponse struct {
	UserJourneys []UserJourneyResponse `json:"userJourneys"`
	Total        int64                 `json:"total"`
	Page         int                   `json:"page"`
	PageSize     int                   `json:"pageSize"`
	TotalPages   int                   `json:"totalPages"`
}
