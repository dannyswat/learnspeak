package handlers

import (
	"net/http"

	"dannyswat/learnspeak/services"

	"github.com/labstack/echo/v4"
)

type LanguageHandler struct {
	languageService services.LanguageService
}

func NewLanguageHandler(languageService services.LanguageService) *LanguageHandler {
	return &LanguageHandler{
		languageService: languageService,
	}
}

// GetLanguages handles GET /api/languages
// @Summary Get all active languages
// @Description Get a list of all active languages
// @Tags languages
// @Produce json
// @Success 200 {array} models.Language
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/languages [get]
func (h *LanguageHandler) GetLanguages(c echo.Context) error {
	languages, err := h.languageService.GetAllLanguages()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch languages")
	}

	return c.JSON(http.StatusOK, languages)
}
