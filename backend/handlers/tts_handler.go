package handlers

import (
	"net/http"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/services"

	"github.com/labstack/echo/v4"
)

type TTSHandler struct {
	ttsService *services.TTSService
}

func NewTTSHandler(ttsService *services.TTSService) *TTSHandler {
	return &TTSHandler{
		ttsService: ttsService,
	}
}

// GenerateTTS generates audio from text using Azure TTS
// POST /api/tts/generate
func (h *TTSHandler) GenerateTTS(c echo.Context) error {
	var req services.TTSRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request body",
		})
	}

	// Validate required fields
	if req.Text == "" {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Text is required",
		})
	}

	// Default to Cantonese if no language specified
	if req.Language == "" {
		req.Language = "zh-HK"
	}

	// Generate audio
	response, err := h.ttsService.GenerateAudio(&req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to generate audio: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, response)
}

// DeleteCachedAudio deletes a specific cached audio file
// DELETE /api/tts/cache
func (h *TTSHandler) DeleteCachedAudio(c echo.Context) error {
	audioURL := c.QueryParam("url")
	if audioURL == "" {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Audio URL is required",
		})
	}

	// Delete the cached audio file
	if err := h.ttsService.DeleteCachedAudio(audioURL); err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to delete cached audio: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Cached audio deleted successfully",
	})
}
