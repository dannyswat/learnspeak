package services

import (
	"fmt"
	"math"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/models"
	"dannyswat/learnspeak/repositories"
)

type WordService interface {
	CreateWord(req *dto.CreateWordRequest, userID uint) (*dto.WordResponse, error)
	GetWord(id uint) (*dto.WordResponse, error)
	UpdateWord(id uint, req *dto.UpdateWordRequest, userID uint) (*dto.WordResponse, error)
	DeleteWord(id uint, userID uint) error
	ListWords(params *dto.WordFilterParams) (*dto.WordListResponse, error)
}

type wordService struct {
	wordRepo repositories.WordRepository
}

func NewWordService(wordRepo repositories.WordRepository) WordService {
	return &wordService{
		wordRepo: wordRepo,
	}
}

// CreateWord creates a new word with translations
func (s *wordService) CreateWord(req *dto.CreateWordRequest, userID uint) (*dto.WordResponse, error) {
	// Create word model
	word := &models.Word{
		BaseWord:  req.BaseWord,
		ImageURL:  req.ImageURL,
		Notes:     req.Notes,
		CreatedBy: userID,
	}

	// Create word
	if err := s.wordRepo.Create(word); err != nil {
		return nil, fmt.Errorf("failed to create word: %w", err)
	}

	// Create translations
	for _, translationInput := range req.Translations {
		translation := &models.WordTranslation{
			WordID:       word.ID,
			LanguageID:   translationInput.LanguageID,
			Translation:  translationInput.Translation,
			Romanization: translationInput.Romanization,
			AudioURL:     translationInput.AudioURL,
		}

		if err := s.wordRepo.CreateTranslation(translation); err != nil {
			return nil, fmt.Errorf("failed to create translation: %w", err)
		}
	}

	// Fetch the created word with relations
	createdWord, err := s.wordRepo.GetByID(word.ID)
	if err != nil {
		return nil, err
	}

	return s.toWordResponse(createdWord), nil
}

// GetWord retrieves a word by ID
func (s *wordService) GetWord(id uint) (*dto.WordResponse, error) {
	word, err := s.wordRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	return s.toWordResponse(word), nil
}

// UpdateWord updates an existing word
func (s *wordService) UpdateWord(id uint, req *dto.UpdateWordRequest, userID uint) (*dto.WordResponse, error) {
	// Fetch existing word
	word, err := s.wordRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Check ownership (only creator can update)
	if word.CreatedBy != userID {
		return nil, fmt.Errorf("unauthorized: only the creator can update this word")
	}

	// Update word fields
	if req.BaseWord != nil {
		word.BaseWord = *req.BaseWord
	}
	if req.ImageURL != nil {
		word.ImageURL = *req.ImageURL
	}
	if req.Notes != nil {
		word.Notes = *req.Notes
	}

	// Save word updates
	if err := s.wordRepo.Update(word); err != nil {
		return nil, fmt.Errorf("failed to update word: %w", err)
	}

	// Update translations if provided
	if len(req.Translations) > 0 {
		// Get existing translations
		existingTranslations, err := s.wordRepo.GetTranslationsByWordID(id)
		if err != nil {
			return nil, fmt.Errorf("failed to get existing translations: %w", err)
		}

		// Create a map of existing translations by ID
		existingMap := make(map[uint]*models.WordTranslation)
		for i := range existingTranslations {
			existingMap[existingTranslations[i].ID] = &existingTranslations[i]
		}

		// Track which translations are updated
		updatedIDs := make(map[uint]bool)

		// Update or create translations
		for _, translationInput := range req.Translations {
			if translationInput.ID != nil && *translationInput.ID > 0 {
				// Update existing translation
				existing, exists := existingMap[*translationInput.ID]
				if !exists {
					return nil, fmt.Errorf("translation with ID %d not found", *translationInput.ID)
				}

				existing.LanguageID = translationInput.LanguageID
				existing.Translation = translationInput.Translation
				if translationInput.Romanization != nil {
					existing.Romanization = *translationInput.Romanization
				}
				if translationInput.AudioURL != nil {
					existing.AudioURL = *translationInput.AudioURL
				}

				if err := s.wordRepo.UpdateTranslation(existing); err != nil {
					return nil, fmt.Errorf("failed to update translation: %w", err)
				}

				updatedIDs[*translationInput.ID] = true
			} else {
				// Create new translation
				newTranslation := &models.WordTranslation{
					WordID:      id,
					LanguageID:  translationInput.LanguageID,
					Translation: translationInput.Translation,
				}

				if translationInput.Romanization != nil {
					newTranslation.Romanization = *translationInput.Romanization
				}
				if translationInput.AudioURL != nil {
					newTranslation.AudioURL = *translationInput.AudioURL
				}

				if err := s.wordRepo.CreateTranslation(newTranslation); err != nil {
					return nil, fmt.Errorf("failed to create translation: %w", err)
				}
			}
		}

		// Delete translations that were not included in the update
		for id := range existingMap {
			if !updatedIDs[id] {
				if err := s.wordRepo.DeleteTranslation(id); err != nil {
					return nil, fmt.Errorf("failed to delete translation: %w", err)
				}
			}
		}
	}

	// Fetch updated word
	updatedWord, err := s.wordRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	return s.toWordResponse(updatedWord), nil
}

// DeleteWord deletes a word
func (s *wordService) DeleteWord(id uint, userID uint) error {
	// Fetch existing word to check ownership
	word, err := s.wordRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check ownership (only creator can delete)
	if word.CreatedBy != userID {
		return fmt.Errorf("unauthorized: only the creator can delete this word")
	}

	return s.wordRepo.Delete(id)
}

// ListWords retrieves words with filtering and pagination
func (s *wordService) ListWords(params *dto.WordFilterParams) (*dto.WordListResponse, error) {
	// Set default pagination
	page := params.Page
	if page < 1 {
		page = 1
	}

	pageSize := params.PageSize
	if pageSize < 1 {
		pageSize = 10
	}
	if pageSize > 100 {
		pageSize = 100
	}

	// Fetch words
	words, total, err := s.wordRepo.List(params.Search, params.LanguageID, params.CreatedBy, page, pageSize)
	if err != nil {
		return nil, err
	}

	// Convert to response
	wordResponses := make([]dto.WordResponse, len(words))
	for i, word := range words {
		wordResponses[i] = *s.toWordResponse(&word)
	}

	// Calculate total pages
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &dto.WordListResponse{
		Words:      wordResponses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// Helper: Convert model to response DTO
func (s *wordService) toWordResponse(word *models.Word) *dto.WordResponse {
	response := &dto.WordResponse{
		ID:        word.ID,
		BaseWord:  word.BaseWord,
		ImageURL:  word.ImageURL,
		Notes:     word.Notes,
		CreatedBy: word.CreatedBy,
		CreatedAt: word.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: word.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	// Add creator info if loaded
	if word.Creator.ID > 0 {
		response.Creator = &dto.CreatorInfo{
			ID:    word.Creator.ID,
			Name:  word.Creator.Name,
			Email: word.Creator.Email,
		}
	}

	// Add translations
	response.Translations = make([]dto.TranslationResponse, len(word.Translations))
	for i, trans := range word.Translations {
		translationResp := dto.TranslationResponse{
			ID:           trans.ID,
			WordID:       trans.WordID,
			LanguageID:   trans.LanguageID,
			Translation:  trans.Translation,
			Romanization: trans.Romanization,
			AudioURL:     trans.AudioURL,
		}

		// Add language info if loaded
		if trans.Language.ID > 0 {
			translationResp.Language = &dto.LanguageInfo{
				ID:         trans.Language.ID,
				Code:       trans.Language.Code,
				Name:       trans.Language.Name,
				NativeName: trans.Language.NativeName,
			}
		}

		response.Translations[i] = translationResp
	}

	return response
}
