package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"dannyswat/learnspeak/config"
)

// IdeogramGenerator implements ImageGenerator using Ideogram API
type IdeogramGenerator struct {
	apiKey   string
	endpoint string
}

// IdeogramRequest represents a request to Ideogram API
type IdeogramRequest struct {
	ImageRequest IdeogramImageRequest `json:"image_request"`
}

// IdeogramImageRequest contains the image generation parameters
type IdeogramImageRequest struct {
	Prompt            string `json:"prompt"`
	AspectRatio       string `json:"aspect_ratio,omitempty"`        // "ASPECT_1_1", "ASPECT_16_9", "ASPECT_9_16"
	Model             string `json:"model,omitempty"`               // "V_2", "V_2_TURBO"
	MagicPromptOption string `json:"magic_prompt_option,omitempty"` // "AUTO", "ON", "OFF"
	StyleType         string `json:"style_type,omitempty"`          // "GENERAL", "REALISTIC", "DESIGN", "RENDER_3D", "ANIME"
	NegativePrompt    string `json:"negative_prompt,omitempty"`
}

// IdeogramResponse represents the response from Ideogram API
type IdeogramResponse struct {
	Created int64           `json:"created"`
	Data    []IdeogramImage `json:"data"`
}

// IdeogramImage represents a single generated image
type IdeogramImage struct {
	URL         string `json:"url"`
	Prompt      string `json:"prompt"`
	Resolution  string `json:"resolution"`
	IsImageSafe bool   `json:"is_image_safe"`
}

// NewIdeogramGenerator creates a new Ideogram image generator
func NewIdeogramGenerator() (*IdeogramGenerator, error) {
	cfg := config.AppConfig

	// Check if Ideogram is configured
	if cfg.IdeogramAPIKey == "" {
		log.Println("Warning: Ideogram API key not configured")
		return &IdeogramGenerator{
			apiKey:   "",
			endpoint: "https://api.ideogram.ai/generate",
		}, nil
	}

	return &IdeogramGenerator{
		apiKey:   cfg.IdeogramAPIKey,
		endpoint: "https://api.ideogram.ai/generate",
	}, nil
}

// GenerateImage generates an educational image using Ideogram API
func (g *IdeogramGenerator) GenerateImage(ctx context.Context, opts ImageGeneratorOptions) (*GeneratedImageResult, error) {
	// Check if API key is configured
	if g.apiKey == "" {
		return nil, fmt.Errorf("Ideogram API is not configured. Please add IDEOGRAM_API_KEY to your .env file")
	}

	// Build educational prompt
	prompt := g.buildEducationalPrompt(opts)

	// Convert size to aspect ratio
	aspectRatio := g.sizeToAspectRatio(opts.Size)

	// Prepare request
	reqBody := IdeogramRequest{
		ImageRequest: IdeogramImageRequest{
			Prompt:            prompt,
			AspectRatio:       aspectRatio,
			Model:             "V_2",
			MagicPromptOption: "AUTO",
			StyleType:         "DESIGN", // Use design style for educational illustrations
			NegativePrompt:    "violence, scary, dark, inappropriate, adult content",
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request with timeout
	ctxWithTimeout, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctxWithTimeout, "POST", g.endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
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

// buildEducationalPrompt creates a child-safe, educational prompt
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
		return "ASPECT_1_1"
	case "1792x1024":
		return "ASPECT_16_9"
	case "1024x1792":
		return "ASPECT_9_16"
	default:
		return "ASPECT_1_1"
	}
}
