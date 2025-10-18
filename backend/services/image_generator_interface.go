package services

import (
	"context"
)

// ImageGeneratorOptions contains options for image generation
type ImageGeneratorOptions struct {
	Word         string
	Translation  string
	Size         string // "1024x1024", "1792x1024", "1024x1792"
	Quality      string // "standard" or "hd"
	Style        string // "vivid" or "natural"
	CustomPrompt string // Custom prompt to override the default
}

// GeneratedImageResult represents the result of image generation
type GeneratedImageResult struct {
	URL       string
	LocalPath string
	Prompt    string
	Cached    bool
}

// ImageGenerator is the interface that all image generation providers must implement
type ImageGenerator interface {
	// GenerateImage generates an educational image for a word
	GenerateImage(ctx context.Context, opts ImageGeneratorOptions) (*GeneratedImageResult, error)

	// GetProviderName returns the name of the image generation provider
	GetProviderName() string

	// IsConfigured returns true if the provider is properly configured
	IsConfigured() bool
}

// ImageCacheManager handles caching of generated images
type ImageCacheManager interface {
	// GetCachedImage retrieves a cached image if it exists
	GetCachedImage(prompt, size string) (*GeneratedImageResult, error)

	// CacheImage saves a generated image to cache
	CacheImage(imageURL, prompt, size string) (string, error)
}
