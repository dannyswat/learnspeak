package repositories

import (
	"dannyswat/learnspeak/models"

	"gorm.io/gorm"
)

type LanguageRepository interface {
	GetAllLanguages() ([]models.Language, error)
	GetLanguageByID(id uint) (*models.Language, error)
}

type languageRepository struct {
	db *gorm.DB
}

func NewLanguageRepository(db *gorm.DB) LanguageRepository {
	return &languageRepository{db: db}
}

func (r *languageRepository) GetAllLanguages() ([]models.Language, error) {
	var languages []models.Language
	err := r.db.Where("is_active = ?", true).Order("name ASC").Find(&languages).Error
	return languages, err
}

func (r *languageRepository) GetLanguageByID(id uint) (*models.Language, error) {
	var language models.Language
	err := r.db.First(&language, id).Error
	if err != nil {
		return nil, err
	}
	return &language, nil
}
