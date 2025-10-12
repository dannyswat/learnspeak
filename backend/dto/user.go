package dto

// UserResponse represents a user in responses
type UserResponse struct {
	ID            uint     `json:"id"`
	Username      string   `json:"username"`
	Name          string   `json:"name"`
	Email         string   `json:"email"`
	ProfilePicURL *string  `json:"profilePicUrl,omitempty"`
	Roles         []string `json:"roles"`
	CreatedAt     string   `json:"createdAt"`
}

// UserListResponse represents paginated user list
type UserListResponse struct {
	Users      []UserResponse `json:"users"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	PageSize   int            `json:"pageSize"`
	TotalPages int            `json:"totalPages"`
}

// UserFilterParams represents query parameters for filtering users
type UserFilterParams struct {
	Search   string  `query:"search"`
	Role     *string `query:"role"`
	Page     int     `query:"page"`
	PageSize int     `query:"pageSize"`
}

// UpdateUserRequest represents the request to update user information
type UpdateUserRequest struct {
	Name          *string `json:"name" validate:"omitempty,min=1,max=100"`
	Email         *string `json:"email" validate:"omitempty,email"`
	ProfilePicURL *string `json:"profilePicUrl" validate:"omitempty,url,max=500"`
}
