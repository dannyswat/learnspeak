package services

import (
	"context"
	"fmt"
	"log"

	"dannyswat/learnspeak/config"
)

// ImageGenerationService is the main service that uses the configured provider
type ImageGenerationService struct {
	generator ImageGenerator
	cache     ImageCacheManager
}

// NewImageGenerationService creates a new image generation service with the configured provider
func NewImageGenerationService() (*ImageGenerationService, error) {
	cfg := config.AppConfig

	// Create cache manager
	cache, err := NewFileCacheManager()
	if err != nil {
		return nil, fmt.Errorf("failed to create cache manager: %w", err)
	}

	// Create the appropriate generator based on configuration
	var generator ImageGenerator
	provider := cfg.ImageGenerationProvider

	log.Printf("Initializing image generation with provider: %s", provider)

	switch provider {
	case "ideogram":
		gen, err := NewIdeogramGenerator()
		if err != nil {
			return nil, fmt.Errorf("failed to create Ideogram generator: %w", err)
		}
		generator = gen
		if gen.IsConfigured() {
			log.Printf("✅ %s image generator initialized", gen.GetProviderName())
		} else {
			log.Printf("⚠️  %s credentials not configured", gen.GetProviderName())
		}

	case "azure":
		fallthrough
	default:
		gen, err := NewAzureOpenAIGenerator()
		if err != nil {
			return nil, fmt.Errorf("failed to create Azure OpenAI generator: %w", err)
		}
		generator = gen
		if gen.IsConfigured() {
			log.Printf("✅ %s image generator initialized", gen.GetProviderName())
		} else {
			log.Printf("⚠️  %s credentials not configured", gen.GetProviderName())
		}
	}

	return &ImageGenerationService{
		generator: generator,
		cache:     cache,
	}, nil
}

// GenerateImage generates an educational image for a word
func (s *ImageGenerationService) GenerateImage(ctx context.Context, opts ImageGeneratorOptions) (*GeneratedImageResult, error) {
	// Check if generator is configured
	if !s.generator.IsConfigured() {
		return nil, fmt.Errorf("%s is not configured. Please check your .env file", s.generator.GetProviderName())
	}

	// Build prompt
	prompt := s.buildPrompt(opts)
	size := opts.Size
	if size == "" {
		size = "1024x1024"
	}

	// Check cache first
	if config.AppConfig.ImageCacheEnabled {
		cachedImage, err := s.cache.GetCachedImage(prompt, size)
		if err == nil {
			log.Printf("✅ Using cached image for prompt: %s", prompt)
			return cachedImage, nil
		}
	}

	// Generate new image using the configured provider
	log.Printf("🎨 Generating new image using %s for prompt: %s", s.generator.GetProviderName(), prompt)
	result, err := s.generator.GenerateImage(ctx, opts)
	if err != nil {
		return nil, err
	}

	// Download and cache image
	if config.AppConfig.ImageCacheEnabled && result.URL != "" {
		localPath, err := s.cache.CacheImage(result.URL, prompt, size)
		if err != nil {
			log.Printf("⚠️  Warning: failed to cache image: %v", err)
		} else {
			result.LocalPath = "/" + localPath
		}
	}

	return result, nil
}

// buildPrompt builds a consistent prompt regardless of provider
func (s *ImageGenerationService) buildPrompt(opts ImageGeneratorOptions) string {
	// Let the generator build its own prompt for now
	// This is a placeholder in case we want centralized prompt building
	word := opts.Word
	translation := opts.Translation

	if translation != "" {
		return fmt.Sprintf("%s (%s)", word, translation)
	}
	return word
} // Build educational prompt
