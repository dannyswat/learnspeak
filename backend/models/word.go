package models

import (
	"time"
)

// Word represents a base vocabulary word (language-agnostic)
type Word struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	BaseWord  string    `json:"baseWord" gorm:"size:255;not null"`
	ImageURL  string    `json:"imageUrl" gorm:"size:500"`
	Notes     string    `json:"notes" gorm:"type:text"`
	CreatedBy uint      `json:"createdBy" gorm:"not null"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	// Relations
	Creator      User              `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
	Translations []WordTranslation `json:"translations,omitempty" gorm:"foreignKey:WordID"`
}

// Language represents a supported language
type Language struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	Code       string    `json:"code" gorm:"size:10;unique;not null"`
	Name       string    `json:"name" gorm:"size:100;not null"`
	NativeName string    `json:"nativeName" gorm:"size:100"`
	Direction  string    `json:"direction" gorm:"size:3;default:ltr"`
	IsActive   bool      `json:"isActive" gorm:"default:true"`
	CreatedAt  time.Time `json:"createdAt"`
}

// WordTranslation represents language-specific translation
type WordTranslation struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	WordID       uint      `json:"wordId" gorm:"not null"`
	LanguageID   uint      `json:"languageId" gorm:"not null"`
	Translation  string    `json:"translation" gorm:"type:text;not null"`
	Romanization string    `json:"romanization" gorm:"size:255"`
	AudioURL     string    `json:"audioUrl" gorm:"size:500"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`

	// Relations
	Word     Word     `json:"word,omitempty" gorm:"foreignKey:WordID"`
	Language Language `json:"language,omitempty" gorm:"foreignKey:LanguageID"`
}

// TableName specifies the table name for Word
func (Word) TableName() string {
	return "words"
}

// TableName specifies the table name for Language
func (Language) TableName() string {
	return "languages"
}

// TableName specifies the table name for WordTranslation
func (WordTranslation) TableName() string {
	return "word_translations"
}
