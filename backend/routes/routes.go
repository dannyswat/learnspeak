package routes

import (
	"dannyswat/learnspeak/database"
	"dannyswat/learnspeak/handlers"
	"dannyswat/learnspeak/middleware"
	"dannyswat/learnspeak/repositories"
	"dannyswat/learnspeak/services"

	"github.com/labstack/echo/v4"
)

// SetupRoutes configures all application routes
func SetupRoutes(e *echo.Echo, uploadDir string) {
	// Initialize repositories
	wordRepo := repositories.NewWordRepository(database.DB)

	// Initialize services
	wordService := services.NewWordService(wordRepo)

	// Initialize handlers
	wordHandler := handlers.NewWordHandler(wordService)
	uploadHandler := handlers.NewFileUploadHandler(uploadDir, 10) // 10MB max

	// API version 1
	api := e.Group("/api/v1")

	// Public routes (no authentication required)
	auth := api.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}

	// Protected routes (authentication required)
	protected := api.Group("")
	protected.Use(middleware.JWTMiddleware)
	{
		// User profile
		protected.GET("/profile", handlers.GetProfile)

		// Word management
		protected.GET("/words", wordHandler.ListWords)
		protected.POST("/words", wordHandler.CreateWord)
		protected.GET("/words/:id", wordHandler.GetWord)
		protected.PUT("/words/:id", wordHandler.UpdateWord)
		protected.DELETE("/words/:id", wordHandler.DeleteWord)

		// File uploads
		protected.POST("/upload/audio", uploadHandler.UploadAudio)
		protected.POST("/upload/image", uploadHandler.UploadImage)

		// Example: Admin-only routes
		admin := protected.Group("/admin")
		admin.Use(middleware.RequireRole("admin"))
		{
			// Add admin routes here
		}

		// Example: Teacher routes
		teacher := protected.Group("/teacher")
		teacher.Use(middleware.RequireRole("teacher"))
		{
			// Add teacher routes here
		}
	}

	// Health check endpoint (public)
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{
			"status": "ok",
		})
	})
}
