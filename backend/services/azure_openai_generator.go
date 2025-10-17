package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"dannyswat/learnspeak/config"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/azure"
)

// AzureOpenAIGenerator implements ImageGenerator using Azure OpenAI DALL-E 3
type AzureOpenAIGenerator struct {
	client     *openai.Client
	configured bool
}

// NewAzureOpenAIGenerator creates a new Azure OpenAI image generator
func NewAzureOpenAIGenerator() (*AzureOpenAIGenerator, error) {
	cfg := config.AppConfig

	// Check if Azure OpenAI is configured
	if cfg.AzureOpenAIKey == "" || cfg.AzureOpenAIEndpoint == "" {
		log.Println("Warning: Azure OpenAI credentials not configured")
		return &AzureOpenAIGenerator{
			client:     nil,
			configured: false,
		}, nil
	}

	// Create Azure OpenAI client using openai-go v3
	// For Azure, the endpoint format should be: https://<resource>.openai.azure.com
	client := openai.NewClient(
		azure.WithEndpoint(cfg.AzureOpenAIEndpoint, "2024-02-01"),
		azure.WithAPIKey(cfg.AzureOpenAIKey),
	)

	return &AzureOpenAIGenerator{
		client:     &client,
		configured: true,
	}, nil
}

// GenerateImage generates an educational image using Azure OpenAI DALL-E 3
func (g *AzureOpenAIGenerator) GenerateImage(ctx context.Context, opts ImageGeneratorOptions) (*GeneratedImageResult, error) {
	// Check if client is configured
	if g.client == nil {
		return nil, fmt.Errorf("Azure OpenAI is not configured. Please add AZURE_OPENAI_KEY and AZURE_OPENAI_ENDPOINT to your .env file")
	}

	cfg := config.AppConfig

	// Build educational prompt
	prompt := g.buildEducationalPrompt(opts)

	// Set defaults
	size := opts.Size
	if size == "" {
		size = "1024x1024"
	}

	quality := opts.Quality
	if quality == "" {
		quality = "standard"
	}

	style := opts.Style
	if style == "" {
		style = "vivid"
	}

	// Prepare request with timeout
	ctxWithTimeout, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	// Call Azure OpenAI using DALL-E 3
	// Using the simpler v3 API
	params := openai.ImageGenerateParams{
		Prompt: prompt,
		Model:  openai.ImageModel(cfg.AzureOpenAIDeployment),
	}

	// Set size
	switch size {
	case "1792x1024":
		params.Size = openai.ImageGenerateParamsSize1792x1024
	case "1024x1792":
		params.Size = openai.ImageGenerateParamsSize1024x1792
	default:
		params.Size = openai.ImageGenerateParamsSize1024x1024
	}

	// Set quality
	if quality == "hd" {
		params.Quality = openai.ImageGenerateParamsQualityHD
	} else {
		params.Quality = openai.ImageGenerateParamsQualityStandard
	}

	// Set style
	if style == "natural" {
		params.Style = openai.ImageGenerateParamsStyleNatural
	} else {
		params.Style = openai.ImageGenerateParamsStyleVivid
	}

	params.ResponseFormat = openai.ImageGenerateParamsResponseFormatURL

	resp, err := g.client.Images.Generate(ctxWithTimeout, params)

	if err != nil {
		return nil, fmt.Errorf("Azure OpenAI API error: %w", err)
	}

	// Extract image URL
	if len(resp.Data) == 0 {
		return nil, fmt.Errorf("no images generated")
	}

	imageURL := resp.Data[0].URL
	if imageURL == "" {
		return nil, fmt.Errorf("empty image URL returned")
	}

	return &GeneratedImageResult{
		URL:       imageURL,
		LocalPath: "",
		Prompt:    prompt,
		Cached:    false,
	}, nil
}

// GetProviderName returns the name of the image generation provider
func (g *AzureOpenAIGenerator) GetProviderName() string {
	return "Azure OpenAI DALL-E 3"
}

// IsConfigured returns true if the provider is properly configured
func (g *AzureOpenAIGenerator) IsConfigured() bool {
	return g.configured
}

// buildEducationalPrompt creates a child-safe, educational prompt
func (g *AzureOpenAIGenerator) buildEducationalPrompt(opts ImageGeneratorOptions) string {
	word := opts.Word

	// Base template for educational images
	prompt := fmt.Sprintf(
		"A simple image of '%s' with clear visual representation for children language learning. ",
		word,
	)

	return prompt
}
