package handlers

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/services"
)

type JourneyHandler struct {
	journeyService services.JourneyService
}

func NewJourneyHandler(journeyService services.JourneyService) *JourneyHandler {
	return &JourneyHandler{
		journeyService: journeyService,
	}
}

// CreateJourney godoc
// @Summary Create a new journey
// @Description Create a new learning journey with topics
// @Tags journeys
// @Accept json
// @Produce json
// @Param journey body dto.CreateJourneyRequest true "Journey data"
// @Success 201 {object} dto.JourneyResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /journeys [post]
func (h *JourneyHandler) CreateJourney(c echo.Context) error {
	// Get user ID from context (set by auth middleware)
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Message: "User ID not found in context",
			Error:   "unauthorized",
		})
	}

	// Parse request body
	var req dto.CreateJourneyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid request body",
			Error:   err.Error(),
		})
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Validation failed",
			Error:   err.Error(),
		})
	}

	// Create journey
	journey, err := h.journeyService.CreateJourney(&req, userID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Failed to create journey",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, journey)
}

// GetJourney godoc
// @Summary Get a journey
// @Description Get journey by ID with optional topics
// @Tags journeys
// @Produce json
// @Param id path int true "Journey ID"
// @Param includeTopics query bool false "Include topics in response"
// @Success 200 {object} dto.JourneyResponse
// @Failure 404 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /journeys/{id} [get]
func (h *JourneyHandler) GetJourney(c echo.Context) error {
	// Parse journey ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid journey ID",
			Error:   err.Error(),
		})
	}

	// Check if topics should be included
	includeTopics := c.QueryParam("includeTopics") == "true"

	// Get journey
	journey, err := h.journeyService.GetJourney(uint(id), includeTopics)
	if err != nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Message: "Journey not found",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, journey)
}

// UpdateJourney godoc
// @Summary Update a journey
// @Description Update journey details and topics (creator only)
// @Tags journeys
// @Accept json
// @Produce json
// @Param id path int true "Journey ID"
// @Param journey body dto.UpdateJourneyRequest true "Journey data"
// @Success 200 {object} dto.JourneyResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /journeys/{id} [put]
func (h *JourneyHandler) UpdateJourney(c echo.Context) error {
	// Get user ID from context
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Message: "User ID not found in context",
			Error:   "unauthorized",
		})
	}

	// Parse journey ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid journey ID",
			Error:   err.Error(),
		})
	}

	// Parse request body
	var req dto.UpdateJourneyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid request body",
			Error:   err.Error(),
		})
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Validation failed",
			Error:   err.Error(),
		})
	}

	// Update journey
	journey, err := h.journeyService.UpdateJourney(uint(id), &req, userID)
	if err != nil {
		statusCode := http.StatusBadRequest

		return c.JSON(statusCode, dto.ErrorResponse{
			Message: "Failed to update journey",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, journey)
}

// DeleteJourney godoc
// @Summary Delete a journey
// @Description Delete a journey (creator only, not assigned to any users)
// @Tags journeys
// @Produce json
// @Param id path int true "Journey ID"
// @Success 200 {object} dto.MessageResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /journeys/{id} [delete]
func (h *JourneyHandler) DeleteJourney(c echo.Context) error {
	// Get user ID from context
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Message: "User ID not found in context",
			Error:   "unauthorized",
		})
	}

	// Parse journey ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid journey ID",
			Error:   err.Error(),
		})
	}

	// Delete journey
	if err := h.journeyService.DeleteJourney(uint(id), userID); err != nil {
		statusCode := http.StatusBadRequest
		if err.Error() == "record not found" {
			statusCode = http.StatusNotFound
		}
		return c.JSON(statusCode, dto.ErrorResponse{
			Message: "Failed to delete journey",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, dto.SuccessResponse{
		Success: true,
		Message: "Journey deleted successfully",
	})
}

// ListJourneys godoc
// @Summary List journeys
// @Description Get list of journeys with filtering and pagination
// @Tags journeys
// @Produce json
// @Param search query string false "Search in name and description"
// @Param languageCode query string false "Filter by language code"
// @Param createdBy query int false "Filter by creator user ID"
// @Param includeTopics query bool false "Include topics in response"
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Items per page (default: 20, max: 100)"
// @Success 200 {object} dto.JourneyListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /journeys [get]
func (h *JourneyHandler) ListJourneys(c echo.Context) error {
	// Parse filter parameters
	params := &dto.JourneyFilterParams{
		Search:        c.QueryParam("search"),
		LanguageCode:  c.QueryParam("languageCode"),
		IncludeTopics: c.QueryParam("includeTopics") == "true",
	}

	// Parse createdBy
	if createdByStr := c.QueryParam("createdBy"); createdByStr != "" {
		createdBy, err := strconv.ParseUint(createdByStr, 10, 32)
		if err == nil {
			createdByUint := uint(createdBy)
			params.CreatedBy = createdByUint
		}
	}

	// Parse page
	if pageStr := c.QueryParam("page"); pageStr != "" {
		page, err := strconv.Atoi(pageStr)
		if err == nil && page > 0 {
			params.Page = page
		}
	}

	// Parse page size
	if pageSizeStr := c.QueryParam("pageSize"); pageSizeStr != "" {
		pageSize, err := strconv.Atoi(pageSizeStr)
		if err == nil && pageSize > 0 {
			params.PageSize = pageSize
		}
	}

	// Get journeys
	journeys, err := h.journeyService.ListJourneys(params)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Failed to list journeys",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, journeys)
}

// ReorderTopics godoc
// @Summary Reorder topics in a journey
// @Description Update the sequence order of topics in a journey (creator only)
// @Tags journeys
// @Accept json
// @Produce json
// @Param id path int true "Journey ID"
// @Param topicIDs body []uint true "Ordered list of topic IDs"
// @Success 200 {object} dto.MessageResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /journeys/{id}/reorder [post]
func (h *JourneyHandler) ReorderTopics(c echo.Context) error {
	// Get user ID from context
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Message: "User ID not found in context",
			Error:   "unauthorized",
		})
	}

	// Parse journey ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid journey ID",
			Error:   err.Error(),
		})
	}

	// Parse request body (array of topic IDs)
	var topicIDs []uint
	if err := c.Bind(&topicIDs); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid request body",
			Error:   err.Error(),
		})
	}

	// Reorder topics
	if err := h.journeyService.ReorderTopics(uint(id), topicIDs, userID); err != nil {
		statusCode := http.StatusBadRequest
		return c.JSON(statusCode, dto.ErrorResponse{
			Message: "Failed to reorder topics",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, dto.SuccessResponse{
		Success: true,
		Message: "Topics reordered successfully",
	})
}

// AssignJourney godoc
// @Summary Assign journey to users
// @Description Assign a journey to one or more users (learners)
// @Tags journeys
// @Accept json
// @Produce json
// @Param id path int true "Journey ID"
// @Param assignment body dto.AssignJourneyRequest true "User IDs to assign"
// @Success 200 {object} dto.AssignJourneyResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /journeys/{id}/assign [post]
func (h *JourneyHandler) AssignJourney(c echo.Context) error {
	// Get user ID from context
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Message: "User ID not found in context",
			Error:   "unauthorized",
		})
	}

	// Parse journey ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid journey ID",
			Error:   err.Error(),
		})
	}

	// Parse request body
	var req dto.AssignJourneyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid request body",
			Error:   err.Error(),
		})
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Validation failed",
			Error:   err.Error(),
		})
	}

	// Assign journey
	response, err := h.journeyService.AssignJourney(uint(id), req.UserIDs, userID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Failed to assign journey",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, response)
}

// UnassignJourney godoc
// @Summary Unassign journey from users
// @Description Remove journey assignment from one or more users
// @Tags journeys
// @Accept json
// @Produce json
// @Param id path int true "Journey ID"
// @Param unassignment body dto.UnassignJourneyRequest true "User IDs to unassign"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /journeys/{id}/unassign [post]
func (h *JourneyHandler) UnassignJourney(c echo.Context) error {
	// Parse journey ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid journey ID",
			Error:   err.Error(),
		})
	}

	// Parse request body
	var req dto.UnassignJourneyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid request body",
			Error:   err.Error(),
		})
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Validation failed",
			Error:   err.Error(),
		})
	}

	// Unassign journey
	if err := h.journeyService.UnassignJourney(uint(id), req.UserIDs); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Failed to unassign journey",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, dto.SuccessResponse{
		Success: true,
		Message: "Journey unassigned successfully",
	})
}

// StartJourney godoc
// @Summary Start a journey
// @Description Mark a journey as in_progress for the current user
// @Tags journeys
// @Produce json
// @Param id path int true "Journey ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /journeys/{id}/start [post]
func (h *JourneyHandler) StartJourney(c echo.Context) error {
	// Get user ID from context
	userID, ok := c.Get("userId").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Message: "User ID not found in context",
			Error:   "unauthorized",
		})
	}

	// Parse journey ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid journey ID",
			Error:   err.Error(),
		})
	}

	// Start journey
	if err := h.journeyService.StartJourney(uint(id), userID); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Failed to start journey",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, dto.SuccessResponse{
		Success: true,
		Message: "Journey started successfully",
	})
}

// GetUserJourneys godoc
// @Summary Get journeys assigned to a user
// @Description Get all journeys assigned to a specific user
// @Tags journeys
// @Produce json
// @Param userId path int true "User ID"
// @Param status query string false "Filter by status (assigned, in_progress, completed)"
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Items per page (default: 20, max: 100)"
// @Success 200 {object} dto.UserJourneyListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /users/{userId}/journeys [get]
func (h *JourneyHandler) GetUserJourneys(c echo.Context) error {
	// Parse user ID
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid user ID",
			Error:   err.Error(),
		})
	}

	// Parse status filter
	var status *string
	if statusParam := c.QueryParam("status"); statusParam != "" {
		status = &statusParam
	}

	// Parse pagination
	page := 1
	pageSize := 20

	if pageStr := c.QueryParam("page"); pageStr != "" {
		p, err := strconv.Atoi(pageStr)
		if err == nil && p > 0 {
			page = p
		}
	}

	if pageSizeStr := c.QueryParam("pageSize"); pageSizeStr != "" {
		ps, err := strconv.Atoi(pageSizeStr)
		if err == nil && ps > 0 {
			pageSize = ps
		}
	}

	// Get user journeys
	journeys, err := h.journeyService.GetUserJourneys(uint(userID), status, page, pageSize)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Failed to get user journeys",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, journeys)
}

// GetJourneyAssignments godoc
// @Summary Get users assigned to a journey
// @Description Get all users assigned to a specific journey
// @Tags journeys
// @Produce json
// @Param id path int true "Journey ID"
// @Param status query string false "Filter by status (assigned, in_progress, completed)"
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Items per page (default: 20, max: 100)"
// @Success 200 {object} dto.UserJourneyListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /journeys/{id}/assignments [get]
func (h *JourneyHandler) GetJourneyAssignments(c echo.Context) error {
	// Parse journey ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid journey ID",
			Error:   err.Error(),
		})
	}

	// Parse status filter
	var status *string
	if statusParam := c.QueryParam("status"); statusParam != "" {
		status = &statusParam
	}

	// Parse pagination
	page := 1
	pageSize := 20

	if pageStr := c.QueryParam("page"); pageStr != "" {
		p, err := strconv.Atoi(pageStr)
		if err == nil && p > 0 {
			page = p
		}
	}

	if pageSizeStr := c.QueryParam("pageSize"); pageSizeStr != "" {
		ps, err := strconv.Atoi(pageSizeStr)
		if err == nil && ps > 0 {
			pageSize = ps
		}
	}

	// Get journey assignments
	assignments, err := h.journeyService.GetJourneyAssignments(uint(id), status, page, pageSize)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Failed to get journey assignments",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, assignments)
}
