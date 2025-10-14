package handlers

import (
	"net/http"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/services"

	"github.com/labstack/echo/v4"
)

type TranslationHandler struct {
	translationService *services.TranslationService
}

func NewTranslationHandler(translationService *services.TranslationService) *TranslationHandler {
	return &TranslationHandler{
		translationService: translationService,
	}
}

// Translate translates a single text
// POST /api/v1/translate
func (h *TranslationHandler) Translate(c echo.Context) error {
	var req services.TranslateRequest
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

	// Translate
	result, err := h.translationService.Translate(&req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to translate: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}

// BatchTranslate translates multiple texts
// POST /api/v1/translate/batch
func (h *TranslationHandler) BatchTranslate(c echo.Context) error {
	var req services.BatchTranslateRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request body",
		})
	}

	// Validate required fields
	if len(req.Texts) == 0 {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "At least one text is required",
		})
	}

	// Translate batch
	result, err := h.translationService.BatchTranslate(&req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to translate batch: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}
