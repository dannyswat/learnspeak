package main

import (
	"dannyswat/learnspeak/config"
	"dannyswat/learnspeak/database"
	"dannyswat/learnspeak/routes"
	"log"
	"os"
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

	// CORS middleware - only needed for development with separate frontend server
	if cfg.CORSAllowedOrigins != "" {
		origins := []string{}
		for _, origin := range splitAndTrim(cfg.CORSAllowedOrigins, ",") {
			if origin != "" {
				origins = append(origins, origin)
			}
		}
		if len(origins) > 0 {
			e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
				AllowOrigins: origins,
				AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.PATCH},
				AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
			}))
			log.Printf("CORS enabled for origins: %v\n", origins)
		}
	}

	// Request size limit
	e.Use(middleware.BodyLimit(strconv.FormatInt(cfg.MaxUploadSize, 10)))

	// Create uploads directory
	uploadsDir := "./uploads"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		log.Printf("Warning: Failed to create uploads directory: %v", err)
	}

	// Serve uploaded files
	e.Static("/uploads", uploadsDir)

	// Setup routes
	routes.SetupRoutes(e, uploadsDir)

	// Serve static files from frontend build (production)
	// The frontend build should be placed in ../frontend/dist
	staticDir := "../frontend/dist"
	if _, err := os.Stat(staticDir); err == nil {
		e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
			Root:   staticDir,
			Index:  "index.html",
			Browse: false,
			HTML5:  true, // Support client-side routing
		}))
		log.Printf("Serving static files from %s\n", staticDir)
	} else {
		log.Printf("Static files directory not found: %s (running in API-only mode)\n", staticDir)
	}

	// Start server
	if err := e.Start(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// splitAndTrim splits a string by delimiter and trims whitespace
func splitAndTrim(s string, delimiter string) []string {
	parts := []string{}
	for _, part := range splitString(s, delimiter) {
		trimmed := trimSpace(part)
		if trimmed != "" {
			parts = append(parts, trimmed)
		}
	}
	return parts
}

func splitString(s string, delimiter string) []string {
	result := []string{}
	start := 0
	for i := 0; i < len(s); i++ {
		if i+len(delimiter) <= len(s) && s[i:i+len(delimiter)] == delimiter {
			result = append(result, s[start:i])
			start = i + len(delimiter)
			i += len(delimiter) - 1
		}
	}
	result = append(result, s[start:])
	return result
}

func trimSpace(s string) string {
	start := 0
	end := len(s)
	for start < end && (s[start] == ' ' || s[start] == '\t' || s[start] == '\n' || s[start] == '\r') {
		start++
	}
	for end > start && (s[end-1] == ' ' || s[end-1] == '\t' || s[end-1] == '\n' || s[end-1] == '\r') {
		end--
	}
	return s[start:end]
}
