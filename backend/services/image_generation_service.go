package services

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"dannyswat/learnspeak/config"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/azure"
)

type ImageGenerationService struct {
	client   *openai.Client
	cacheDir string
}

type ImageGenerationOptions struct {
	Word        string
	Translation string
	Size        string // "1024x1024", "1792x1024", "1024x1792"
	Quality     string // "standard" or "hd"
	Style       string // "vivid" or "natural"
}

type GeneratedImage struct {
	URL       string `json:"url"`
	LocalPath string `json:"local_path"`
	Prompt    string `json:"prompt"`
	Cached    bool   `json:"cached"`
}

// NewImageGenerationService creates a new image generation service
func NewImageGenerationService() (*ImageGenerationService, error) {
	cfg := config.AppConfig

	// Setup cache directory first
	cacheDir := filepath.Join(cfg.UploadDir, "image-cache")
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create cache directory: %w", err)
	}

	// Check if Azure OpenAI is configured
	if cfg.AzureOpenAIKey == "" || cfg.AzureOpenAIEndpoint == "" {
		// Return service without client - will show proper error when used
		log.Println("Warning: Azure OpenAI credentials not configured. Image generation will not work until credentials are added.")
		return &ImageGenerationService{
			client:   nil,
			cacheDir: cacheDir,
		}, nil
	}

	// Create Azure OpenAI client using openai-go
	client := openai.NewClient(
		azure.WithEndpoint(cfg.AzureOpenAIEndpoint, "2024-02-01"),
		azure.WithAPIKey(cfg.AzureOpenAIKey),
	)

	return &ImageGenerationService{
		client:   &client,
		cacheDir: cacheDir,
	}, nil
}

// GenerateImage generates an educational image for a word
func (s *ImageGenerationService) GenerateImage(ctx context.Context, opts ImageGenerationOptions) (*GeneratedImage, error) {
	// Check if client is configured
	if s.client == nil {
		return nil, fmt.Errorf("Azure OpenAI is not configured. Please add AZURE_OPENAI_KEY and AZURE_OPENAI_ENDPOINT to your .env file")
	}

	// Build educational prompt
	prompt := s.buildEducationalPrompt(opts)

	// Check cache first
	if config.AppConfig.ImageCacheEnabled {
		cachedImage, err := s.getCachedImage(prompt, opts.Size)
		if err == nil {
			log.Printf("Using cached image for prompt: %s", prompt)
			return cachedImage, nil
		}
	}

	// Generate new image
	log.Printf("Generating new image for prompt: %s", prompt)
	imageURL, err := s.generateImageFromAzure(ctx, prompt, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to generate image: %w", err)
	}

	// Download and cache image
	localPath, err := s.downloadAndCacheImage(imageURL, prompt, opts.Size)
	if err != nil {
		log.Printf("Warning: failed to cache image: %v", err)
		// Return the URL even if caching fails
		return &GeneratedImage{
			URL:    imageURL,
			Prompt: prompt,
			Cached: false,
		}, nil
	}

	return &GeneratedImage{
		URL:       imageURL,
		LocalPath: "/" + localPath,
		Prompt:    prompt,
		Cached:    false,
	}, nil
}

// buildEducationalPrompt creates a child-safe, educational prompt
func (s *ImageGenerationService) buildEducationalPrompt(opts ImageGenerationOptions) string {
	word := opts.Word
	translation := opts.Translation

	// Base template for educational images
	var prompt string
	if translation != "" {
		prompt = fmt.Sprintf(
			"A simple illustration of '%s' (%s) designed for children learning Cantonese. "+
				"Clear visual representation suitable for vocabulary learning.",
			word, translation,
		)
	} else {
		prompt = fmt.Sprintf(
			"A simple illustration of '%s' designed for children learning Cantonese. "+
				"Clear visual representation suitable for vocabulary learning.",
			word,
		)
	}

	return prompt
}

// generateImageFromAzure calls Azure OpenAI DALL-E 3 API
func (s *ImageGenerationService) generateImageFromAzure(ctx context.Context, prompt string, opts ImageGenerationOptions) (string, error) {
	cfg := config.AppConfig

	// Set defaults
	size := opts.Size
	if size == "" {
		size = "1024x1024"
	}

	quality := opts.Quality
	if quality == "" {
		quality = "standard" // or "hd" for higher quality
	}

	style := opts.Style
	if style == "" {
		style = "vivid" // or "natural"
	}

	// Convert size string to ImageGenerateParamsSize type
	var imageSize openai.ImageGenerateParamsSize
	switch size {
	case "1024x1024":
		imageSize = openai.ImageGenerateParamsSize1024x1024
	case "1792x1024":
		imageSize = openai.ImageGenerateParamsSize1792x1024
	case "1024x1792":
		imageSize = openai.ImageGenerateParamsSize1024x1792
	default:
		imageSize = openai.ImageGenerateParamsSize1024x1024
	}

	// Convert quality string to ImageGenerateParamsQuality type
	var imageQuality openai.ImageGenerateParamsQuality
	if quality == "hd" {
		imageQuality = openai.ImageGenerateParamsQualityHD
	} else {
		imageQuality = openai.ImageGenerateParamsQualityStandard
	}

	// Convert style string to ImageGenerateParamsStyle type
	var imageStyle openai.ImageGenerateParamsStyle
	if style == "natural" {
		imageStyle = openai.ImageGenerateParamsStyleNatural
	} else {
		imageStyle = openai.ImageGenerateParamsStyleVivid
	}

	// Prepare request with timeout
	ctxWithTimeout, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	// Call Azure OpenAI using DALL-E 3
	resp, err := s.client.Images.Generate(ctxWithTimeout, openai.ImageGenerateParams{
		Prompt:         prompt,
		Model:          openai.ImageModel(cfg.AzureOpenAIDeployment),
		Size:           imageSize,
		Quality:        imageQuality,
		Style:          imageStyle,
		ResponseFormat: openai.ImageGenerateParamsResponseFormatURL,
	})

	if err != nil {
		return "", fmt.Errorf("Azure OpenAI API error: %w", err)
	}

	// Extract image URL
	if len(resp.Data) == 0 {
		return "", fmt.Errorf("no images generated")
	}

	imageURL := resp.Data[0].URL
	if imageURL == "" {
		return "", fmt.Errorf("empty image URL returned")
	}

	return imageURL, nil
}

// getCachedImage retrieves a cached image if it exists
func (s *ImageGenerationService) getCachedImage(prompt, size string) (*GeneratedImage, error) {
	cacheKey := s.getCacheKey(prompt, size)
	cachedPath := filepath.Join(s.cacheDir, cacheKey+".png")

	// Check if file exists
	if _, err := os.Stat(cachedPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("cache miss")
	}

	// Return cached image info
	return &GeneratedImage{
		URL:       "", // Cached images don't have URLs
		LocalPath: cachedPath,
		Prompt:    prompt,
		Cached:    true,
	}, nil
}

// downloadAndCacheImage downloads and caches the generated image
func (s *ImageGenerationService) downloadAndCacheImage(imageURL, prompt, size string) (string, error) {
	// Download image
	resp, err := http.Get(imageURL)
	if err != nil {
		return "", fmt.Errorf("failed to download image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to download image: status %d", resp.StatusCode)
	}

	// Read image data
	imageData, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read image data: %w", err)
	}

	// Save to cache
	cacheKey := s.getCacheKey(prompt, size)
	cachedPath := filepath.Join(s.cacheDir, cacheKey+".png")

	if err := os.WriteFile(cachedPath, imageData, 0644); err != nil {
		return "", fmt.Errorf("failed to write cache file: %w", err)
	}

	log.Printf("Cached image: %s (size: %d bytes)", cachedPath, len(imageData))
	return cachedPath, nil
}

// getCacheKey generates an MD5 hash for caching
func (s *ImageGenerationService) getCacheKey(prompt, size string) string {
	// Include size in cache key to differentiate different image sizes
	cacheInput := fmt.Sprintf("%s|%s", prompt, size)
	hash := md5.Sum([]byte(cacheInput))
	return hex.EncodeToString(hash[:])
}

// GetCacheStats returns cache statistics
func (s *ImageGenerationService) GetCacheStats() (int, int64, error) {
	files, err := os.ReadDir(s.cacheDir)
	if err != nil {
		return 0, 0, err
	}

	var totalSize int64
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".png") {
			info, err := file.Info()
			if err == nil {
				totalSize += info.Size()
			}
		}
	}

	return len(files), totalSize, nil
}

// ClearCache removes all cached images
func (s *ImageGenerationService) ClearCache() error {
	files, err := os.ReadDir(s.cacheDir)
	if err != nil {
		return err
	}

	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".png") {
			if err := os.Remove(filepath.Join(s.cacheDir, file.Name())); err != nil {
				log.Printf("Warning: failed to remove cache file %s: %v", file.Name(), err)
			}
		}
	}

	return nil
}
