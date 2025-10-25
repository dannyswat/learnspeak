package handlers

import (
	"net/http"
	"strconv"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/services"

	"github.com/labstack/echo/v4"
)

type ConversationHandler struct {
	conversationService services.ConversationService
}

func NewConversationHandler(conversationService services.ConversationService) *ConversationHandler {
	return &ConversationHandler{
		conversationService: conversationService,
	}
}

// CreateConversation handles POST /api/conversations
func (h *ConversationHandler) CreateConversation(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse request
	var req dto.CreateConversationRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return err
	}

	// Create conversation
	conversation, err := h.conversationService.CreateConversation(&req, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusCreated, conversation)
}

// GetConversation handles GET /api/conversations/:id
func (h *ConversationHandler) GetConversation(c echo.Context) error {
	// Parse ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid conversation ID")
	}

	// Get conversation
	conversation, err := h.conversationService.GetConversation(uint(id))
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, conversation)
}

// UpdateConversation handles PUT /api/conversations/:id
func (h *ConversationHandler) UpdateConversation(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid conversation ID")
	}

	// Parse request
	var req dto.UpdateConversationRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return err
	}

	// Update conversation
	conversation, err := h.conversationService.UpdateConversation(uint(id), &req, userID)
	if err != nil {
		if err.Error() == "conversation not found" {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, conversation)
}

// DeleteConversation handles DELETE /api/conversations/:id
func (h *ConversationHandler) DeleteConversation(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid conversation ID")
	}

	// Delete conversation
	if err := h.conversationService.DeleteConversation(uint(id), userID); err != nil {
		if err.Error() == "conversation not found" {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusForbidden, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Conversation deleted successfully"})
}

// ListConversations handles GET /api/conversations
func (h *ConversationHandler) ListConversations(c echo.Context) error {
	// Parse filter params
	var params dto.ConversationFilterParams
	if err := c.Bind(&params); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid query parameters")
	}

	// Set defaults
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}

	// Get conversations
	result, err := h.conversationService.ListConversations(&params)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	// Calculate total pages
	totalPages := int(result.Total) / params.PageSize
	if int(result.Total)%params.PageSize > 0 {
		totalPages++
	}
	result.TotalPages = totalPages

	return c.JSON(http.StatusOK, result)
}

// GetConversationsByTopic handles GET /api/topics/:topicId/conversations
func (h *ConversationHandler) GetConversationsByTopic(c echo.Context) error {
	// Parse topic ID
	topicID, err := strconv.ParseUint(c.Param("topicId"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid topic ID")
	}

	// Get conversations
	conversations, err := h.conversationService.GetConversationsByTopic(uint(topicID))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, conversations)
}

// AddLineToConversation handles POST /api/conversations/:id/lines
func (h *ConversationHandler) AddLineToConversation(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse conversation ID
	conversationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid conversation ID")
	}

	// Parse request
	var req dto.CreateConversationLineRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return err
	}

	// Add line
	line, err := h.conversationService.AddLineToConversation(uint(conversationID), &req, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusCreated, line)
}

// UpdateLine handles PUT /api/conversations/:id/lines/:lineId
func (h *ConversationHandler) UpdateLine(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse conversation ID
	conversationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid conversation ID")
	}

	// Parse line ID
	lineID, err := strconv.ParseUint(c.Param("lineId"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid line ID")
	}

	// Parse request
	var req dto.UpdateConversationLineRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return err
	}

	// Update line
	line, err := h.conversationService.UpdateLine(uint(conversationID), uint(lineID), &req, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, line)
}

// DeleteLine handles DELETE /api/conversations/:id/lines/:lineId
func (h *ConversationHandler) DeleteLine(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse conversation ID
	conversationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid conversation ID")
	}

	// Parse line ID
	lineID, err := strconv.ParseUint(c.Param("lineId"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid line ID")
	}

	// Delete line
	if err := h.conversationService.DeleteLine(uint(conversationID), uint(lineID), userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Line deleted successfully"})
}

// ReorderLines handles PUT /api/conversations/:id/lines/reorder
func (h *ConversationHandler) ReorderLines(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "User ID not found in context")
	}

	// Parse conversation ID
	conversationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid conversation ID")
	}

	// Parse request
	var req dto.ReorderConversationLinesRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return err
	}

	// Reorder lines
	if err := h.conversationService.ReorderLines(uint(conversationID), req.LineIDs, userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Lines reordered successfully"})
}
