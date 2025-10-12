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
	languageRepo := repositories.NewLanguageRepository(database.DB)
	topicRepo := repositories.NewTopicRepository(database.DB)
	journeyRepo := repositories.NewJourneyRepository(database.DB)
	userRepo := repositories.NewUserRepository(database.DB)
	userJourneyRepo := repositories.NewUserJourneyRepository(database.DB)

	// Initialize services
	wordService := services.NewWordService(wordRepo)
	languageService := services.NewLanguageService(languageRepo)
	topicService := services.NewTopicService(topicRepo, languageRepo)
	journeyService := services.NewJourneyService(journeyRepo, languageRepo, topicRepo, userJourneyRepo)
	userService := services.NewUserService(userRepo)

	// Initialize handlers
	wordHandler := handlers.NewWordHandler(wordService)
	languageHandler := handlers.NewLanguageHandler(languageService)
	topicHandler := handlers.NewTopicHandler(topicService)
	journeyHandler := handlers.NewJourneyHandler(journeyService)
	userHandler := handlers.NewUserHandler(userService)
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

		// Languages
		protected.GET("/languages", languageHandler.GetLanguages)

		// Word management
		protected.GET("/words", wordHandler.ListWords)
		protected.POST("/words", wordHandler.CreateWord)
		protected.GET("/words/:id", wordHandler.GetWord)
		protected.PUT("/words/:id", wordHandler.UpdateWord)
		protected.DELETE("/words/:id", wordHandler.DeleteWord)

		// Topic management
		protected.GET("/topics", topicHandler.ListTopics)
		protected.POST("/topics", topicHandler.CreateTopic)
		protected.GET("/topics/:id", topicHandler.GetTopic)
		protected.PUT("/topics/:id", topicHandler.UpdateTopic)
		protected.DELETE("/topics/:id", topicHandler.DeleteTopic)
		protected.PUT("/topics/:id/words/reorder", topicHandler.ReorderWords)

		// Journey management
		protected.GET("/journeys", journeyHandler.ListJourneys)
		protected.POST("/journeys", journeyHandler.CreateJourney)
		protected.GET("/journeys/:id", journeyHandler.GetJourney)
		protected.PUT("/journeys/:id", journeyHandler.UpdateJourney)
		protected.DELETE("/journeys/:id", journeyHandler.DeleteJourney)
		protected.POST("/journeys/:id/reorder", journeyHandler.ReorderTopics)
		protected.POST("/journeys/:id/assign", journeyHandler.AssignJourney)
		protected.POST("/journeys/:id/unassign", journeyHandler.UnassignJourney)
		protected.GET("/journeys/:id/assignments", journeyHandler.GetJourneyAssignments)

		// User management
		protected.GET("/users", userHandler.SearchUsers)
		protected.GET("/users/learners", userHandler.GetLearners)
		protected.GET("/users/teachers", userHandler.GetTeachers)
		protected.GET("/users/:id", userHandler.GetUser)
		protected.PUT("/users/:id", userHandler.UpdateUser)
		protected.GET("/users/:userId/journeys", journeyHandler.GetUserJourneys)

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
