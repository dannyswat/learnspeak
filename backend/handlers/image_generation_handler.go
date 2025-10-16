package handlers

import (
	"fmt"
	"net/http"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/services"

	"github.com/labstack/echo/v4"
)

type ImageGenerationHandler struct {
	service *services.ImageGenerationService
}

type GenerateImageRequest struct {
	Word        string `json:"word" validate:"required"`
	Translation string `json:"translation"`
	Size        string `json:"size"`    // "1024x1024", "1792x1024", "1024x1792"
	Quality     string `json:"quality"` // "standard" or "hd"
	Style       string `json:"style"`   // "vivid" or "natural"
}

type GenerateImageResponse struct {
	URL       string `json:"url"`
	LocalPath string `json:"local_path"`
	Prompt    string `json:"prompt"`
	Cached    bool   `json:"cached"`
}

type BatchGenerateImageRequest struct {
	Words []GenerateImageRequest `json:"words" validate:"required,dive,required"`
}

type BatchGenerateImageResponse struct {
	Images []BatchGenerateResult `json:"images"`
}

type BatchGenerateResult struct {
	Word  string                 `json:"word"`
	Image *GenerateImageResponse `json:"image,omitempty"`
	Error string                 `json:"error,omitempty"`
}

func NewImageGenerationHandler(service *services.ImageGenerationService) *ImageGenerationHandler {
	return &ImageGenerationHandler{
		service: service,
	}
}

// GenerateImage handles POST /api/v1/images/generate
// @Summary Generate an educational image for a word using AI
// @Description Generate a child-safe educational image using Azure OpenAI DALL-E 3
// @Tags images
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body GenerateImageRequest true "Image generation request"
// @Success 200 {object} GenerateImageResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/images/generate [post]
func (h *ImageGenerationHandler) GenerateImage(c echo.Context) error {
	var req GenerateImageRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request body",
		})
	}

	if err := c.Validate(req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: fmt.Sprintf("Validation error: %v", err),
		})
	}

	// Generate image
	result, err := h.service.GenerateImage(c.Request().Context(), services.ImageGenerationOptions{
		Word:        req.Word,
		Translation: req.Translation,
		Size:        req.Size,
		Quality:     req.Quality,
		Style:       req.Style,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: fmt.Sprintf("Failed to generate image: %v", err),
		})
	}

	return c.JSON(http.StatusOK, GenerateImageResponse{
		URL:       result.URL,
		LocalPath: result.LocalPath,
		Prompt:    result.Prompt,
		Cached:    result.Cached,
	})
}

// BatchGenerateImages handles POST /api/v1/images/generate/batch
// @Summary Generate multiple images in batch
// @Description Generate child-safe educational images for multiple words using Azure OpenAI DALL-E 3
// @Tags images
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body BatchGenerateImageRequest true "Batch image generation request"
// @Success 200 {object} BatchGenerateImageResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/images/generate/batch [post]
func (h *ImageGenerationHandler) BatchGenerateImages(c echo.Context) error {
	var req BatchGenerateImageRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request body",
		})
	}

	if err := c.Validate(req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: fmt.Sprintf("Validation error: %v", err),
		})
	}

	// Validate batch size
	if len(req.Words) == 0 {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "At least one word is required",
		})
	}

	if len(req.Words) > 20 {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Maximum 20 words per batch request",
		})
	}

	// Generate images for each word
	results := make([]BatchGenerateResult, len(req.Words))
	for i, wordReq := range req.Words {
		result := BatchGenerateResult{
			Word: wordReq.Word,
		}

		// Generate image
		img, err := h.service.GenerateImage(c.Request().Context(), services.ImageGenerationOptions{
			Word:        wordReq.Word,
			Translation: wordReq.Translation,
			Size:        wordReq.Size,
			Quality:     wordReq.Quality,
			Style:       wordReq.Style,
		})

		if err != nil {
			result.Error = err.Error()
		} else {
			result.Image = &GenerateImageResponse{
				URL:       img.URL,
				LocalPath: img.LocalPath,
				Prompt:    img.Prompt,
				Cached:    img.Cached,
			}
		}

		results[i] = result
	}

	return c.JSON(http.StatusOK, BatchGenerateImageResponse{
		Images: results,
	})
}

// GetCacheStats handles GET /api/v1/images/cache/stats
// @Summary Get image cache statistics
// @Description Get statistics about the image cache (file count and size)
// @Tags images
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/images/cache/stats [get]
func (h *ImageGenerationHandler) GetCacheStats(c echo.Context) error {
	fileCount, totalSize, err := h.service.GetCacheStats()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: fmt.Sprintf("Failed to get cache stats: %v", err),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"file_count": fileCount,
		"total_size": totalSize,
		"size_mb":    float64(totalSize) / (1024 * 1024),
	})
}

// ClearCache handles DELETE /api/v1/images/cache
// @Summary Clear image cache
// @Description Delete all cached images (admin only)
// @Tags images
// @Security BearerAuth
// @Success 200 {object} dto.SuccessResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/images/cache [delete]
func (h *ImageGenerationHandler) ClearCache(c echo.Context) error {
	if err := h.service.ClearCache(); err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: fmt.Sprintf("Failed to clear cache: %v", err),
		})
	}

	return c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Cache cleared successfully",
	})
}
