package models

import "time"

// Journey represents a learning journey (collection of topics)
type Journey struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"size:200;not null"`
	Description string    `json:"description" gorm:"type:text"`
	LanguageID  uint      `json:"languageId" gorm:"not null"`
	CreatedBy   uint      `json:"createdBy" gorm:"not null"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`

	// Relations
	Language Language       `json:"language,omitempty" gorm:"foreignKey:LanguageID"`
	Creator  User           `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
	Topics   []JourneyTopic `json:"topics,omitempty" gorm:"foreignKey:JourneyID"`
}

// JourneyTopic represents the association between a journey and a topic with ordering
type JourneyTopic struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	JourneyID     uint      `json:"journeyId" gorm:"not null"`
	TopicID       uint      `json:"topicId" gorm:"not null"`
	SequenceOrder int       `json:"sequenceOrder" gorm:"not null;default:0"`
	CreatedAt     time.Time `json:"createdAt"`

	// Relations
	Journey Journey `json:"journey,omitempty" gorm:"foreignKey:JourneyID"`
	Topic   Topic   `json:"topic,omitempty" gorm:"foreignKey:TopicID"`
}

// TableName specifies the table name for Journey
func (Journey) TableName() string {
	return "journeys"
}

// TableName specifies the table name for JourneyTopic
func (JourneyTopic) TableName() string {
	return "journey_topics"
}
