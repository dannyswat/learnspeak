package handlers

import (
	"net/http"
	"strconv"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/services"

	"github.com/labstack/echo/v4"
)

type TopicHandler struct {
	topicService services.TopicService
}

func NewTopicHandler(topicService services.TopicService) *TopicHandler {
	return &TopicHandler{
		topicService: topicService,
	}
}

// CreateTopic handles POST /api/topics
func (h *TopicHandler) CreateTopic(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse request
	var req dto.CreateTopicRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return err
	}

	// Create topic
	topic, err := h.topicService.CreateTopic(&req, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusCreated, topic)
}

// GetTopic handles GET /api/topics/:id
func (h *TopicHandler) GetTopic(c echo.Context) error {
	// Parse ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid topic ID")
	}

	// Parse includeWords query param
	includeWords := c.QueryParam("includeWords") == "true"

	// Get topic
	topic, err := h.topicService.GetTopic(uint(id), includeWords)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, topic)
}

// UpdateTopic handles PUT /api/topics/:id
func (h *TopicHandler) UpdateTopic(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid topic ID")
	}

	// Parse request
	var req dto.UpdateTopicRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return err
	}

	// Update topic
	topic, err := h.topicService.UpdateTopic(uint(id), &req, userID)
	if err != nil {
		if err.Error() == "topic not found" {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, topic)
}

// DeleteTopic handles DELETE /api/topics/:id
func (h *TopicHandler) DeleteTopic(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid topic ID")
	}

	// Delete topic
	err = h.topicService.DeleteTopic(uint(id), userID)
	if err != nil {
		if err.Error() == "topic not found" {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

// ListTopics handles GET /api/topics
func (h *TopicHandler) ListTopics(c echo.Context) error {
	// Parse query parameters
	var params dto.TopicFilterParams
	if err := c.Bind(&params); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid query parameters")
	}

	// Get topics
	response, err := h.topicService.ListTopics(&params)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, response)
}

// ReorderWords handles PUT /api/topics/:id/words/reorder
func (h *TopicHandler) ReorderWords(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid topic ID")
	}

	// Parse request
	var req dto.ReorderTopicWordsRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return err
	}

	// Reorder words
	err = h.topicService.ReorderWords(uint(id), req.WordIDs, userID)
	if err != nil {
		if err.Error() == "topic not found" {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Words reordered successfully"})
}

// AddWordsToTopic adds words to an existing topic
// POST /api/v1/topics/:id/words
func (h *TopicHandler) AddWordsToTopic(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid topic ID")
	}

	// Parse request - reuse ReorderTopicWordsRequest since it has the same structure
	var req dto.ReorderTopicWordsRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return err
	}

	// Add words to topic
	err = h.topicService.AddWordsToTopic(uint(id), req.WordIDs, userID)
	if err != nil {
		if err.Error() == "topic not found" {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Words added successfully"})
}
