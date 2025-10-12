package handlers

import (
	"dannyswat/learnspeak/database"
	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/models"
	"dannyswat/learnspeak/utils"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

var validate = validator.New()

// Register handles user registration
func Register(c echo.Context) error {
	var req dto.RegisterRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "bad_request",
			Message: "Invalid request body",
		})
	}

	// Validate request
	if err := validate.Struct(req); err != nil {
		validationErrors := make(map[string]string)
		for _, err := range err.(validator.ValidationErrors) {
			validationErrors[err.Field()] = err.Tag()
		}
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "validation_error",
			Message: "Validation failed",
			Details: validationErrors,
		})
	}

	// Check if username already exists
	var existingUser models.User
	if err := database.DB.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		return c.JSON(http.StatusConflict, dto.ErrorResponse{
			Error:   "conflict",
			Message: "Username already exists",
		})
	}

	// Check if email already exists
	if err := database.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return c.JSON(http.StatusConflict, dto.ErrorResponse{
			Error:   "conflict",
			Message: "Email already exists",
		})
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to process password",
		})
	}

	// Create user
	user := models.User{
		Username:     req.Username,
		PasswordHash: hashedPassword,
		Email:        req.Email,
		Name:         req.Name,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to create user",
		})
	}

	// Assign role (default to "learner" if not specified)
	roleName := req.Role
	if roleName == "" {
		roleName = "learner"
	}

	var role models.Role
	if err := database.DB.Where("name = ?", roleName).First(&role).Error; err == nil {
		database.DB.Model(&user).Association("Roles").Append(&role)
	}

	// Load user with roles
	database.DB.Preload("Roles").First(&user, user.ID)

	// Generate token
	token, err := utils.GenerateToken(&user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to generate token",
		})
	}

	// Prepare response
	roles := make([]string, len(user.Roles))
	for i, role := range user.Roles {
		roles[i] = role.Name
	}

	userSummary := dto.UserSummary{
		ID:            user.ID,
		Username:      user.Username,
		Email:         user.Email,
		Name:          user.Name,
		ProfilePicURL: user.ProfilePicURL,
		Roles:         roles,
	}

	return c.JSON(http.StatusCreated, dto.AuthResponse{
		Token: token,
		User:  userSummary,
	})
}

// Login handles user authentication
func Login(c echo.Context) error {
	var req dto.LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "bad_request",
			Message: "Invalid request body",
		})
	}

	// Validate request
	if err := validate.Struct(req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "validation_error",
			Message: "Validation failed",
		})
	}

	// Find user
	var user models.User
	if err := database.DB.Preload("Roles").Where("username = ?", req.Username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid credentials",
			})
		}
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "internal_error",
			Message: "Database error",
		})
	}

	// Check password
	if !utils.CheckPassword(user.PasswordHash, req.Password) {
		return c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "unauthorized",
			Message: "Invalid credentials",
		})
	}

	// Generate token
	token, err := utils.GenerateToken(&user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to generate token",
		})
	}

	// Prepare response
	roles := make([]string, len(user.Roles))
	for i, role := range user.Roles {
		roles[i] = role.Name
	}

	userSummary := dto.UserSummary{
		ID:            user.ID,
		Username:      user.Username,
		Email:         user.Email,
		Name:          user.Name,
		ProfilePicURL: user.ProfilePicURL,
		Roles:         roles,
	}

	return c.JSON(http.StatusOK, dto.AuthResponse{
		Token: token,
		User:  userSummary,
	})
}

// GetProfile returns the current user's profile
func GetProfile(c echo.Context) error {
	userId := c.Get("userId").(uint)

	var user models.User
	if err := database.DB.Preload("Roles").First(&user, userId).Error; err != nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "not_found",
			Message: "User not found",
		})
	}

	roles := make([]string, len(user.Roles))
	for i, role := range user.Roles {
		roles[i] = role.Name
	}

	userSummary := dto.UserSummary{
		ID:            user.ID,
		Username:      user.Username,
		Email:         user.Email,
		Name:          user.Name,
		ProfilePicURL: user.ProfilePicURL,
		Roles:         roles,
	}

	return c.JSON(http.StatusOK, userSummary)
}
