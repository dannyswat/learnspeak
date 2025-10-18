package dto

// RegisterRequest represents user registration data
type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Password string `json:"password" validate:"required,min=6"`
	Email    string `json:"email" validate:"required,email"`
	Name     string `json:"name" validate:"required,min=1,max=100"`
	Role     string `json:"role" validate:"omitempty,oneof=learner teacher admin"`
}

// LoginRequest represents user login credentials
type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// AuthResponse represents authentication response with token
type AuthResponse struct {
	Token string      `json:"token"`
	User  UserSummary `json:"user"`
}

// UserSummary represents a simplified user object
type UserSummary struct {
	ID            uint     `json:"id"`
	Username      string   `json:"username"`
	Email         string   `json:"email"`
	Name          string   `json:"name"`
	ProfilePicURL *string  `json:"profilePicUrl"`
	Roles         []string `json:"roles"`
}

// ChangePasswordRequest represents password change data
type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" validate:"required,min=6"`
	NewPassword     string `json:"newPassword" validate:"required,min=6"`
}
