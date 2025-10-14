package handlers

import (
	"net/http"
	"strconv"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/services"

	"github.com/labstack/echo/v4"
)

type WordHandler struct {
	wordService services.WordService
}

func NewWordHandler(wordService services.WordService) *WordHandler {
	return &WordHandler{
		wordService: wordService,
	}
}

// CreateWord handles POST /api/words
// @Summary Create a new word
// @Description Create a new word with translations
// @Tags words
// @Accept json
// @Produce json
// @Param request body dto.CreateWordRequest true "Word creation request"
// @Success 201 {object} dto.WordResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/words [post]
func (h *WordHandler) CreateWord(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse request
	var req dto.CreateWordRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return err
	}

	// Create word
	word, err := h.wordService.CreateWord(&req, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusCreated, word)
}

// GetWord handles GET /api/words/:id
// @Summary Get a word by ID
// @Description Get a word by ID with translations
// @Tags words
// @Produce json
// @Param id path int true "Word ID"
// @Success 200 {object} dto.WordResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /api/words/{id} [get]
func (h *WordHandler) GetWord(c echo.Context) error {
	// Parse ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid word ID")
	}

	// Get word
	word, err := h.wordService.GetWord(uint(id))
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, word)
}

// UpdateWord handles PUT /api/words/:id
// @Summary Update a word
// @Description Update a word and its translations
// @Tags words
// @Accept json
// @Produce json
// @Param id path int true "Word ID"
// @Param request body dto.UpdateWordRequest true "Word update request"
// @Success 200 {object} dto.WordResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /api/words/{id} [put]
func (h *WordHandler) UpdateWord(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid word ID")
	}

	// Parse request
	var req dto.UpdateWordRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return err
	}

	// Update word
	word, err := h.wordService.UpdateWord(uint(id), &req, userID)
	if err != nil {
		if err.Error() == "word not found" {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, word)
}

// DeleteWord handles DELETE /api/words/:id
// @Summary Delete a word
// @Description Delete a word and its translations
// @Tags words
// @Produce json
// @Param id path int true "Word ID"
// @Success 204 "No Content"
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /api/words/{id} [delete]
func (h *WordHandler) DeleteWord(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid word ID")
	}

	// Delete word
	err = h.wordService.DeleteWord(uint(id), userID)
	if err != nil {
		if err.Error() == "word not found" {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

// ListWords handles GET /api/words
// @Summary List words
// @Description List words with filtering and pagination
// @Tags words
// @Produce json
// @Param search query string false "Search term"
// @Param languageId query int false "Filter by language ID"
// @Param createdBy query int false "Filter by creator user ID"
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Page size (default: 10, max: 100)"
// @Success 200 {object} dto.WordListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /api/words [get]
func (h *WordHandler) ListWords(c echo.Context) error {
	// Parse query parameters
	var params dto.WordFilterParams
	if err := c.Bind(&params); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid query parameters")
	}

	// Get words
	words, err := h.wordService.ListWords(&params)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, words)
}
