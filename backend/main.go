package main

import (
	"dannyswat/learnspeak/config"
	"dannyswat/learnspeak/database"
	"dannyswat/learnspeak/routes"
	"log"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()
	log.Printf("Starting LearnSpeak API Server on port %s (Environment: %s)\n", cfg.Port, cfg.Environment)

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run migrations
	if err := database.Migrate(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Seed default roles
	if err := database.SeedDefaultRoles(); err != nil {
		log.Fatalf("Failed to seed default roles: %v", err)
	}

	// Initialize Echo
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Request size limit
	e.Use(middleware.BodyLimit(strconv.FormatInt(cfg.MaxUploadSize, 10)))

	// Setup routes
	routes.SetupRoutes(e)

	// Start server
	if err := e.Start(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
