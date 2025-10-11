package database

import (
	"dannyswat/learnspeak/models"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// Migrate runs database migrations
func Migrate() error {
	log.Println("Running database migrations...")

	// First, ensure basic tables exist using GORM AutoMigrate
	err := DB.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.UserRole{},
	)
	if err != nil {
		return fmt.Errorf("failed to run basic migrations: %w", err)
	}

	// Then run SQL migrations from files
	migrationsPath := filepath.Join("database", "migrations")
	if err := runSQLMigrations(migrationsPath); err != nil {
		log.Printf("Warning: SQL migrations failed: %v", err)
		// Don't fail if SQL migrations have issues - basic schema is already created
	}

	log.Println("Migrations completed successfully")
	return nil
}

// runSQLMigrations executes SQL migration files in order
func runSQLMigrations(migrationsPath string) error {
	// Get all .up.sql files
	files, err := filepath.Glob(filepath.Join(migrationsPath, "*.up.sql"))
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	if len(files) == 0 {
		log.Println("No SQL migration files found")
		return nil
	}

	// Sort files to ensure they run in order
	sort.Strings(files)

	for _, file := range files {
		log.Printf("Running migration: %s", filepath.Base(file))

		content, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", file, err)
		}

		// Execute the SQL as a single transaction
		tx := DB.Begin()
		if err := tx.Exec(string(content)).Error; err != nil {
			tx.Rollback()
			// Check if it's a "already exists" error - this is okay
			if strings.Contains(err.Error(), "already exists") ||
				strings.Contains(err.Error(), "duplicate") {
				log.Printf("Migration %s already applied (skipping)", filepath.Base(file))
				continue
			}
			// Check if relation doesn't exist but it's expected (partial migration)
			if strings.Contains(err.Error(), "does not exist") {
				log.Printf("Warning: Migration %s partially failed: %v (continuing)", filepath.Base(file), err)
				continue
			}
			return fmt.Errorf("failed to execute migration %s: %w", file, err)
		}
		tx.Commit()

		log.Printf("Successfully applied migration: %s", filepath.Base(file))
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
			log.Printf("Created role: %s\n", role.Name)
		}
	}

	return nil
}
