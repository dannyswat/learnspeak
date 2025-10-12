package repositories

import (
	"dannyswat/learnspeak/models"

	"gorm.io/gorm"
)

type QuizRepository interface {
	Create(question *models.QuizQuestion) error
	GetByID(id uint) (*models.QuizQuestion, error)
	GetByTopicID(topicID uint) ([]models.QuizQuestion, error)
	Update(question *models.QuizQuestion) error
	Delete(id uint) error
	List(limit, offset int) ([]models.QuizQuestion, int64, error)
	CountByTopicID(topicID uint) (int64, error)
}

type quizRepository struct {
	db *gorm.DB
}

func NewQuizRepository(db *gorm.DB) QuizRepository {
	return &quizRepository{db: db}
}

// Create creates a new quiz question
func (r *quizRepository) Create(question *models.QuizQuestion) error {
	return r.db.Create(question).Error
}

// GetByID retrieves a quiz question by ID
func (r *quizRepository) GetByID(id uint) (*models.QuizQuestion, error) {
	var question models.QuizQuestion
	err := r.db.Preload("Topic").Preload("Word").First(&question, id).Error
	if err != nil {
		return nil, err
	}
	return &question, nil
}

// GetByTopicID retrieves all quiz questions for a topic
func (r *quizRepository) GetByTopicID(topicID uint) ([]models.QuizQuestion, error) {
	var questions []models.QuizQuestion
	err := r.db.Where("topic_id = ?", topicID).
		Preload("Word").
		Order("id ASC").
		Find(&questions).Error
	if err != nil {
		return nil, err
	}
	return questions, nil
}

// Update updates a quiz question
func (r *quizRepository) Update(question *models.QuizQuestion) error {
	return r.db.Save(question).Error
}

// Delete deletes a quiz question
func (r *quizRepository) Delete(id uint) error {
	return r.db.Delete(&models.QuizQuestion{}, id).Error
}

// List retrieves all quiz questions with pagination
func (r *quizRepository) List(limit, offset int) ([]models.QuizQuestion, int64, error) {
	var questions []models.QuizQuestion
	var total int64

	// Get total count
	if err := r.db.Model(&models.QuizQuestion{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	err := r.db.Preload("Topic").
		Preload("Word").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&questions).Error

	if err != nil {
		return nil, 0, err
	}

	return questions, total, nil
}

// CountByTopicID counts quiz questions for a topic
func (r *quizRepository) CountByTopicID(topicID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.QuizQuestion{}).Where("topic_id = ?", topicID).Count(&count).Error
	return count, err
}
