# LearnSpeak - Go Backend Models

**Version**: 1.0  
**Language**: Go  
**Date**: October 11, 2025

---

## Package Structure

```
backend/
├── models/
│   ├── user.go
│   ├── word.go
│   ├── topic.go
│   ├── journey.go
│   ├── quiz.go
│   ├── progress.go
│   ├── achievement.go
│   ├── bookmark.go
│   ├── note.go
│   └── srs.go
├── dto/
│   ├── auth.go
│   ├── user.go
│   ├── word.go
│   ├── topic.go
│   ├── journey.go
│   ├── quiz.go
│   ├── progress.go
│   └── response.go
└── database/
    └── db.go
```

---

## 1. Database Models

### models/user.go

```go
package models

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID             int       `json:"id" gorm:"primaryKey"`
	Username       string    `json:"username" gorm:"uniqueIndex;size:50;not null"`
	PasswordHash   string    `json:"-" gorm:"size:255;not null"`
	Email          string    `json:"email" gorm:"uniqueIndex;size:255"`
	Name           string    `json:"name" gorm:"size:100;not null"`
	ProfilePicURL  *string   `json:"profilePicUrl" gorm:"size:500"`
	CreatedAt      time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
	
	// Relationships
	Roles          []Role          `json:"roles" gorm:"many2many:user_roles;"`
	Words          []Word          `json:"-" gorm:"foreignKey:CreatedBy"`
	Topics         []Topic         `json:"-" gorm:"foreignKey:CreatedBy"`
	Journeys       []Journey       `json:"-" gorm:"foreignKey:CreatedBy"`
	AssignedJourneys []UserJourney `json:"-" gorm:"foreignKey:UserID"`
	Progress       []UserProgress  `json:"-" gorm:"foreignKey:UserID"`
	Achievements   []UserAchievement `json:"-" gorm:"foreignKey:UserID"`
	Bookmarks      []UserBookmark  `json:"-" gorm:"foreignKey:UserID"`
	Notes          []UserNote      `json:"-" gorm:"foreignKey:UserID"`
	SRSItems       []SRSItem       `json:"-" gorm:"foreignKey:UserID"`
}

// Role represents user roles (learner, teacher, admin)
type Role struct {
	ID          int       `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"uniqueIndex;size:50;not null"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	
	Users []User `json:"-" gorm:"many2many:user_roles;"`
}

// UserRole represents the many-to-many relationship
type UserRole struct {
	ID         int       `json:"id" gorm:"primaryKey"`
	UserID     int       `json:"userId" gorm:"not null;index"`
	RoleID     int       `json:"roleId" gorm:"not null;index"`
	AssignedAt time.Time `json:"assignedAt" gorm:"autoCreateTime"`
	
	User User `json:"-" gorm:"foreignKey:UserID"`
	Role Role `json:"-" gorm:"foreignKey:RoleID"`
}

// TableName overrides the table name
func (UserRole) TableName() string {
	return "user_roles"
}

// HasRole checks if user has a specific role
func (u *User) HasRole(roleName string) bool {
	for _, role := range u.Roles {
		if role.Name == roleName {
			return true
		}
	}
	return false
}

// GetRoleNames returns array of role names
func (u *User) GetRoleNames() []string {
	names := make([]string, len(u.Roles))
	for i, role := range u.Roles {
		names[i] = role.Name
	}
	return names
}
```

---

### models/word.go

```go
package models

import (
	"time"
)

// Word represents a vocabulary word
type Word struct {
	ID            int       `json:"id" gorm:"primaryKey"`
	English       string    `json:"english" gorm:"type:text;not null"`
	Cantonese     string    `json:"cantonese" gorm:"type:text;not null"`
	Romanization  *string   `json:"romanization" gorm:"size:100"`
	AudioURL      *string   `json:"audioUrl" gorm:"size:500"`
	ImageURL      *string   `json:"imageUrl" gorm:"size:500"`
	Notes         *string   `json:"notes" gorm:"type:text"`
	CreatedBy     int       `json:"-" gorm:"not null;index"`
	CreatedAt     time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt     time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
	
	// Relationships
	Creator       User         `json:"createdBy" gorm:"foreignKey:CreatedBy"`
	TopicWords    []TopicWord  `json:"-" gorm:"foreignKey:WordID"`
	Topics        []Topic      `json:"topics" gorm:"many2many:topic_words;"`
	Quizzes       []Quiz       `json:"-" gorm:"foreignKey:WordID"`
	Bookmarks     []UserBookmark `json:"-" gorm:"foreignKey:WordID"`
	Notes         []UserNote   `json:"-" gorm:"foreignKey:WordID"`
	SRSItems      []SRSItem    `json:"-" gorm:"foreignKey:WordID"`
}

// TopicWord represents the many-to-many relationship with sequence
type TopicWord struct {
	ID            int       `json:"id" gorm:"primaryKey"`
	TopicID       int       `json:"topicId" gorm:"not null;index"`
	WordID        int       `json:"wordId" gorm:"not null;index"`
	SequenceOrder int       `json:"sequenceOrder" gorm:"default:0;not null"`
	CreatedAt     time.Time `json:"createdAt" gorm:"autoCreateTime"`
	
	Topic Topic `json:"-" gorm:"foreignKey:TopicID"`
	Word  Word  `json:"-" gorm:"foreignKey:WordID"`
}

// TableName overrides the table name
func (TopicWord) TableName() string {
	return "topic_words"
}
```

---

### models/topic.go

```go
package models

import (
	"time"
)

// Topic represents a learning topic
type Topic struct {
	ID          int       `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"size:200;not null"`
	Description *string   `json:"description" gorm:"type:text"`
	Level       string    `json:"level" gorm:"size:20;not null;check:level IN ('beginner','intermediate','advanced')"`
	CreatedBy   int       `json:"-" gorm:"not null;index"`
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
	
	// Relationships
	Creator       User           `json:"createdBy" gorm:"foreignKey:CreatedBy"`
	TopicWords    []TopicWord    `json:"-" gorm:"foreignKey:TopicID"`
	Words         []Word         `json:"words" gorm:"many2many:topic_words;"`
	JourneyTopics []JourneyTopic `json:"-" gorm:"foreignKey:TopicID"`
	Journeys      []Journey      `json:"-" gorm:"many2many:journey_topics;"`
	Quizzes       []Quiz         `json:"quizzes" gorm:"foreignKey:TopicID"`
	Progress      []UserProgress `json:"-" gorm:"foreignKey:TopicID"`
	Bookmarks     []UserBookmark `json:"-" gorm:"foreignKey:TopicID"`
}
```

---

### models/journey.go

```go
package models

import (
	"time"
)

// Journey represents a learning path
type Journey struct {
	ID          int       `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"size:200;not null"`
	Description *string   `json:"description" gorm:"type:text"`
	CreatedBy   int       `json:"-" gorm:"not null;index"`
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
	
	// Relationships
	Creator        User           `json:"createdBy" gorm:"foreignKey:CreatedBy"`
	JourneyTopics  []JourneyTopic `json:"-" gorm:"foreignKey:JourneyID"`
	Topics         []Topic        `json:"topics" gorm:"many2many:journey_topics;"`
	UserJourneys   []UserJourney  `json:"-" gorm:"foreignKey:JourneyID"`
	Progress       []UserProgress `json:"-" gorm:"foreignKey:JourneyID"`
}

// JourneyTopic represents the many-to-many relationship with sequence
type JourneyTopic struct {
	ID            int       `json:"id" gorm:"primaryKey"`
	JourneyID     int       `json:"journeyId" gorm:"not null;index"`
	TopicID       int       `json:"topicId" gorm:"not null;index"`
	SequenceOrder int       `json:"sequenceOrder" gorm:"not null"`
	CreatedAt     time.Time `json:"createdAt" gorm:"autoCreateTime"`
	
	Journey Journey `json:"-" gorm:"foreignKey:JourneyID"`
	Topic   Topic   `json:"-" gorm:"foreignKey:TopicID"`
}

// TableName overrides the table name
func (JourneyTopic) TableName() string {
	return "journey_topics"
}

// UserJourney represents journey assignments
type UserJourney struct {
	ID          int        `json:"id" gorm:"primaryKey"`
	UserID      int        `json:"userId" gorm:"not null;index"`
	JourneyID   int        `json:"journeyId" gorm:"not null;index"`
	AssignedBy  int        `json:"-" gorm:"not null"`
	Status      string     `json:"status" gorm:"size:20;default:'assigned';check:status IN ('assigned','in_progress','completed')"`
	AssignedAt  time.Time  `json:"assignedAt" gorm:"autoCreateTime"`
	StartedAt   *time.Time `json:"startedAt"`
	CompletedAt *time.Time `json:"completedAt"`
	
	// Relationships
	User       User    `json:"-" gorm:"foreignKey:UserID"`
	Journey    Journey `json:"journey" gorm:"foreignKey:JourneyID"`
	AssignedByUser User `json:"assignedBy" gorm:"foreignKey:AssignedBy"`
}

// TableName overrides the table name
func (UserJourney) TableName() string {
	return "user_journeys"
}
```

---

### models/quiz.go

```go
package models

import (
	"time"
)

// Quiz represents a quiz question
type Quiz struct {
	ID           int       `json:"id" gorm:"primaryKey"`
	TopicID      int       `json:"topicId" gorm:"not null;index"`
	WordID       *int      `json:"wordId" gorm:"index"`
	QuestionType string    `json:"questionType" gorm:"size:50;not null;check:question_type IN ('translation','listening','image')"`
	QuestionText string    `json:"questionText" gorm:"type:text;not null"`
	CorrectAnswer string   `json:"correctAnswer" gorm:"size:1;not null;check:correct_answer IN ('A','B','C','D')"`
	OptionA      string    `json:"optionA" gorm:"size:255;not null"`
	OptionB      string    `json:"optionB" gorm:"size:255;not null"`
	OptionC      string    `json:"optionC" gorm:"size:255;not null"`
	OptionD      string    `json:"optionD" gorm:"size:255;not null"`
	CreatedAt    time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
	
	// Relationships
	Topic Topic  `json:"-" gorm:"foreignKey:TopicID"`
	Word  *Word  `json:"word,omitempty" gorm:"foreignKey:WordID"`
}

// TableName overrides the table name
func (Quiz) TableName() string {
	return "topic_quizzes"
}
```

---

### models/progress.go

```go
package models

import (
	"time"
)

// UserProgress tracks learning progress
type UserProgress struct {
	ID               int        `json:"id" gorm:"primaryKey"`
	UserID           int        `json:"userId" gorm:"not null;index"`
	TopicID          *int       `json:"topicId" gorm:"index"`
	JourneyID        *int       `json:"journeyId" gorm:"index"`
	ActivityType     string     `json:"activityType" gorm:"size:50;not null;check:activity_type IN ('flashcard','pronunciation','conversation','quiz')"`
	Completed        bool       `json:"completed" gorm:"default:false"`
	Score            *float64   `json:"score" gorm:"type:decimal(5,2)"`
	MaxScore         *float64   `json:"maxScore" gorm:"type:decimal(5,2)"`
	TimeSpentSeconds int        `json:"timeSpentSeconds" gorm:"default:0"`
	CompletedAt      *time.Time `json:"completedAt"`
	CreatedAt        time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	
	// Relationships
	User    User     `json:"-" gorm:"foreignKey:UserID"`
	Topic   *Topic   `json:"topic,omitempty" gorm:"foreignKey:TopicID"`
	Journey *Journey `json:"journey,omitempty" gorm:"foreignKey:JourneyID"`
}

// TableName overrides the table name
func (UserProgress) TableName() string {
	return "user_progress"
}

// LearningSession tracks learning sessions
type LearningSession struct {
	ID                  int        `json:"id" gorm:"primaryKey"`
	UserID              int        `json:"userId" gorm:"not null;index"`
	StartedAt           time.Time  `json:"startedAt" gorm:"autoCreateTime"`
	EndedAt             *time.Time `json:"endedAt"`
	DurationSeconds     *int       `json:"durationSeconds"`
	ActivitiesCompleted int        `json:"activitiesCompleted" gorm:"default:0"`
	
	// Relationships
	User User `json:"-" gorm:"foreignKey:UserID"`
}

// TableName overrides the table name
func (LearningSession) TableName() string {
	return "learning_sessions"
}
```

---

### models/achievement.go

```go
package models

import (
	"time"
)

// Achievement represents an achievement/badge
type Achievement struct {
	ID            int       `json:"id" gorm:"primaryKey"`
	Name          string    `json:"name" gorm:"size:100;not null"`
	Description   string    `json:"description" gorm:"type:text"`
	BadgeIconURL  *string   `json:"badgeIconUrl" gorm:"size:500"`
	CriteriaType  string    `json:"criteriaType" gorm:"size:50;not null;check:criteria_type IN ('topic_complete','journey_complete','quiz_score','streak','total_words')"`
	CriteriaValue int       `json:"criteriaValue" gorm:"not null"`
	CreatedAt     time.Time `json:"createdAt" gorm:"autoCreateTime"`
	
	// Relationships
	UserAchievements []UserAchievement `json:"-" gorm:"foreignKey:AchievementID"`
}

// UserAchievement represents earned achievements
type UserAchievement struct {
	ID            int       `json:"id" gorm:"primaryKey"`
	UserID        int       `json:"userId" gorm:"not null;index"`
	AchievementID int       `json:"achievementId" gorm:"not null;index"`
	EarnedAt      time.Time `json:"earnedAt" gorm:"autoCreateTime"`
	
	// Relationships
	User        User        `json:"-" gorm:"foreignKey:UserID"`
	Achievement Achievement `json:"achievement" gorm:"foreignKey:AchievementID"`
}

// TableName overrides the table name
func (UserAchievement) TableName() string {
	return "user_achievements"
}
```

---

### models/bookmark.go

```go
package models

import (
	"time"
)

// UserBookmark represents bookmarked words or topics
type UserBookmark struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	UserID    int       `json:"userId" gorm:"not null;index"`
	WordID    *int      `json:"wordId" gorm:"index"`
	TopicID   *int      `json:"topicId" gorm:"index"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	
	// Relationships
	User  User   `json:"-" gorm:"foreignKey:UserID"`
	Word  *Word  `json:"word,omitempty" gorm:"foreignKey:WordID"`
	Topic *Topic `json:"topic,omitempty" gorm:"foreignKey:TopicID"`
}

// TableName overrides the table name
func (UserBookmark) TableName() string {
	return "user_bookmarks"
}

// Validate ensures either WordID or TopicID is set, but not both
func (ub *UserBookmark) Validate() error {
	if (ub.WordID == nil && ub.TopicID == nil) || (ub.WordID != nil && ub.TopicID != nil) {
		return fmt.Errorf("exactly one of WordID or TopicID must be set")
	}
	return nil
}
```

---

### models/note.go

```go
package models

import (
	"time"
)

// UserNote represents personal notes on words
type UserNote struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	UserID    int       `json:"userId" gorm:"not null;index"`
	WordID    int       `json:"wordId" gorm:"not null;index"`
	NoteText  string    `json:"noteText" gorm:"type:text;not null"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
	
	// Relationships
	User User `json:"-" gorm:"foreignKey:UserID"`
	Word Word `json:"word" gorm:"foreignKey:WordID"`
}

// TableName overrides the table name
func (UserNote) TableName() string {
	return "user_notes"
}
```

---

### models/srs.go

```go
package models

import (
	"time"
)

// SRSItem represents a spaced repetition item
type SRSItem struct {
	ID             int        `json:"id" gorm:"primaryKey"`
	UserID         int        `json:"userId" gorm:"not null;index"`
	WordID         int        `json:"wordId" gorm:"not null;index"`
	EaseFactor     float64    `json:"easeFactor" gorm:"type:decimal(4,2);default:2.5"`
	IntervalDays   int        `json:"intervalDays" gorm:"default:1"`
	Repetitions    int        `json:"repetitions" gorm:"default:0"`
	NextReviewDate time.Time  `json:"nextReviewDate" gorm:"type:date;not null;index"`
	LastReviewedAt *time.Time `json:"lastReviewedAt"`
	CreatedAt      time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt      time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	
	// Relationships
	User User `json:"-" gorm:"foreignKey:UserID"`
	Word Word `json:"word" gorm:"foreignKey:WordID"`
}

// TableName overrides the table name
func (SRSItem) TableName() string {
	return "spaced_repetition_items"
}

// UpdateSRS updates the SRS item based on SM-2 algorithm
func (s *SRSItem) UpdateSRS(remembered bool) {
	now := time.Now()
	s.LastReviewedAt = &now
	
	if remembered {
		if s.Repetitions == 0 {
			s.IntervalDays = 1
		} else if s.Repetitions == 1 {
			s.IntervalDays = 6
		} else {
			s.IntervalDays = int(float64(s.IntervalDays) * s.EaseFactor)
		}
		s.Repetitions++
		s.EaseFactor = s.EaseFactor + (0.1 - (5-4)*(0.08+(5-4)*0.02))
	} else {
		s.Repetitions = 0
		s.IntervalDays = 1
		s.EaseFactor = s.EaseFactor - 0.2
	}
	
	// Clamp ease factor
	if s.EaseFactor < 1.3 {
		s.EaseFactor = 1.3
	}
	
	// Cap maximum interval
	if s.IntervalDays > 180 {
		s.IntervalDays = 180
	}
	
	s.NextReviewDate = now.AddDate(0, 0, s.IntervalDays)
}
```

---

## 2. Data Transfer Objects (DTOs)

### dto/response.go

```go
package dto

// APIResponse is the standard API response wrapper
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
}

// APIError represents error details
type APIError struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// PaginationMeta represents pagination metadata
type PaginationMeta struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

// PaginatedResponse wraps paginated data
type PaginatedResponse struct {
	Success    bool           `json:"success"`
	Data       interface{}    `json:"data"`
	Pagination PaginationMeta `json:"pagination"`
	Message    string         `json:"message,omitempty"`
}

// SuccessResponse creates a success response
func SuccessResponse(data interface{}, message string) APIResponse {
	return APIResponse{
		Success: true,
		Data:    data,
		Message: message,
	}
}

// ErrorResponse creates an error response
func ErrorResponse(code string, message string, details interface{}) APIResponse {
	return APIResponse{
		Success: false,
		Error: &APIError{
			Code:    code,
			Message: message,
			Details: details,
		},
	}
}
```

---

### dto/auth.go

```go
package dto

// RegisterRequest for user registration
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50,alphanum"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required,min=1,max=100"`
	Email    string `json:"email" binding:"omitempty,email"`
	Role     string `json:"role" binding:"required,oneof=learner teacher"`
}

// LoginRequest for user login
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse after successful auth
type AuthResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}

// ChangePasswordRequest for password changes
type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=8"`
}
```

---

### dto/user.go

```go
package dto

import "time"

// UserResponse for API responses
type UserResponse struct {
	ID            int       `json:"id"`
	Username      string    `json:"username"`
	Name          string    `json:"name"`
	Email         string    `json:"email,omitempty"`
	Roles         []string  `json:"roles"`
	ProfilePicURL *string   `json:"profilePicUrl"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt,omitempty"`
}

// UpdateProfileRequest for profile updates
type UpdateProfileRequest struct {
	Name  string `json:"name" binding:"required,min=1,max=100"`
	Email string `json:"email" binding:"omitempty,email"`
}

// UserStatsResponse for user statistics
type UserStatsResponse struct {
	TotalLearningTimeMinutes int     `json:"totalLearningTimeMinutes"`
	TopicsCompleted          int     `json:"topicsCompleted"`
	JourneysCompleted        int     `json:"journeysCompleted"`
	JourneysInProgress       int     `json:"journeysInProgress"`
	AverageQuizAccuracy      float64 `json:"averageQuizAccuracy"`
	WordsLearned             int     `json:"wordsLearned"`
	AchievementsEarned       int     `json:"achievementsEarned"`
	CurrentStreak            int     `json:"currentStreak"`
	LongestStreak            int     `json:"longestStreak"`
}

// StudentListItem for teacher's student list
type StudentListItem struct {
	ID               int       `json:"id"`
	Username         string    `json:"username"`
	Name             string    `json:"name"`
	ProfilePicURL    *string   `json:"profilePicUrl"`
	JourneysAssigned int       `json:"journeysAssigned"`
	JourneysCompleted int      `json:"journeysCompleted"`
	AverageProgress  float64   `json:"averageProgress"`
	LastActive       time.Time `json:"lastActive"`
}
```

---

### dto/word.go

```go
package dto

import "time"

// CreateWordRequest for creating words
type CreateWordRequest struct {
	English      string  `json:"english" binding:"required,min=1,max=255"`
	Cantonese    string  `json:"cantonese" binding:"required,min=1,max=255"`
	Romanization *string `json:"romanization" binding:"omitempty,max=100"`
	Notes        *string `json:"notes" binding:"omitempty,max=1000"`
}

// UpdateWordRequest for updating words
type UpdateWordRequest struct {
	English      string  `json:"english" binding:"required,min=1,max=255"`
	Cantonese    string  `json:"cantonese" binding:"required,min=1,max=255"`
	Romanization *string `json:"romanization" binding:"omitempty,max=100"`
	Notes        *string `json:"notes" binding:"omitempty,max=1000"`
}

// WordResponse for API responses
type WordResponse struct {
	ID            int              `json:"id"`
	English       string           `json:"english"`
	Cantonese     string           `json:"cantonese"`
	Romanization  *string          `json:"romanization"`
	AudioURL      *string          `json:"audioUrl"`
	ImageURL      *string          `json:"imageUrl"`
	Notes         *string          `json:"notes,omitempty"`
	CreatedBy     UserSummary      `json:"createdBy"`
	UsedInTopics  int              `json:"usedInTopics,omitempty"`
	Topics        []TopicSummary   `json:"topics,omitempty"`
	CreatedAt     time.Time        `json:"createdAt"`
	UpdatedAt     time.Time        `json:"updatedAt"`
}

// WordListItem for word lists
type WordListItem struct {
	ID            int         `json:"id"`
	English       string      `json:"english"`
	Cantonese     string      `json:"cantonese"`
	Romanization  *string     `json:"romanization"`
	AudioURL      *string     `json:"audioUrl"`
	ImageURL      *string     `json:"imageUrl"`
	CreatedBy     UserSummary `json:"createdBy"`
	UsedInTopics  int         `json:"usedInTopics"`
	CreatedAt     time.Time   `json:"createdAt"`
	UpdatedAt     time.Time   `json:"updatedAt"`
}

// UserSummary for nested user info
type UserSummary struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Username string `json:"username,omitempty"`
}
```

---

### dto/topic.go

```go
package dto

import "time"

// CreateTopicRequest for creating topics
type CreateTopicRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=200"`
	Description string `json:"description" binding:"omitempty,max=1000"`
	Level       string `json:"level" binding:"required,oneof=beginner intermediate advanced"`
	WordIDs     []int  `json:"wordIds"`
}

// UpdateTopicRequest for updating topics
type UpdateTopicRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=200"`
	Description string `json:"description" binding:"omitempty,max=1000"`
	Level       string `json:"level" binding:"required,oneof=beginner intermediate advanced"`
	WordIDs     []int  `json:"wordIds"`
}

// ReorderWordsRequest for reordering words in topic
type ReorderWordsRequest struct {
	WordIDs []int `json:"wordIds" binding:"required"`
}

// TopicResponse for API responses
type TopicResponse struct {
	ID          int            `json:"id"`
	Name        string         `json:"name"`
	Description *string        `json:"description"`
	Level       string         `json:"level"`
	CreatedBy   UserSummary    `json:"createdBy"`
	Words       []WordInTopic  `json:"words,omitempty"`
	QuizCount   int            `json:"quizCount,omitempty"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
}

// TopicListItem for topic lists
type TopicListItem struct {
	ID             int         `json:"id"`
	Name           string      `json:"name"`
	Description    *string     `json:"description"`
	Level          string      `json:"level"`
	WordCount      int         `json:"wordCount"`
	CreatedBy      UserSummary `json:"createdBy"`
	UsedInJourneys int         `json:"usedInJourneys"`
	CreatedAt      time.Time   `json:"createdAt"`
	UpdatedAt      time.Time   `json:"updatedAt"`
}

// TopicSummary for nested topic info
type TopicSummary struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Level string `json:"level"`
}

// WordInTopic represents a word within a topic
type WordInTopic struct {
	ID            int     `json:"id"`
	English       string  `json:"english"`
	Cantonese     string  `json:"cantonese"`
	Romanization  *string `json:"romanization"`
	AudioURL      *string `json:"audioUrl"`
	ImageURL      *string `json:"imageUrl"`
	SequenceOrder int     `json:"sequenceOrder"`
}
```

---

### dto/journey.go

```go
package dto

import "time"

// CreateJourneyRequest for creating journeys
type CreateJourneyRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=200"`
	Description string `json:"description" binding:"omitempty,max=1000"`
	TopicIDs    []int  `json:"topicIds" binding:"required"`
}

// UpdateJourneyRequest for updating journeys
type UpdateJourneyRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=200"`
	Description string `json:"description" binding:"omitempty,max=1000"`
	TopicIDs    []int  `json:"topicIds" binding:"required"`
}

// AssignJourneyRequest for assigning journeys
type AssignJourneyRequest struct {
	UserIDs []int  `json:"userIds" binding:"required"`
	Message string `json:"message" binding:"omitempty,max=500"`
}

// JourneyResponse for API responses
type JourneyResponse struct {
	ID          int               `json:"id"`
	Name        string            `json:"name"`
	Description *string           `json:"description"`
	CreatedBy   UserSummary       `json:"createdBy"`
	Topics      []TopicInJourney  `json:"topics,omitempty"`
	TotalTopics int               `json:"totalTopics"`
	TotalWords  int               `json:"totalWords"`
	Progress    float64           `json:"progress,omitempty"`
	CreatedAt   time.Time         `json:"createdAt"`
	UpdatedAt   time.Time         `json:"updatedAt,omitempty"`
}

// JourneyListItem for journey lists
type JourneyListItem struct {
	ID              int         `json:"id"`
	Name            string      `json:"name"`
	Description     *string     `json:"description"`
	TopicCount      int         `json:"topicCount"`
	TotalWords      int         `json:"totalWords"`
	CreatedBy       UserSummary `json:"createdBy"`
	AssignedToCount int         `json:"assignedToCount"`
	CreatedAt       time.Time   `json:"createdAt"`
}

// TopicInJourney represents a topic within a journey
type TopicInJourney struct {
	ID            int     `json:"id"`
	Name          string  `json:"name"`
	Level         string  `json:"level"`
	WordCount     int     `json:"wordCount"`
	SequenceOrder int     `json:"sequenceOrder"`
	Completed     bool    `json:"completed"`
	QuizScore     *float64 `json:"quizScore"`
}

// UserJourneyResponse for assigned journeys
type UserJourneyResponse struct {
	ID             int              `json:"id"`
	Name           string           `json:"name"`
	Description    *string          `json:"description"`
	TopicCount     int              `json:"topicCount"`
	CompletedTopics int             `json:"completedTopics"`
	Progress       float64          `json:"progress"`
	Status         string           `json:"status"`
	AssignedBy     UserSummary      `json:"assignedBy"`
	AssignedAt     time.Time        `json:"assignedAt"`
	StartedAt      *time.Time       `json:"startedAt"`
	CurrentTopic   *TopicSummary    `json:"currentTopic"`
}

// AssignmentResult for assignment response
type AssignmentResult struct {
	AssignedCount int                 `json:"assignedCount"`
	Assignments   []AssignmentDetail  `json:"assignments"`
}

// AssignmentDetail for individual assignment
type AssignmentDetail struct {
	UserID     int       `json:"userId"`
	UserName   string    `json:"userName"`
	AssignedAt time.Time `json:"assignedAt"`
}
```

---

### dto/quiz.go

```go
package dto

import "time"

// CreateQuizRequest for creating quiz questions
type CreateQuizRequest struct {
	QuestionType  string `json:"questionType" binding:"required,oneof=translation listening image"`
	QuestionText  string `json:"questionText" binding:"required,min=1,max=500"`
	CorrectAnswer string `json:"correctAnswer" binding:"required,oneof=A B C D"`
	OptionA       string `json:"optionA" binding:"required,min=1,max=255"`
	OptionB       string `json:"optionB" binding:"required,min=1,max=255"`
	OptionC       string `json:"optionC" binding:"required,min=1,max=255"`
	OptionD       string `json:"optionD" binding:"required,min=1,max=255"`
	WordID        *int   `json:"wordId"`
}

// QuizResponse for teacher view (includes correct answer)
type QuizResponse struct {
	ID            int       `json:"id"`
	QuestionType  string    `json:"questionType"`
	QuestionText  string    `json:"questionText"`
	CorrectAnswer string    `json:"correctAnswer"`
	OptionA       string    `json:"optionA"`
	OptionB       string    `json:"optionB"`
	OptionC       string    `json:"optionC"`
	OptionD       string    `json:"optionD"`
	WordID        *int      `json:"wordId"`
	CreatedAt     time.Time `json:"createdAt"`
}

// QuizQuestionForLearner for learner view (no correct answer)
type QuizQuestionForLearner struct {
	ID           int     `json:"id"`
	QuestionType string  `json:"questionType"`
	QuestionText string  `json:"questionText"`
	AudioURL     *string `json:"audioUrl,omitempty"`
	OptionA      string  `json:"optionA"`
	OptionB      string  `json:"optionB"`
	OptionC      string  `json:"optionC"`
	OptionD      string  `json:"optionD"`
}

// QuizForLearner represents a full quiz
type QuizForLearner struct {
	TopicID        int                      `json:"topicId"`
	TopicName      string                   `json:"topicName"`
	Questions      []QuizQuestionForLearner `json:"questions"`
	TotalQuestions int                      `json:"totalQuestions"`
}

// SubmitQuizRequest for submitting quiz answers
type SubmitQuizRequest struct {
	Answers []QuizAnswer `json:"answers" binding:"required"`
}

// QuizAnswer represents a single answer
type QuizAnswer struct {
	QuestionID     int    `json:"questionId" binding:"required"`
	SelectedAnswer string `json:"selectedAnswer" binding:"required,oneof=A B C D"`
}

// QuizResultResponse for quiz results
type QuizResultResponse struct {
	Score               float64               `json:"score"`
	MaxScore            float64               `json:"maxScore"`
	Percentage          float64               `json:"percentage"`
	Results             []QuizQuestionResult  `json:"results"`
	AchievementsEarned  []AchievementSummary  `json:"achievementsEarned,omitempty"`
}

// QuizQuestionResult for individual question result
type QuizQuestionResult struct {
	QuestionID     int    `json:"questionId"`
	Correct        bool   `json:"correct"`
	SelectedAnswer string `json:"selectedAnswer"`
	CorrectAnswer  string `json:"correctAnswer"`
}
```

---

### dto/progress.go

```go
package dto

import "time"

// CompleteActivityRequest for completing activities
type CompleteActivityRequest struct {
	TimeSpentSeconds int `json:"timeSpentSeconds" binding:"required,min=0"`
}

// CompleteConversationRequest for conversation activity
type CompleteConversationRequest struct {
	ConversationID   int `json:"conversationId" binding:"required"`
	TimeSpentSeconds int `json:"timeSpentSeconds" binding:"required,min=0"`
}

// SessionStartResponse for starting a session
type SessionStartResponse struct {
	SessionID string    `json:"sessionId"`
	StartedAt time.Time `json:"startedAt"`
}

// SessionEndResponse for ending a session
type SessionEndResponse struct {
	SessionID           string `json:"sessionId"`
	DurationSeconds     int    `json:"durationSeconds"`
	ActivitiesCompleted int    `json:"activitiesCompleted"`
}

// ProgressResponse for user progress
type ProgressResponse struct {
	Journeys         []JourneyProgress  `json:"journeys"`
	RecentActivities []RecentActivity   `json:"recentActivities"`
}

// JourneyProgress represents progress on a journey
type JourneyProgress struct {
	JourneyID        int     `json:"journeyId"`
	JourneyName      string  `json:"journeyName"`
	Progress         float64 `json:"progress"`
	CompletedTopics  int     `json:"completedTopics"`
	TotalTopics      int     `json:"totalTopics"`
	TimeSpentMinutes int     `json:"timeSpentMinutes"`
	AverageQuizScore float64 `json:"averageQuizScore"`
}

// RecentActivity represents a recent learning activity
type RecentActivity struct {
	Type        string    `json:"type"`
	TopicName   string    `json:"topicName"`
	Score       *float64  `json:"score,omitempty"`
	CompletedAt time.Time `json:"completedAt"`
}
```

---

**Continue with additional DTOs and helper functions as needed for analytics, achievements, bookmarks, notes, SRS, and AI services...**

---

## 3. Database Connection

### database/db.go

```go
package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	
	"learnspeak/models"
)

var DB *gorm.DB

// Connect initializes the database connection
func Connect() error {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_SSLMODE"),
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connected successfully")
	return nil
}

// AutoMigrate runs database migrations
func AutoMigrate() error {
	return DB.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.UserRole{},
		&models.Word{},
		&models.Topic{},
		&models.TopicWord{},
		&models.Journey{},
		&models.JourneyTopic{},
		&models.UserJourney{},
		&models.Quiz{},
		&models.UserProgress{},
		&models.LearningSession{},
		&models.Achievement{},
		&models.UserAchievement{},
		&models.UserBookmark{},
		&models.UserNote{},
		&models.SRSItem{},
	)
}

// SeedRoles creates default roles
func SeedRoles() error {
	roles := []models.Role{
		{Name: "learner", Description: "Student learning languages"},
		{Name: "teacher", Description: "Teacher managing content and learners"},
		{Name: "admin", Description: "System administrator"},
	}

	for _, role := range roles {
		var existing models.Role
		if err := DB.Where("name = ?", role.Name).First(&existing).Error; err == gorm.ErrRecordNotFound {
			if err := DB.Create(&role).Error; err != nil {
				return err
			}
		}
	}

	log.Println("Roles seeded successfully")
	return nil
}
```

---

**End of Go Models Documentation**
