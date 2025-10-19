package database

import (
	"fmt"
	"log"
	"sort"

	"gorm.io/gorm"
)

// Migration interface that all migrations must implement
type Migration interface {
	// Up runs the migration
	Up(db *gorm.DB) error
	// Down rolls back the migration
	Down(db *gorm.DB) error
	// Version returns the migration version number
	Version() string
	// Name returns a human-readable name for the migration
	Name() string
}

// MigrationRegistry holds all registered migrations
type MigrationRegistry struct {
	migrations []Migration
}

// NewMigrationRegistry creates a new migration registry
func NewMigrationRegistry() *MigrationRegistry {
	return &MigrationRegistry{
		migrations: make([]Migration, 0),
	}
}

// Register adds a migration to the registry
func (r *MigrationRegistry) Register(m Migration) {
	r.migrations = append(r.migrations, m)
}

// GetMigrations returns all migrations sorted by version
func (r *MigrationRegistry) GetMigrations() []Migration {
	// Sort migrations by version
	sort.Slice(r.migrations, func(i, j int) bool {
		return r.migrations[i].Version() < r.migrations[j].Version()
	})
	return r.migrations
}

// RunMigrations executes all registered migrations
func (r *MigrationRegistry) RunMigrations(db *gorm.DB) error {
	log.Println("Running database migrations...")

	migrations := r.GetMigrations()
	for _, migration := range migrations {
		log.Printf("Running migration %s: %s", migration.Version(), migration.Name())

		// Run in transaction
		err := db.Transaction(func(tx *gorm.DB) error {
			return migration.Up(tx)
		})

		if err != nil {
			// Check if it's an "already exists" error - this is okay
			errMsg := err.Error()
			if containsAny(errMsg, []string{"already exists", "duplicate key"}) {
				log.Printf("Migration %s already applied (skipping)", migration.Version())
				continue
			}
			return fmt.Errorf("failed to execute migration %s: %w", migration.Version(), err)
		}

		log.Printf("Successfully applied migration: %s", migration.Version())
	}

	log.Println("Migrations completed successfully")
	return nil
}

// RollbackMigrations rolls back all migrations in reverse order
func (r *MigrationRegistry) RollbackMigrations(db *gorm.DB) error {
	log.Println("Rolling back database migrations...")

	migrations := r.GetMigrations()
	// Reverse order for rollback
	for i := len(migrations) - 1; i >= 0; i-- {
		migration := migrations[i]
		log.Printf("Rolling back migration %s: %s", migration.Version(), migration.Name())

		err := db.Transaction(func(tx *gorm.DB) error {
			return migration.Down(tx)
		})

		if err != nil {
			log.Printf("Warning: Failed to rollback migration %s: %v", migration.Version(), err)
			// Continue with other rollbacks
			continue
		}

		log.Printf("Successfully rolled back migration: %s", migration.Version())
	}

	log.Println("Rollback completed")
	return nil
}

// containsAny checks if string contains any of the substrings
func containsAny(s string, substrs []string) bool {
	for _, substr := range substrs {
		if len(s) >= len(substr) {
			for i := 0; i <= len(s)-len(substr); i++ {
				if s[i:i+len(substr)] == substr {
					return true
				}
			}
		}
	}
	return false
}

// Global migration registry
var Registry = NewMigrationRegistry()
