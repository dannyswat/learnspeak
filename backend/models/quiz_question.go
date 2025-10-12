package models

import (
	"time"
)

// QuizQuestion represents a quiz question for a topic
type QuizQuestion struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	TopicID       uint      `json:"topicId" gorm:"not null;index"`
	WordID        *uint     `json:"wordId,omitempty" gorm:"index"` // Optional: reference to specific word
	QuestionType  string    `json:"questionType" gorm:"not null;type:varchar(50)"`
	QuestionText  string    `json:"questionText" gorm:"not null;type:text"`
	CorrectAnswer string    `json:"correctAnswer" gorm:"not null;type:varchar(255)"`
	OptionA       string    `json:"optionA" gorm:"not null;type:varchar(255)"`
	OptionB       string    `json:"optionB" gorm:"not null;type:varchar(255)"`
	OptionC       string    `json:"optionC" gorm:"not null;type:varchar(255)"`
	OptionD       string    `json:"optionD" gorm:"not null;type:varchar(255)"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`

	// Associations
	Topic *Topic `json:"topic,omitempty" gorm:"foreignKey:TopicID"`
	Word  *Word  `json:"word,omitempty" gorm:"foreignKey:WordID"`
}

// TableName specifies the table name for QuizQuestion
func (QuizQuestion) TableName() string {
	return "topic_quizzes"
}

// QuestionTypes
const (
	QuestionTypeTranslation = "translation"
	QuestionTypeListening   = "listening"
	QuestionTypeImage       = "image"
)
