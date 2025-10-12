package models

import "time"

// Topic represents a learning topic containing a collection of words
type Topic struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"size:200;not null"`
	Description string    `json:"description" gorm:"type:text"`
	Level       string    `json:"level" gorm:"size:20;not null"` // beginner, intermediate, advanced
	LanguageID  uint      `json:"languageId" gorm:"not null"`
	CreatedBy   uint      `json:"createdBy" gorm:"not null"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`

	// Relations
	Language Language    `json:"language,omitempty" gorm:"foreignKey:LanguageID"`
	Creator  User        `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
	Words    []TopicWord `json:"words,omitempty" gorm:"foreignKey:TopicID"`
}

// TopicWord represents the association between a topic and a word with ordering
type TopicWord struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	TopicID       uint      `json:"topicId" gorm:"not null"`
	WordID        uint      `json:"wordId" gorm:"not null"`
	SequenceOrder int       `json:"sequenceOrder" gorm:"not null;default:0"`
	CreatedAt     time.Time `json:"createdAt"`

	// Relations
	Topic Topic `json:"topic,omitempty" gorm:"foreignKey:TopicID"`
	Word  Word  `json:"word,omitempty" gorm:"foreignKey:WordID"`
}

// TableName specifies the table name for Topic
func (Topic) TableName() string {
	return "topics"
}

// TableName specifies the table name for TopicWord
func (TopicWord) TableName() string {
	return "topic_words"
}
