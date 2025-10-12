package handlers

import (
	"net/http"
	"strconv"

	"dannyswat/learnspeak/models"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type FlashcardHandler struct {
	db *gorm.DB
}

func NewFlashcardHandler(db *gorm.DB) *FlashcardHandler {
	return &FlashcardHandler{db: db}
}

// GetTopicFlashcards gets all words for flashcard practice in a topic
func (h *FlashcardHandler) GetTopicFlashcards(c echo.Context) error {
	topicID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid topic ID"})
	}

	// Check if topic exists
	var topic models.Topic
	if err := h.db.First(&topic, topicID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Topic not found"})
	}

	// Get all words for the topic with translations
	var topicWords []models.TopicWord
	if err := h.db.Where("topic_id = ?", topicID).
		Order("sequence_order ASC").
		Preload("Word.Translations").
		Preload("Word.Translations.Language").
		Find(&topicWords).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to load flashcards"})
	}

	// Get user's bookmarked words (if authenticated)
	userID, _ := c.Get("userId").(uint)
	bookmarkedWordIDs := make(map[uint]bool)
	if userID > 0 {
		var bookmarks []models.UserBookmark
		h.db.Where("user_id = ? AND word_id IS NOT NULL", userID).Find(&bookmarks)
		for _, b := range bookmarks {
			if b.WordID != nil {
				bookmarkedWordIDs[*b.WordID] = true
			}
		}
	}

	// Format response
	type FlashcardResponse struct {
		ID           uint                     `json:"id"`
		BaseWord     string                   `json:"baseWord"`
		ImageURL     string                   `json:"imageUrl,omitempty"`
		Notes        string                   `json:"notes,omitempty"`
		Translations []models.WordTranslation `json:"translations"`
		IsBookmarked bool                     `json:"isBookmarked"`
	}

	flashcards := make([]FlashcardResponse, 0, len(topicWords))
	for _, tw := range topicWords {
		flashcards = append(flashcards, FlashcardResponse{
			ID:           tw.Word.ID,
			BaseWord:     tw.Word.BaseWord,
			ImageURL:     tw.Word.ImageURL,
			Notes:        tw.Word.Notes,
			Translations: tw.Word.Translations,
			IsBookmarked: bookmarkedWordIDs[tw.Word.ID],
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"topicId":    topicID,
		"topicName":  topic.Name,
		"flashcards": flashcards,
		"total":      len(flashcards),
	})
}

// CompleteFlashcardActivity marks flashcard activity as complete
func (h *FlashcardHandler) CompleteFlashcardActivity(c echo.Context) error {
	topicID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid topic ID"})
	}

	userID := c.Get("userId").(uint)

	// Get request body
	var req struct {
		JourneyID        *uint `json:"journeyId"`
		TimeSpentSeconds int   `json:"timeSpentSeconds"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request"})
	}

	// Create or update progress record
	progress := models.UserProgress{
		UserID:           userID,
		TopicID:          uintPtr(uint(topicID)),
		JourneyID:        req.JourneyID,
		ActivityType:     "flashcard",
		Completed:        true,
		TimeSpentSeconds: req.TimeSpentSeconds,
	}

	// Check if already exists
	var existing models.UserProgress
	result := h.db.Where(
		"user_id = ? AND topic_id = ? AND activity_type = ?",
		userID, topicID, "flashcard",
	).First(&existing)

	if result.Error == nil {
		// Update existing
		existing.Completed = true
		existing.TimeSpentSeconds += req.TimeSpentSeconds
		if err := h.db.Save(&existing).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to save progress"})
		}
		return c.JSON(http.StatusOK, existing)
	}

	// Create new
	if err := h.db.Create(&progress).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to save progress"})
	}

	return c.JSON(http.StatusOK, progress)
}

// ToggleBookmark adds or removes a word bookmark
func (h *FlashcardHandler) ToggleBookmark(c echo.Context) error {
	wordID, err := strconv.Atoi(c.Param("wordId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid word ID"})
	}

	userID := c.Get("userId").(uint)

	// Check if bookmark exists
	var bookmark models.UserBookmark
	result := h.db.Where("user_id = ? AND word_id = ?", userID, wordID).First(&bookmark)

	if result.Error == nil {
		// Bookmark exists, remove it
		if err := h.db.Delete(&bookmark).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to remove bookmark"})
		}
		return c.JSON(http.StatusOK, map[string]interface{}{
			"bookmarked": false,
			"message":    "Bookmark removed",
		})
	}

	// Create bookmark
	wordIDUint := uint(wordID)
	newBookmark := models.UserBookmark{
		UserID: userID,
		WordID: &wordIDUint,
	}
	if err := h.db.Create(&newBookmark).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to create bookmark"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"bookmarked": true,
		"message":    "Bookmark added",
	})
}

// GetBookmarkedWords gets all bookmarked words for a user
func (h *FlashcardHandler) GetBookmarkedWords(c echo.Context) error {
	userID := c.Get("userId").(uint)

	var bookmarks []models.UserBookmark
	if err := h.db.Where("user_id = ? AND word_id IS NOT NULL", userID).
		Preload("Word.Translations").
		Preload("Word.Translations.Language").
		Find(&bookmarks).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to load bookmarks"})
	}

	type BookmarkedWord struct {
		ID           uint                     `json:"id"`
		BaseWord     string                   `json:"baseWord"`
		ImageURL     string                   `json:"imageUrl,omitempty"`
		Translations []models.WordTranslation `json:"translations"`
		BookmarkedAt string                   `json:"bookmarkedAt"`
	}

	words := make([]BookmarkedWord, 0, len(bookmarks))
	for _, b := range bookmarks {
		if b.Word != nil {
			words = append(words, BookmarkedWord{
				ID:           b.Word.ID,
				BaseWord:     b.Word.BaseWord,
				ImageURL:     b.Word.ImageURL,
				Translations: b.Word.Translations,
				BookmarkedAt: b.CreatedAt.Format("2006-01-02T15:04:05Z"),
			})
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"bookmarks": words,
		"total":     len(words),
	})
}

func uintPtr(u uint) *uint {
	return &u
}
