package database

import (
	"dannyswat/learnspeak/models"
	"log"
)

// Migrate runs database migrations
func Migrate() error {
	log.Println("Running database migrations...")

	err := DB.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.UserRole{},
	)

	if err != nil {
		return err
	}

	log.Println("Migrations completed successfully")
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
