package models

import "time"

// JourneyInvitation represents an invitation link for a journey
type JourneyInvitation struct {
	ID              uint       `json:"id" gorm:"primaryKey"`
	JourneyID       uint       `json:"journeyId" gorm:"not null;index"`
	InvitationToken string     `json:"invitationToken" gorm:"size:64;uniqueIndex;not null"`
	CreatedBy       uint       `json:"createdBy" gorm:"not null"`
	ExpiresAt       *time.Time `json:"expiresAt"`
	MaxUses         *int       `json:"maxUses"` // NULL means unlimited
	CurrentUses     int        `json:"currentUses" gorm:"default:0;not null"`
	IsActive        bool       `json:"isActive" gorm:"default:true;not null"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`

	// Relations
	Journey Journey `json:"journey,omitempty" gorm:"foreignKey:JourneyID"`
	Creator User    `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
}

// TableName specifies the table name for JourneyInvitation
func (JourneyInvitation) TableName() string {
	return "journey_invitations"
}

// IsValid checks if the invitation is still valid
func (ji *JourneyInvitation) IsValid() bool {
	if !ji.IsActive {
		return false
	}

	// Check expiration
	if ji.ExpiresAt != nil && time.Now().After(*ji.ExpiresAt) {
		return false
	}

	// Check max uses
	if ji.MaxUses != nil && ji.CurrentUses >= *ji.MaxUses {
		return false
	}

	return true
}
