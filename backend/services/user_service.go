package services

import (
	"fmt"
	"math"

	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/models"
	"dannyswat/learnspeak/repositories"
)

type UserService interface {
	GetUser(id uint) (*dto.UserResponse, error)
	GetLearners(params *dto.UserFilterParams) (*dto.UserListResponse, error)
	GetTeachers(params *dto.UserFilterParams) (*dto.UserListResponse, error)
	SearchUsers(params *dto.UserFilterParams) (*dto.UserListResponse, error)
	UpdateUser(id uint, req *dto.UpdateUserRequest) (*dto.UserResponse, error)
}

type userService struct {
	userRepo repositories.UserRepository
}

func NewUserService(userRepo repositories.UserRepository) UserService {
	return &userService{
		userRepo: userRepo,
	}
}

// GetUser retrieves a user by ID
func (s *userService) GetUser(id uint) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	return s.toUserResponse(user), nil
}

// GetLearners retrieves all learners with pagination
func (s *userService) GetLearners(params *dto.UserFilterParams) (*dto.UserListResponse, error) {
	// Set defaults
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}
	if params.PageSize > 100 {
		params.PageSize = 100
	}

	// If search is provided, use search function with role filter
	if params.Search != "" {
		role := "learner"
		return s.searchWithRole(params.Search, &role, params.Page, params.PageSize)
	}

	// Otherwise use GetLearners
	users, total, err := s.userRepo.GetLearners(params.Page, params.PageSize)
	if err != nil {
		return nil, err
	}

	return s.buildUserListResponse(users, total, params.Page, params.PageSize), nil
}

// GetTeachers retrieves all teachers with pagination
func (s *userService) GetTeachers(params *dto.UserFilterParams) (*dto.UserListResponse, error) {
	// Set defaults
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}
	if params.PageSize > 100 {
		params.PageSize = 100
	}

	// If search is provided, use search function with role filter
	if params.Search != "" {
		role := "teacher"
		return s.searchWithRole(params.Search, &role, params.Page, params.PageSize)
	}

	// Otherwise use GetTeachers
	users, total, err := s.userRepo.GetTeachers(params.Page, params.PageSize)
	if err != nil {
		return nil, err
	}

	return s.buildUserListResponse(users, total, params.Page, params.PageSize), nil
}

// SearchUsers searches users by name or username
func (s *userService) SearchUsers(params *dto.UserFilterParams) (*dto.UserListResponse, error) {
	// Set defaults
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}
	if params.PageSize > 100 {
		params.PageSize = 100
	}

	return s.searchWithRole(params.Search, params.Role, params.Page, params.PageSize)
}

// searchWithRole is a helper function for searching with optional role filter
func (s *userService) searchWithRole(query string, role *string, page, pageSize int) (*dto.UserListResponse, error) {
	users, total, err := s.userRepo.Search(query, role, page, pageSize)
	if err != nil {
		return nil, err
	}

	return s.buildUserListResponse(users, total, page, pageSize), nil
}

// UpdateUser updates a user's information
func (s *userService) UpdateUser(id uint, req *dto.UpdateUserRequest) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Email != nil {
		user.Email = *req.Email
	}
	if req.ProfilePicURL != nil {
		user.ProfilePicURL = req.ProfilePicURL
	}

	// Save updates
	if err := s.userRepo.Update(user); err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return s.toUserResponse(user), nil
}

// toUserResponse converts a user model to response DTO
func (s *userService) toUserResponse(user *models.User) *dto.UserResponse {
	roles := make([]string, len(user.Roles))
	for i, role := range user.Roles {
		roles[i] = role.Name
	}

	return &dto.UserResponse{
		ID:            user.ID,
		Username:      user.Username,
		Name:          user.Name,
		Email:         user.Email,
		ProfilePicURL: user.ProfilePicURL,
		Roles:         roles,
		CreatedAt:     user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// buildUserListResponse builds a paginated user list response
func (s *userService) buildUserListResponse(users []models.User, total int64, page, pageSize int) *dto.UserListResponse {
	userResponses := make([]dto.UserResponse, len(users))
	for i, user := range users {
		userResponses[i] = *s.toUserResponse(&user)
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &dto.UserListResponse{
		Users:      userResponses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}
