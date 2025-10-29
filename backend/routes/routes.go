package routes

import (
	"dannyswat/learnspeak/config"
	"dannyswat/learnspeak/database"
	"dannyswat/learnspeak/handlers"
	"dannyswat/learnspeak/middleware"
	"dannyswat/learnspeak/repositories"
	"dannyswat/learnspeak/services"

	"github.com/labstack/echo/v4"
)

// SetupRoutes configures all application routes
func SetupRoutes(e *echo.Echo, cfg *config.Config, uploadDir string) {
	// Initialize repositories
	wordRepo := repositories.NewWordRepository(database.DB)
	languageRepo := repositories.NewLanguageRepository(database.DB)
	topicRepo := repositories.NewTopicRepository(database.DB)
	journeyRepo := repositories.NewJourneyRepository(database.DB)
	userRepo := repositories.NewUserRepository(database.DB)
	userJourneyRepo := repositories.NewUserJourneyRepository(database.DB)
	userProgressRepo := repositories.NewUserProgressRepository(database.DB)
	quizRepo := repositories.NewQuizRepository(database.DB)
	conversationRepo := repositories.NewConversationRepository(database.DB)

	// Initialize services
	wordService := services.NewWordService(wordRepo)
	languageService := services.NewLanguageService(languageRepo)
	topicService := services.NewTopicService(topicRepo, languageRepo)
	journeyService := services.NewJourneyService(journeyRepo, languageRepo, topicRepo, userJourneyRepo, userProgressRepo)
	userService := services.NewUserService(userRepo)
	quizService := services.NewQuizService(quizRepo, topicRepo, userProgressRepo)
	conversationService := services.NewConversationService(conversationRepo, languageRepo)
	ttsService := services.NewTTSService(cfg)
	translationService := services.NewTranslationService(cfg)
	imageGenerationService, err := services.NewImageGenerationService()
	if err != nil {
		// Log error but don't fail - image generation is optional
		e.Logger.Errorf("Failed to initialize image generation service: %v", err)
	}

	// Initialize handlers
	wordHandler := handlers.NewWordHandler(wordService)
	languageHandler := handlers.NewLanguageHandler(languageService)
	topicHandler := handlers.NewTopicHandler(topicService)
	journeyHandler := handlers.NewJourneyHandler(journeyService)
	userHandler := handlers.NewUserHandler(userService)
	quizHandler := handlers.NewQuizHandler(quizService)
	conversationHandler := handlers.NewConversationHandler(conversationService)
	uploadHandler := handlers.NewFileUploadHandler(uploadDir, 10) // 10MB max
	ttsHandler := handlers.NewTTSHandler(ttsService)
	translationHandler := handlers.NewTranslationHandler(translationService)

	// Always create image generation handler (will show proper error if not configured)
	var imageGenerationHandler *handlers.ImageGenerationHandler
	if imageGenerationService != nil {
		imageGenerationHandler = handlers.NewImageGenerationHandler(imageGenerationService)
	}

	// API version 1
	api := e.Group("/api/v1")

	// Public routes (no authentication required)
	auth := api.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}

	// Public invitation routes (no authentication required)
	api.GET("/invitations/:token", journeyHandler.GetInvitationInfo)

	// Protected routes (authentication required)
	protected := api.Group("")
	protected.Use(middleware.JWTMiddleware)
	{
		// User profile
		protected.GET("/profile", handlers.GetProfile)
		protected.POST("/auth/change-password", handlers.ChangePassword)

		// Profile photo upload (all authenticated users)
		protected.POST("/upload/profile", uploadHandler.UploadProfilePhoto)

		// Languages
		protected.GET("/languages", languageHandler.GetLanguages)

		// User management
		protected.GET("/users", userHandler.SearchUsers)
		protected.GET("/users/learners", userHandler.GetLearners)
		protected.GET("/users/teachers", userHandler.GetTeachers)
		protected.GET("/users/:id", userHandler.GetUser)
		protected.PUT("/users/:id", userHandler.UpdateUser)
		protected.GET("/users/:userId/journeys", journeyHandler.GetUserJourneys)

		// Flashcard activities
		flashcardHandler := handlers.NewFlashcardHandler(database.DB)
		protected.GET("/topics/:id/flashcards", flashcardHandler.GetTopicFlashcards)
		protected.POST("/topics/:id/flashcards/complete", flashcardHandler.CompleteFlashcardActivity)
		protected.POST("/words/:wordId/bookmark", flashcardHandler.ToggleBookmark)
		protected.GET("/bookmarks", flashcardHandler.GetBookmarkedWords)

		protected.GET("/words/:id", wordHandler.GetWord)

		// Conversation practice (learners)
		protected.GET("/topics/:topicId/conversations", conversationHandler.GetConversationsByTopic)
		protected.GET("/conversations/:id", conversationHandler.GetConversation)

		protected.GET("/topics/:id/quiz", quizHandler.GetTopicQuestions)                // Get topic questions (teacher view with answers)
		protected.GET("/topics/:id/quiz/practice", quizHandler.GetTopicQuizForPractice) // Get questions for practice (no answers)
		protected.POST("/topics/:id/quiz/submit", quizHandler.SubmitQuiz)

		// Public topics for learners to explore
		protected.GET("/topics/public", topicHandler.ListPublicTopics)

		protected.GET("/journeys/:id", journeyHandler.GetJourney)
		protected.GET("/topics/:id", topicHandler.GetTopic)
		protected.POST("/journeys/:id/start", journeyHandler.StartJourney)

		// Invitation acceptance (authenticated users)
		protected.POST("/invitations/:token/accept", journeyHandler.AcceptInvitation)

		// Example: Admin-only routes
		admin := protected.Group("/admin")
		admin.Use(middleware.RequireRole("admin"))
		{
			// User management
			admin.POST("/users", userHandler.CreateUser)
			admin.GET("/users", userHandler.SearchUsers)
			admin.GET("/users/:id", userHandler.GetUser)
			admin.PUT("/users/:id", userHandler.UpdateUser)
			admin.DELETE("/users/:id", userHandler.DeleteUser)
		}

		// Example: Teacher routes
		teacher := protected.Group("")
		teacher.Use(middleware.RequireAnyRole("teacher", "admin"))
		{
			// Word management
			teacher.GET("/words", wordHandler.ListWords)
			teacher.POST("/words", wordHandler.CreateWord)
			teacher.PUT("/words/:id", wordHandler.UpdateWord)
			teacher.DELETE("/words/:id", wordHandler.DeleteWord)

			// Topic management
			teacher.GET("/topics", topicHandler.ListTopics)
			teacher.POST("/topics", topicHandler.CreateTopic)
			teacher.PUT("/topics/:id", topicHandler.UpdateTopic)
			teacher.DELETE("/topics/:id", topicHandler.DeleteTopic)
			teacher.POST("/topics/:id/words", topicHandler.AddWordsToTopic)
			teacher.PUT("/topics/:id/words/reorder", topicHandler.ReorderWords)

			// Journey management
			teacher.GET("/journeys", journeyHandler.ListJourneys)
			teacher.POST("/journeys", journeyHandler.CreateJourney)
			teacher.PUT("/journeys/:id", journeyHandler.UpdateJourney)
			teacher.DELETE("/journeys/:id", journeyHandler.DeleteJourney)
			teacher.POST("/journeys/:id/reorder", journeyHandler.ReorderTopics)
			teacher.POST("/journeys/:id/assign", journeyHandler.AssignJourney)
			teacher.POST("/journeys/:id/unassign", journeyHandler.UnassignJourney)
			teacher.GET("/journeys/:id/assignments", journeyHandler.GetJourneyAssignments)

			// Journey invitations
			teacher.POST("/journeys/:id/invite", journeyHandler.GenerateInvitation)
			teacher.GET("/journeys/:id/invitations", journeyHandler.GetJourneyInvitations)
			teacher.DELETE("/journeys/:id/invitations/:invitationId", journeyHandler.DeactivateInvitation)

			// Quiz management
			teacher.GET("/quiz", quizHandler.ListQuestions)         // List all questions with pagination
			teacher.POST("/quiz", quizHandler.CreateQuestion)       // Create a new question
			teacher.GET("/quiz/:id", quizHandler.GetQuestion)       // Get question by ID
			teacher.PUT("/quiz/:id", quizHandler.UpdateQuestion)    // Update question
			teacher.DELETE("/quiz/:id", quizHandler.DeleteQuestion) // Delete question

			// Conversation management
			teacher.GET("/conversations", conversationHandler.ListConversations)
			teacher.POST("/conversations", conversationHandler.CreateConversation)
			teacher.PUT("/conversations/:id", conversationHandler.UpdateConversation)
			teacher.DELETE("/conversations/:id", conversationHandler.DeleteConversation)
			teacher.POST("/conversations/:id/lines", conversationHandler.AddLineToConversation)
			teacher.PUT("/conversations/:id/lines/:lineId", conversationHandler.UpdateLine)
			teacher.DELETE("/conversations/:id/lines/:lineId", conversationHandler.DeleteLine)
			teacher.PUT("/conversations/:id/lines/reorder", conversationHandler.ReorderLines)

			// File uploads
			teacher.POST("/upload/audio", uploadHandler.UploadAudio)
			teacher.POST("/upload/image", uploadHandler.UploadImage)

			// TTS (Text-to-Speech)
			teacher.POST("/tts/generate", ttsHandler.GenerateTTS)
			teacher.DELETE("/tts/cache", ttsHandler.DeleteCachedAudio)

			// Translation (AI-powered)
			teacher.POST("/translate", translationHandler.Translate)
			teacher.POST("/translate/batch", translationHandler.BatchTranslate)

			// Image Generation (AI-powered)
			if imageGenerationHandler != nil {
				teacher.POST("/images/generate", imageGenerationHandler.GenerateImage)
				teacher.POST("/images/generate/batch", imageGenerationHandler.BatchGenerateImages)
			}
		}
	} // Health check endpoint (public)
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{
			"status": "ok",
		})
	})
}
