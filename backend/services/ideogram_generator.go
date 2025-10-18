package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"time"

	"dannyswat/learnspeak/config"
)

// IdeogramGenerator implements ImageGenerator using Ideogram API (v3)
type IdeogramGenerator struct {
	apiKey   string
	endpoint string
}

// IdeogramResponse represents the response from Ideogram API v3
type IdeogramResponse struct {
	Created string          `json:"created"`
	Data    []IdeogramImage `json:"data"`
}

// IdeogramImage represents a single generated image from v3 API
type IdeogramImage struct {
	URL         string `json:"url"`
	Prompt      string `json:"prompt"`
	Resolution  string `json:"resolution"`
	IsImageSafe bool   `json:"is_image_safe"`
	Seed        int    `json:"seed,omitempty"`
	StyleType   string `json:"style_type,omitempty"`
}

// NewIdeogramGenerator creates a new Ideogram image generator
func NewIdeogramGenerator() (*IdeogramGenerator, error) {
	cfg := config.AppConfig

	// Check if Ideogram is configured
	if cfg.IdeogramAPIKey == "" {
		log.Println("Warning: Ideogram API key not configured")
		return &IdeogramGenerator{
			apiKey:   "",
			endpoint: "https://api.ideogram.ai/v1/ideogram-v3/generate",
		}, nil
	}

	return &IdeogramGenerator{
		apiKey:   cfg.IdeogramAPIKey,
		endpoint: "https://api.ideogram.ai/v1/ideogram-v3/generate",
	}, nil
}

// GenerateImage generates an educational image using Ideogram API v3
func (g *IdeogramGenerator) GenerateImage(ctx context.Context, opts ImageGeneratorOptions) (*GeneratedImageResult, error) {
	// Check if API key is configured
	if g.apiKey == "" {
		return nil, fmt.Errorf("Ideogram API is not configured. Please add IDEOGRAM_API_KEY to your .env file")
	}

	// Build educational prompt
	prompt := g.buildEducationalPrompt(opts)

	// Convert size to aspect ratio
	aspectRatio := g.sizeToAspectRatio(opts.Size)

	// Prepare multipart form data
	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	// Add form fields
	writer.WriteField("prompt", prompt)
	writer.WriteField("aspect_ratio", aspectRatio)
	writer.WriteField("rendering_speed", "FLASH") // Use FLASH model (3.0 flash)
	writer.WriteField("magic_prompt", "AUTO")     // Enable magic prompt enhancement
	writer.WriteField("style_type", "DESIGN")     // Use design style for educational illustrations
	writer.WriteField("negative_prompt", "violence, scary, dark, inappropriate, adult content, text, words, letters")

	// Close the writer to finalize the multipart message
	err := writer.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to close multipart writer: %w", err)
	}

	// Create HTTP request with timeout
	ctxWithTimeout, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctxWithTimeout, "POST", g.endpoint, &requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Api-Key", g.apiKey)

	// Make API call
	client := &http.Client{
		Timeout: 60 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("Ideogram API error: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check for errors
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Ideogram API error: status %d, body: %s", resp.StatusCode, string(body))
	}

	// Parse response
	var ideogramResp IdeogramResponse
	if err := json.Unmarshal(body, &ideogramResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Extract image URL
	if len(ideogramResp.Data) == 0 {
		return nil, fmt.Errorf("no images generated")
	}

	imageData := ideogramResp.Data[0]

	// Check if image is safe
	if !imageData.IsImageSafe {
		return nil, fmt.Errorf("generated image was flagged as unsafe")
	}

	return &GeneratedImageResult{
		URL:       imageData.URL,
		LocalPath: "",
		Prompt:    prompt,
		Cached:    false,
	}, nil
}

// GetProviderName returns the name of the image generation provider
func (g *IdeogramGenerator) GetProviderName() string {
	return "Ideogram AI"
}

// IsConfigured returns true if the provider is properly configured
func (g *IdeogramGenerator) IsConfigured() bool {
	return g.apiKey != ""
}

// buildEducationalPrompt creates a child-safe, educational prompt for Ideogram v3
func (g *IdeogramGenerator) buildEducationalPrompt(opts ImageGeneratorOptions) string {
	word := opts.Word

	prompt := fmt.Sprintf(
		"A simple image of '%s' with clear visual representation for children language learning. ",
		word,
	)

	return prompt
}

// sizeToAspectRatio converts size string to Ideogram aspect ratio
func (g *IdeogramGenerator) sizeToAspectRatio(size string) string {
	switch size {
	case "1024x1024":
		return "1x1"
	case "1792x1024":
		return "16:9"
	case "1024x1792":
		return "9:16"
	default:
		return "1x1"
	}
}
