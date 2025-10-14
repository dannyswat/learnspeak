package services

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"dannyswat/learnspeak/config"
)

// TranslationService handles text translation using Azure Translator
type TranslationService struct {
	config       *config.Config
	client       *http.Client
	cacheDir     string
	cacheEnabled bool
}

// TranslateRequest represents a translation request
type TranslateRequest struct {
	Text       string `json:"text" validate:"required"`
	FromLang   string `json:"fromLang"`   // e.g., "en"
	ToLang     string `json:"toLang"`     // e.g., "zh-Hant" for Traditional Chinese
	Suggestion bool   `json:"suggestion"` // Get alternative translations
}

// BatchTranslateRequest represents a batch translation request
type BatchTranslateRequest struct {
	Texts    []string `json:"texts" validate:"required,min=1"`
	FromLang string   `json:"fromLang"`
	ToLang   string   `json:"toLang"`
}

// TranslationResult represents a single translation result
type TranslationResult struct {
	Text             string   `json:"text"`
	Translation      string   `json:"translation"`
	DetectedLanguage string   `json:"detectedLanguage,omitempty"`
	Alternatives     []string `json:"alternatives,omitempty"`
	Cached           bool     `json:"cached"`
}

// BatchTranslationResult represents batch translation results
type BatchTranslationResult struct {
	Results []TranslationResult `json:"results"`
	Total   int                 `json:"total"`
	Cached  int                 `json:"cached"`
}

// Azure Translator API structures
type azureTranslateRequest struct {
	Text string `json:"Text"`
}

type azureTranslateResponse struct {
	DetectedLanguage *struct {
		Language string  `json:"language"`
		Score    float64 `json:"score"`
	} `json:"detectedLanguage,omitempty"`
	Translations []struct {
		Text string `json:"text"`
		To   string `json:"to"`
	} `json:"translations"`
}

type azureDictionaryResponse struct {
	Translations []struct {
		DisplayTarget string  `json:"displayTarget"`
		PosTag        string  `json:"posTag"`
		Confidence    float64 `json:"confidence"`
	} `json:"translations"`
}

// NewTranslationService creates a new translation service
func NewTranslationService(cfg *config.Config) *TranslationService {
	// Create cache directory if it doesn't exist
	cacheDir := filepath.Join(cfg.UploadDir, "translation-cache")
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		fmt.Printf("Warning: Could not create translation cache directory: %v\n", err)
	}

	return &TranslationService{
		config:       cfg,
		client:       &http.Client{},
		cacheDir:     cacheDir,
		cacheEnabled: cfg.TranslatorCacheEnabled,
	}
}

// Translate translates a single text
func (s *TranslationService) Translate(req *TranslateRequest) (*TranslationResult, error) {
	if req.Text == "" {
		return nil, errors.New("text is required")
	}

	// Check if Azure Translator is configured
	if s.config.AzureTranslatorKey == "" {
		return nil, errors.New("Azure Translator is not configured. Please set AZURE_TRANSLATOR_KEY environment variable")
	}

	// Default to English → Traditional Chinese if not specified
	if req.FromLang == "" {
		req.FromLang = "en"
	}
	if req.ToLang == "" {
		req.ToLang = "zh-Hant"
	}

	// Generate cache key
	cacheKey := s.generateCacheKey(req.Text, req.FromLang, req.ToLang)
	cacheFile := filepath.Join(s.cacheDir, cacheKey+".json")

	// Check cache if enabled
	if s.cacheEnabled {
		if result, err := s.loadFromCache(cacheFile); err == nil {
			result.Cached = true
			return result, nil
		}
	}

	// Call Azure Translator API
	translation, detectedLang, err := s.callAzureTranslator(req.Text, req.FromLang, req.ToLang)
	if err != nil {
		return nil, fmt.Errorf("failed to translate: %w", err)
	}

	result := &TranslationResult{
		Text:             req.Text,
		Translation:      translation,
		DetectedLanguage: detectedLang,
		Cached:           false,
	}

	// Get alternatives if requested
	if req.Suggestion {
		alternatives, _ := s.getAlternativeTranslations(req.Text, req.FromLang, req.ToLang)
		result.Alternatives = alternatives
	}

	// Save to cache
	if s.cacheEnabled {
		s.saveToCache(cacheFile, result)
	}

	return result, nil
}

// BatchTranslate translates multiple texts
func (s *TranslationService) BatchTranslate(req *BatchTranslateRequest) (*BatchTranslationResult, error) {
	if len(req.Texts) == 0 {
		return nil, errors.New("at least one text is required")
	}

	// Check if Azure Translator is configured
	if s.config.AzureTranslatorKey == "" {
		return nil, errors.New("Azure Translator is not configured. Please set AZURE_TRANSLATOR_KEY environment variable")
	}

	// Default languages
	if req.FromLang == "" {
		req.FromLang = "en"
	}
	if req.ToLang == "" {
		req.ToLang = "zh-Hant"
	}

	results := make([]TranslationResult, 0, len(req.Texts))
	cachedCount := 0

	for _, text := range req.Texts {
		// Skip empty texts
		if strings.TrimSpace(text) == "" {
			continue
		}

		translateReq := &TranslateRequest{
			Text:     text,
			FromLang: req.FromLang,
			ToLang:   req.ToLang,
		}

		result, err := s.Translate(translateReq)
		if err != nil {
			// On error, return partial translation with error message
			result = &TranslationResult{
				Text:        text,
				Translation: fmt.Sprintf("[Translation error: %v]", err),
				Cached:      false,
			}
		}

		if result.Cached {
			cachedCount++
		}

		results = append(results, *result)
	}

	return &BatchTranslationResult{
		Results: results,
		Total:   len(results),
		Cached:  cachedCount,
	}, nil
}

// callAzureTranslator makes the actual API call to Azure Translator
func (s *TranslationService) callAzureTranslator(text, fromLang, toLang string) (string, string, error) {
	endpoint := s.config.AzureTranslatorEndpoint + "/translate"

	// Build query parameters
	params := fmt.Sprintf("?api-version=3.0&to=%s", toLang)
	if fromLang != "" && fromLang != "auto" {
		params += fmt.Sprintf("&from=%s", fromLang)
	}

	// Prepare request body
	requestBody := []azureTranslateRequest{
		{Text: text},
	}
	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return "", "", err
	}

	// Create request
	req, err := http.NewRequest("POST", endpoint+params, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", "", err
	}

	// Set headers
	req.Header.Set("Ocp-Apim-Subscription-Key", s.config.AzureTranslatorKey)
	req.Header.Set("Ocp-Apim-Subscription-Region", s.config.AzureTranslatorRegion)
	req.Header.Set("Content-Type", "application/json")

	// Make request
	resp, err := s.client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", err
	}

	// Check for errors
	if resp.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("Azure Translator API error (status %d): %s", resp.StatusCode, string(body))
	}

	// Parse response
	var azureResp []azureTranslateResponse
	if err := json.Unmarshal(body, &azureResp); err != nil {
		return "", "", fmt.Errorf("failed to parse response: %w", err)
	}

	if len(azureResp) == 0 || len(azureResp[0].Translations) == 0 {
		return "", "", errors.New("no translation returned from Azure")
	}

	translation := azureResp[0].Translations[0].Text
	detectedLang := ""
	if azureResp[0].DetectedLanguage != nil {
		detectedLang = azureResp[0].DetectedLanguage.Language
	}

	return translation, detectedLang, nil
}

// getAlternativeTranslations gets alternative translations using Azure Dictionary API
func (s *TranslationService) getAlternativeTranslations(text, fromLang, toLang string) ([]string, error) {
	endpoint := s.config.AzureTranslatorEndpoint + "/dictionary/lookup"
	params := fmt.Sprintf("?api-version=3.0&from=%s&to=%s", fromLang, toLang)

	// Prepare request body
	requestBody := []azureTranslateRequest{
		{Text: text},
	}
	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, err
	}

	// Create request
	req, err := http.NewRequest("POST", endpoint+params, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	// Set headers
	req.Header.Set("Ocp-Apim-Subscription-Key", s.config.AzureTranslatorKey)
	req.Header.Set("Ocp-Apim-Subscription-Region", s.config.AzureTranslatorRegion)
	req.Header.Set("Content-Type", "application/json")

	// Make request
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		// Dictionary lookup may not be available for all language pairs
		return nil, nil
	}

	// Parse response
	var dictResp []azureDictionaryResponse
	if err := json.Unmarshal(body, &dictResp); err != nil {
		return nil, nil
	}

	// Extract alternatives
	alternatives := make([]string, 0)
	if len(dictResp) > 0 {
		for i, trans := range dictResp[0].Translations {
			if i >= 3 { // Limit to top 3 alternatives
				break
			}
			alternatives = append(alternatives, trans.DisplayTarget)
		}
	}

	return alternatives, nil
}

// generateCacheKey generates a cache key from text and language pair
func (s *TranslationService) generateCacheKey(text, fromLang, toLang string) string {
	data := text + "|" + fromLang + "|" + toLang
	hash := md5.Sum([]byte(data))
	return hex.EncodeToString(hash[:])
}

// loadFromCache loads a translation from cache
func (s *TranslationService) loadFromCache(cacheFile string) (*TranslationResult, error) {
	data, err := os.ReadFile(cacheFile)
	if err != nil {
		return nil, err
	}

	var result TranslationResult
	if err := json.Unmarshal(data, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// saveToCache saves a translation to cache
func (s *TranslationService) saveToCache(cacheFile string, result *TranslationResult) error {
	data, err := json.Marshal(result)
	if err != nil {
		return err
	}

	return os.WriteFile(cacheFile, data, 0644)
}
