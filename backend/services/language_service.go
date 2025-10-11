package services

import (
	"dannyswat/learnspeak/models"
	"dannyswat/learnspeak/repositories"
)

type LanguageService interface {
	GetAllLanguages() ([]models.Language, error)
}

type languageService struct {
	languageRepo repositories.LanguageRepository
}

func NewLanguageService(languageRepo repositories.LanguageRepository) LanguageService {
	return &languageService{
		languageRepo: languageRepo,
	}
}

func (s *languageService) GetAllLanguages() ([]models.Language, error) {
	return s.languageRepo.GetAllLanguages()
}
