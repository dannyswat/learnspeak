package models

import "time"

// Conversation represents a conversation scenario for dialogue practice
type Conversation struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	Title            string    `json:"title" gorm:"size:200;not null"`
	Description      string    `json:"description" gorm:"type:text"`
	Context          string    `json:"context" gorm:"type:text"`
	LanguageID       uint      `json:"languageId" gorm:"not null"`
	DifficultyLevel  string    `json:"difficultyLevel" gorm:"size:20;not null"` // beginner, intermediate, advanced
	ScenarioAudioURL string    `json:"scenarioAudioUrl" gorm:"size:500"`
	ScenarioImageURL string    `json:"scenarioImageUrl" gorm:"size:500"`
	CreatedBy        uint      `json:"createdBy" gorm:"not null"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`

	// Relations
	Language Language           `json:"language,omitempty" gorm:"foreignKey:LanguageID"`
	Creator  User               `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
	Lines    []ConversationLine `json:"lines,omitempty" gorm:"foreignKey:ConversationID;constraint:OnDelete:CASCADE"`
}

// ConversationLine represents an individual dialogue line within a conversation
type ConversationLine struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	ConversationID uint      `json:"conversationId" gorm:"not null"`
	SequenceOrder  int       `json:"sequenceOrder" gorm:"not null"`
	SpeakerRole    string    `json:"speakerRole" gorm:"size:100;not null"`
	EnglishText    string    `json:"englishText" gorm:"type:text;not null"`
	TargetText     string    `json:"targetText" gorm:"type:text;not null"`
	Romanization   string    `json:"romanization" gorm:"type:text"`
	AudioURL       string    `json:"audioUrl" gorm:"size:500"`
	ImageURL       string    `json:"imageUrl" gorm:"size:500"`
	WordID         *uint     `json:"wordId"`
	IsLearnerLine  bool      `json:"isLearnerLine" gorm:"default:false"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`

	// Relations
	Conversation Conversation `json:"conversation,omitempty" gorm:"foreignKey:ConversationID"`
	Word         *Word        `json:"word,omitempty" gorm:"foreignKey:WordID"`
}

// TopicConversation represents the association between a topic and a conversation with ordering
type TopicConversation struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	TopicID        uint      `json:"topicId" gorm:"not null"`
	ConversationID uint      `json:"conversationId" gorm:"not null"`
	SequenceOrder  int       `json:"sequenceOrder" gorm:"not null;default:0"`
	CreatedAt      time.Time `json:"createdAt"`

	// Relations
	Topic        Topic        `json:"topic,omitempty" gorm:"foreignKey:TopicID"`
	Conversation Conversation `json:"conversation,omitempty" gorm:"foreignKey:ConversationID"`
}

// TableName specifies the table name for Conversation
func (Conversation) TableName() string {
	return "conversations"
}

// TableName specifies the table name for ConversationLine
func (ConversationLine) TableName() string {
	return "conversation_lines"
}

// TableName specifies the table name for TopicConversation
func (TopicConversation) TableName() string {
	return "topic_conversations"
}
