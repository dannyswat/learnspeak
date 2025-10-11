package repositories

import (
	"fmt"
	"strings"

	"dannyswat/learnspeak/models"

	"gorm.io/gorm"
)

type WordRepository interface {
	Create(word *models.Word) error
	GetByID(id uint) (*models.Word, error)
	Update(word *models.Word) error
	Delete(id uint) error
	List(search string, languageID, createdBy uint, page, pageSize int) ([]models.Word, int64, error)
	GetTranslationsByWordID(wordID uint) ([]models.WordTranslation, error)
	CreateTranslation(translation *models.WordTranslation) error
	UpdateTranslation(translation *models.WordTranslation) error
	DeleteTranslation(id uint) error
}

type wordRepository struct {
	db *gorm.DB
}

func NewWordRepository(db *gorm.DB) WordRepository {
	return &wordRepository{db: db}
}

// Create creates a new word
func (r *wordRepository) Create(word *models.Word) error {
	return r.db.Create(word).Error
}

// GetByID retrieves a word by ID with translations
func (r *wordRepository) GetByID(id uint) (*models.Word, error) {
	var word models.Word
	err := r.db.
		Preload("Creator").
		Preload("Translations.Language").
		First(&word, id).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("word not found")
		}
		return nil, err
	}

	return &word, nil
}

// Update updates an existing word
func (r *wordRepository) Update(word *models.Word) error {
	return r.db.Save(word).Error
}

// Delete deletes a word by ID
func (r *wordRepository) Delete(id uint) error {
	// First delete all translations
	if err := r.db.Where("word_id = ?", id).Delete(&models.WordTranslation{}).Error; err != nil {
		return err
	}

	// Then delete the word
	result := r.db.Delete(&models.Word{}, id)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("word not found")
	}

	return nil
}

// List retrieves words with filtering and pagination
func (r *wordRepository) List(search string, languageID, createdBy uint, page, pageSize int) ([]models.Word, int64, error) {
	var words []models.Word
	var total int64

	query := r.db.Model(&models.Word{})

	// Apply filters
	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(base_word) LIKE ?", searchPattern)
	}

	if languageID > 0 {
		// Filter by language through translations
		query = query.Joins("JOIN word_translations ON word_translations.word_id = words.id").
			Where("word_translations.language_id = ?", languageID).
			Distinct()
	}

	if createdBy > 0 {
		query = query.Where("created_by = ?", createdBy)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (page - 1) * pageSize
	query = query.Offset(offset).Limit(pageSize)

	// Fetch with relations
	err := query.
		Preload("Creator").
		Preload("Translations.Language").
		Order("created_at DESC").
		Find(&words).Error

	if err != nil {
		return nil, 0, err
	}

	return words, total, nil
}

// GetTranslationsByWordID retrieves all translations for a word
func (r *wordRepository) GetTranslationsByWordID(wordID uint) ([]models.WordTranslation, error) {
	var translations []models.WordTranslation
	err := r.db.
		Preload("Language").
		Where("word_id = ?", wordID).
		Find(&translations).Error

	return translations, err
}

// CreateTranslation creates a new translation
func (r *wordRepository) CreateTranslation(translation *models.WordTranslation) error {
	return r.db.Create(translation).Error
}

// UpdateTranslation updates an existing translation
func (r *wordRepository) UpdateTranslation(translation *models.WordTranslation) error {
	return r.db.Save(translation).Error
}

// DeleteTranslation deletes a translation by ID
func (r *wordRepository) DeleteTranslation(id uint) error {
	result := r.db.Delete(&models.WordTranslation{}, id)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("translation not found")
	}

	return nil
}
