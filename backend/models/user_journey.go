package models

import (
	"time"

	"gorm.io/gorm"
)

// UserJourney represents a journey assigned to a user
type UserJourney struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"userId" gorm:"not null;index"`
	JourneyID   uint           `json:"journeyId" gorm:"not null;index"`
	AssignedBy  uint           `json:"assignedBy" gorm:"not null"`
	Status      string         `json:"status" gorm:"size:20;not null;default:'assigned';index"`
	AssignedAt  time.Time      `json:"assignedAt" gorm:"default:CURRENT_TIMESTAMP"`
	StartedAt   *time.Time     `json:"startedAt"`
	CompletedAt *time.Time     `json:"completedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User           User    `json:"user" gorm:"foreignKey:UserID"`
	Journey        Journey `json:"journey" gorm:"foreignKey:JourneyID"`
	AssignedByUser User    `json:"assignedByUser" gorm:"foreignKey:AssignedBy"`
}

// TableName specifies the table name
func (UserJourney) TableName() string {
	return "user_journeys"
}
