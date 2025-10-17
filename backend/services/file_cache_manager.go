package services

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"dannyswat/learnspeak/config"
)

// FileCacheManager implements ImageCacheManager using local file storage
type FileCacheManager struct {
	cacheDir string
}

// NewFileCacheManager creates a new file-based cache manager
func NewFileCacheManager() (*FileCacheManager, error) {
	cfg := config.AppConfig
	cacheDir := filepath.Join(cfg.UploadDir, "image-cache")

	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create cache directory: %w", err)
	}

	return &FileCacheManager{
		cacheDir: cacheDir,
	}, nil
}

// GetCachedImage retrieves a cached image if it exists
func (m *FileCacheManager) GetCachedImage(prompt, size string) (*GeneratedImageResult, error) {
	if !config.AppConfig.ImageCacheEnabled {
		return nil, fmt.Errorf("cache disabled")
	}

	cacheKey := m.getCacheKey(prompt, size)
	cachedPath := filepath.Join(m.cacheDir, cacheKey+".png")

	// Check if file exists
	if _, err := os.Stat(cachedPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("cache miss")
	}

	// Return cached image info
	return &GeneratedImageResult{
		URL:       "", // Cached images don't have URLs
		LocalPath: cachedPath,
		Prompt:    prompt,
		Cached:    true,
	}, nil
}

// CacheImage saves a generated image to cache
func (m *FileCacheManager) CacheImage(imageURL, prompt, size string) (string, error) {
	if !config.AppConfig.ImageCacheEnabled {
		return "", fmt.Errorf("cache disabled")
	}

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
	cacheKey := m.getCacheKey(prompt, size)
	cachedPath := filepath.Join(m.cacheDir, cacheKey+".png")

	if err := os.WriteFile(cachedPath, imageData, 0644); err != nil {
		return "", fmt.Errorf("failed to write cache file: %w", err)
	}

	log.Printf("Cached image: %s (size: %d bytes)", cachedPath, len(imageData))
	return cachedPath, nil
}

// getCacheKey generates an MD5 hash for caching
func (m *FileCacheManager) getCacheKey(prompt, size string) string {
	// Include size in cache key to differentiate different image sizes
	cacheInput := fmt.Sprintf("%s|%s", prompt, size)
	hash := md5.Sum([]byte(cacheInput))
	return hex.EncodeToString(hash[:])
}
