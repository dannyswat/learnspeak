package database

import (
	"dannyswat/learnspeak/models"
	"dannyswat/learnspeak/utils"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
)

// Migrate runs database migrations
func Migrate() error {
	log.Println("Running database migrations...")

	// Use GORM AutoMigrate for all models
	log.Println("Creating/updating database schema...")
	err := DB.AutoMigrate(
		// Core models
		&models.User{},
		&models.Role{},
		&models.UserRole{},

		// Content models
		&models.Language{},
		&models.Word{},
		&models.WordTranslation{},
		&models.Topic{},
		&models.TopicWord{},
		&models.Journey{},
		&models.JourneyTopic{},
		&models.JourneyInvitation{},
		&models.QuizQuestion{},

		// Conversation models
		&models.Conversation{},
		&models.ConversationLine{},
		&models.TopicConversation{},

		// User progress models
		&models.UserJourney{},
		&models.UserProgress{},
		&models.UserBookmark{},
	)
	if err != nil {
		return fmt.Errorf("failed to auto-migrate models: %w", err)
	}

	// Seed essential data
	log.Println("Seeding essential data (roles, languages)...")
	if err := seedEssentialData(); err != nil {
		return fmt.Errorf("failed to seed essential data: %w", err)
	}

	// Run SQL migrations for functions, triggers, and views
	log.Println("Running SQL migrations (functions, triggers, views)...")
	if err := runSQLMigrations(); err != nil {
		return fmt.Errorf("failed to run SQL migrations: %w", err)
	}

	log.Println("Migrations completed successfully")
	return nil
}

// seedEssentialData seeds roles and languages using GORM
func seedEssentialData() error {
	// Seed roles
	roles := []models.Role{
		{Name: "learner", Description: "Student learning languages"},
		{Name: "teacher", Description: "Teacher managing content and learners"},
		{Name: "admin", Description: "System administrator"},
	}

	for _, role := range roles {
		var existing models.Role
		result := DB.Where("name = ?", role.Name).First(&existing)
		if result.Error != nil {
			// Role doesn't exist, create it
			if err := DB.Create(&role).Error; err != nil {
				return fmt.Errorf("failed to seed role %s: %w", role.Name, err)
			}
			log.Printf("Created role: %s", role.Name)
		} else {
			log.Printf("Role already exists: %s", role.Name)
		}
	}

	// Seed languages
	languages := []models.Language{
		{Code: "en", Name: "English", NativeName: "English", Direction: "ltr", IsActive: true},
		{Code: "zh-HK", Name: "Cantonese (Traditional)", NativeName: "廣東話（繁體）", Direction: "ltr", IsActive: true},
		{Code: "zh-CN", Name: "Mandarin (Simplified)", NativeName: "普通话（简体）", Direction: "ltr", IsActive: true},
		{Code: "es", Name: "Spanish", NativeName: "Español", Direction: "ltr", IsActive: true},
		{Code: "fr", Name: "French", NativeName: "Français", Direction: "ltr", IsActive: true},
		{Code: "ja", Name: "Japanese", NativeName: "日本語", Direction: "ltr", IsActive: true},
		{Code: "ko", Name: "Korean", NativeName: "한국어", Direction: "ltr", IsActive: true},
	}

	for _, language := range languages {
		var existing models.Language
		result := DB.Where("code = ?", language.Code).First(&existing)
		if result.Error != nil {
			// Language doesn't exist, create it
			if err := DB.Create(&language).Error; err != nil {
				return fmt.Errorf("failed to seed language %s: %w", language.Code, err)
			}
			log.Printf("Created language: %s (%s)", language.Name, language.Code)
		} else {
			log.Printf("Language already exists: %s (%s)", language.Name, language.Code)
		}
	}

	return nil
}

// runSQLMigrations executes SQL files from functions, triggers, and views directories
func runSQLMigrations() error {
	dbPath := filepath.Join("database")

	// Order matters: functions -> triggers
	directories := []string{"functions", "triggers"}

	for _, dir := range directories {
		dirPath := filepath.Join(dbPath, dir)
		if err := executeSQLFilesInDirectory(dirPath); err != nil {
			return fmt.Errorf("failed to execute SQL files in %s: %w", dir, err)
		}
	}

	return nil
}

// executeSQLFilesInDirectory executes all .sql files in a directory in sorted order
func executeSQLFilesInDirectory(dirPath string) error {
	// Check if directory exists
	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		log.Printf("Directory %s does not exist, skipping", dirPath)
		return nil
	}

	// Get all .sql files
	files, err := filepath.Glob(filepath.Join(dirPath, "*.sql"))
	if err != nil {
		return fmt.Errorf("failed to read directory %s: %w", dirPath, err)
	}

	if len(files) == 0 {
		log.Printf("No SQL files found in %s", dirPath)
		return nil
	}

	// Sort files to ensure consistent execution order
	sort.Strings(files)

	// Execute each file
	for _, file := range files {
		fileName := filepath.Base(file)
		log.Printf("Executing SQL file: %s", fileName)

		content, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("failed to read file %s: %w", fileName, err)
		}

		// Execute SQL (CREATE OR REPLACE makes it idempotent)
		if err := DB.Exec(string(content)).Error; err != nil {
			// Log warning but continue - SQL uses CREATE OR REPLACE for idempotency
			log.Printf("Warning: SQL file %s execution had issue (may be normal): %v", fileName, err)
		} else {
			log.Printf("Successfully executed: %s", fileName)
		}
	}

	return nil
}

// SeedDefaultRoles creates default roles if they don't exist
func SeedDefaultRoles() error {
	roles := []models.Role{
		{Name: "learner", Description: "Regular learner user"},
		{Name: "teacher", Description: "Teacher who can create content"},
		{Name: "admin", Description: "Administrator with full access"},
	}

	for _, role := range roles {
		var existing models.Role
		if err := DB.Where("name = ?", role.Name).First(&existing).Error; err != nil {
			// Role doesn't exist, create it
			if err := DB.Create(&role).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

// SeedAdminUser creates the default admin user if it doesn't exist
func SeedAdminUser() error {
	// Check if admin user already exists
	var existingUser models.User
	if err := DB.Where("username = ?", "admin").First(&existingUser).Error; err == nil {
		log.Println("Admin user already exists. Skipping admin user creation.")
		return nil
	}

	// Get admin role
	var adminRole models.Role
	if err := DB.Where("name = ?", "admin").First(&adminRole).Error; err != nil {
		return fmt.Errorf("admin role not found: %w", err)
	}

	// Hash the default password
	passwordHash, err := utils.HashPassword("PleaseChange")
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Create admin user
	adminUser := models.User{
		Username:     "admin",
		PasswordHash: passwordHash,
		Email:        "admin@learnspeak.local",
		Name:         "System Administrator",
		Roles:        []models.Role{adminRole},
	}

	if err := DB.Create(&adminUser).Error; err != nil {
		return fmt.Errorf("failed to create admin user: %w", err)
	}

	log.Println("========================================")
	log.Println("✓ Admin user created successfully")
	log.Println("  Username: admin")
	log.Println("  Password: PleaseChange")
	log.Println("  IMPORTANT: Please change this password immediately after first login!")
	log.Println("========================================")

	return nil
}
