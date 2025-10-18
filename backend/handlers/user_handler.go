package handlers

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/services"
)

type UserHandler struct {
	userService services.UserService
}

func NewUserHandler(userService services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// GetUser godoc
// @Summary Get a user by ID
// @Description Get user details by ID
// @Tags users
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} dto.UserResponse
// @Failure 404 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /users/{id} [get]
func (h *UserHandler) GetUser(c echo.Context) error {
	// Parse user ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid user ID",
			Error:   err.Error(),
		})
	}

	// Get user
	user, err := h.userService.GetUser(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Message: "User not found",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, user)
}

// GetLearners godoc
// @Summary Get list of learners
// @Description Get all users with learner role
// @Tags users
// @Produce json
// @Param search query string false "Search by name or username"
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Items per page (default: 20, max: 100)"
// @Success 200 {object} dto.UserListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /users/learners [get]
func (h *UserHandler) GetLearners(c echo.Context) error {
	params := &dto.UserFilterParams{
		Search: c.QueryParam("search"),
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

	// Get learners
	learners, err := h.userService.GetLearners(params)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Failed to get learners",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, learners)
}

// GetTeachers godoc
// @Summary Get list of teachers
// @Description Get all users with teacher role
// @Tags users
// @Produce json
// @Param search query string false "Search by name or username"
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Items per page (default: 20, max: 100)"
// @Success 200 {object} dto.UserListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /users/teachers [get]
func (h *UserHandler) GetTeachers(c echo.Context) error {
	params := &dto.UserFilterParams{
		Search: c.QueryParam("search"),
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

	// Get teachers
	teachers, err := h.userService.GetTeachers(params)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Failed to get teachers",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, teachers)
}

// SearchUsers godoc
// @Summary Search users
// @Description Search users by name or username with optional role filter
// @Tags users
// @Produce json
// @Param search query string false "Search by name or username"
// @Param role query string false "Filter by role (learner, teacher, admin)"
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Items per page (default: 20, max: 100)"
// @Success 200 {object} dto.UserListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /users [get]
func (h *UserHandler) SearchUsers(c echo.Context) error {
	params := &dto.UserFilterParams{
		Search: c.QueryParam("search"),
	}

	// Parse role filter
	if role := c.QueryParam("role"); role != "" {
		params.Role = &role
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

	// Search users
	users, err := h.userService.SearchUsers(params)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Failed to search users",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, users)
}

// UpdateUser godoc
// @Summary Update user information
// @Description Update user profile information
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param user body dto.UpdateUserRequest true "User data"
// @Success 200 {object} dto.UserResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /users/{id} [put]
func (h *UserHandler) UpdateUser(c echo.Context) error {
	// Get current user ID from context
	currentUserID, ok := c.Get("userId").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Message: "User ID not found in context",
			Error:   "unauthorized",
		})
	}

	// Parse target user ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid user ID",
			Error:   err.Error(),
		})
	}

	// Check if user is updating their own profile
	// TODO: Add admin role check to allow admins to update any user
	if currentUserID != uint(id) {
		return c.JSON(http.StatusForbidden, dto.ErrorResponse{
			Message: "You can only update your own profile",
			Error:   "forbidden",
		})
	}

	// Parse request body
	var req dto.UpdateUserRequest
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

	// Update user
	user, err := h.userService.UpdateUser(uint(id), &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Failed to update user",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, user)
}

// DeleteUser godoc
// @Summary Delete a user (Admin only)
// @Description Soft delete a user by ID
// @Tags users
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /admin/users/{id} [delete]
func (h *UserHandler) DeleteUser(c echo.Context) error {
	// Parse user ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid user ID",
			Error:   err.Error(),
		})
	}

	// Prevent deleting yourself
	currentUserID := c.Get("user_id").(uint)
	if uint(id) == currentUserID {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Cannot delete your own account",
		})
	}

	// Delete user
	if err := h.userService.DeleteUser(uint(id)); err != nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Message: "Failed to delete user",
			Error:   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "User deleted successfully",
	})
}
