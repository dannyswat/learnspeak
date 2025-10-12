package models

import "time"

// UserProgress represents a user's progress on a topic/activity
type UserProgress struct {
	ID               uint       `json:"id" gorm:"primaryKey"`
	UserID           uint       `json:"userId" gorm:"not null;index"`
	TopicID          *uint      `json:"topicId" gorm:"index"`
	JourneyID        *uint      `json:"journeyId" gorm:"index"`
	ActivityType     string     `json:"activityType" gorm:"size:50;not null;index"`
	Completed        bool       `json:"completed" gorm:"default:false;index"`
	Score            *float64   `json:"score" gorm:"type:decimal(5,2)"`
	MaxScore         *float64   `json:"maxScore" gorm:"type:decimal(5,2)"`
	TimeSpentSeconds int        `json:"timeSpentSeconds" gorm:"default:0"`
	CompletedAt      *time.Time `json:"completedAt"`
	CreatedAt        time.Time  `json:"createdAt" gorm:"default:CURRENT_TIMESTAMP"`

	// Relationships
	User    User     `json:"user" gorm:"foreignKey:UserID"`
	Topic   *Topic   `json:"topic" gorm:"foreignKey:TopicID"`
	Journey *Journey `json:"journey" gorm:"foreignKey:JourneyID"`
}

// TableName specifies the table name
func (UserProgress) TableName() string {
	return "user_progress"
}
