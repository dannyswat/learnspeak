package repositories

import (
	"dannyswat/learnspeak/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	// GetByID retrieves a user by ID
	GetByID(id uint) (*models.User, error)

	// GetByUsername retrieves a user by username
	GetByUsername(username string) (*models.User, error)

	// GetByEmail retrieves a user by email
	GetByEmail(email string) (*models.User, error)

	// GetByRole retrieves users with a specific role
	GetByRole(roleName string, page, pageSize int) ([]models.User, int64, error)

	// GetLearners retrieves all users with the learner role
	GetLearners(page, pageSize int) ([]models.User, int64, error)

	// GetTeachers retrieves all users with the teacher role
	GetTeachers(page, pageSize int) ([]models.User, int64, error)

	// Search searches users by name or username
	Search(query string, roleName *string, page, pageSize int) ([]models.User, int64, error)

	// Update updates a user's information
	Update(user *models.User) error

	// Delete soft deletes a user
	Delete(user *models.User) error

	// Create creates a new user
	Create(user *models.User) error

	// GetRoleByName retrieves a role by name
	GetRoleByName(name string) (*models.Role, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

// GetByID retrieves a user by ID with roles preloaded
func (r *userRepository) GetByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Roles").First(&user, id).Error
	return &user, err
}

// GetByUsername retrieves a user by username with roles preloaded
func (r *userRepository) GetByUsername(username string) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Roles").Where("username = ?", username).First(&user).Error
	return &user, err
}

// GetByRole retrieves users with a specific role
func (r *userRepository) GetByRole(roleName string, page, pageSize int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	// Build query with role filter
	query := r.db.Model(&models.User{}).
		Joins("JOIN user_roles ON user_roles.user_id = users.id").
		Joins("JOIN roles ON roles.id = user_roles.role_id").
		Where("roles.name = ?", roleName).
		Preload("Roles")

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("users.name").Find(&users).Error

	return users, total, err
}

// GetLearners retrieves all users with the learner role
func (r *userRepository) GetLearners(page, pageSize int) ([]models.User, int64, error) {
	return r.GetByRole("learner", page, pageSize)
}

// GetTeachers retrieves all users with the teacher role
func (r *userRepository) GetTeachers(page, pageSize int) ([]models.User, int64, error) {
	return r.GetByRole("teacher", page, pageSize)
}

// Search searches users by name or username with optional role filter
func (r *userRepository) Search(query string, roleName *string, page, pageSize int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	// Build base query
	db := r.db.Model(&models.User{}).Preload("Roles")

	// Add search conditions
	if query != "" {
		searchPattern := "%" + query + "%"
		db = db.Where("name ILIKE ? OR username ILIKE ?", searchPattern, searchPattern)
	}

	// Add role filter if provided
	if roleName != nil && *roleName != "" {
		db = db.Joins("JOIN user_roles ON user_roles.user_id = users.id").
			Joins("JOIN roles ON roles.id = user_roles.role_id").
			Where("roles.name = ?", *roleName)
	}

	// Count total
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * pageSize
	err := db.Offset(offset).Limit(pageSize).Order("users.name").Find(&users).Error

	return users, total, err
}

// Update updates a user's information
func (r *userRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// Delete soft deletes a user
func (r *userRepository) Delete(user *models.User) error {
	return r.db.Delete(user).Error
}

// GetByEmail retrieves a user by email with roles preloaded
func (r *userRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Roles").Where("email = ?", email).First(&user).Error
	return &user, err
}

// Create creates a new user with associated roles
func (r *userRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// GetRoleByName retrieves a role by name
func (r *userRepository) GetRoleByName(name string) (*models.Role, error) {
	var role models.Role
	err := r.db.Where("name = ?", name).First(&role).Error
	return &role, err
}
