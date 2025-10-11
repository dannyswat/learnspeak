package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	Username      string         `json:"username" gorm:"uniqueIndex;size:50;not null"`
	PasswordHash  string         `json:"-" gorm:"size:255;not null"`
	Email         string         `json:"email" gorm:"uniqueIndex;size:255"`
	Name          string         `json:"name" gorm:"size:100;not null"`
	ProfilePicURL *string        `json:"profilePicUrl" gorm:"size:500"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Roles []Role `json:"roles" gorm:"many2many:user_roles;"`
}

// Role represents user roles (learner, teacher, admin)
type Role struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"uniqueIndex;size:50;not null"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"createdAt"`

	Users []User `json:"-" gorm:"many2many:user_roles;"`
}

// UserRole represents the many-to-many relationship
type UserRole struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	UserID     uint      `json:"userId" gorm:"not null;index"`
	RoleID     uint      `json:"roleId" gorm:"not null;index"`
	AssignedAt time.Time `json:"assignedAt"`

	User User `json:"-" gorm:"foreignKey:UserID"`
	Role Role `json:"-" gorm:"foreignKey:RoleID"`
}

// TableName overrides the table name
func (UserRole) TableName() string {
	return "user_roles"
}
