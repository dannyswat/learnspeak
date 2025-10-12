package handlers

import (
	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/services"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type QuizHandler struct {
	quizService *services.QuizService
}

func NewQuizHandler(quizService *services.QuizService) *QuizHandler {
	return &QuizHandler{
		quizService: quizService,
	}
}

// CreateQuestion creates a new quiz question
// POST /api/v1/quiz
func (h *QuizHandler) CreateQuestion(c echo.Context) error {
	var req dto.CreateQuizQuestionRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid request body",
		})
	}

	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: err.Error(),
		})
	}

	question, err := h.quizService.CreateQuestion(&req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Message: err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, dto.SuccessResponse{
		Message: "Quiz question created successfully",
		Data:    question,
	})
}

// GetQuestion retrieves a quiz question by ID
// GET /api/v1/quiz/:id
func (h *QuizHandler) GetQuestion(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid question ID",
		})
	}

	question, err := h.quizService.GetQuestion(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Message: "Question not found",
		})
	}

	return c.JSON(http.StatusOK, dto.SuccessResponse{
		Data: question,
	})
}

// UpdateQuestion updates a quiz question
// PUT /api/v1/quiz/:id
func (h *QuizHandler) UpdateQuestion(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid question ID",
		})
	}

	var req dto.UpdateQuizQuestionRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid request body",
		})
	}

	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: err.Error(),
		})
	}

	question, err := h.quizService.UpdateQuestion(uint(id), &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Message: err.Error(),
		})
	}

	return c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Quiz question updated successfully",
		Data:    question,
	})
}

// DeleteQuestion deletes a quiz question
// DELETE /api/v1/quiz/:id
func (h *QuizHandler) DeleteQuestion(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid question ID",
		})
	}

	if err := h.quizService.DeleteQuestion(uint(id)); err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Message: err.Error(),
		})
	}

	return c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Quiz question deleted successfully",
	})
}

// ListQuestions lists all quiz questions with pagination
// GET /api/v1/quiz
func (h *QuizHandler) ListQuestions(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 10
	}

	offset, _ := strconv.Atoi(c.QueryParam("offset"))
	if offset < 0 {
		offset = 0
	}

	questions, total, err := h.quizService.ListQuestions(limit, offset)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Message: err.Error(),
		})
	}

	return c.JSON(http.StatusOK, dto.SuccessResponse{
		Data: map[string]interface{}{
			"questions": questions,
			"total":     total,
			"limit":     limit,
			"offset":    offset,
		},
	})
}

// GetTopicQuestions retrieves all quiz questions for a topic (teacher view with answers)
// GET /api/v1/topics/:id/quiz
func (h *QuizHandler) GetTopicQuestions(c echo.Context) error {
	topicID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid topic ID",
		})
	}

	questions, err := h.quizService.GetTopicQuestions(uint(topicID))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Message: err.Error(),
		})
	}

	return c.JSON(http.StatusOK, dto.SuccessResponse{
		Data: questions,
	})
}

// GetTopicQuizForPractice retrieves quiz questions for a topic without correct answers
// GET /api/v1/topics/:id/quiz/practice
func (h *QuizHandler) GetTopicQuizForPractice(c echo.Context) error {
	topicID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid topic ID",
		})
	}

	shuffle := c.QueryParam("shuffle") == "true"

	questions, err := h.quizService.GetTopicQuestionsForPractice(uint(topicID), shuffle)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Message: err.Error(),
		})
	}

	return c.JSON(http.StatusOK, dto.SuccessResponse{
		Data: questions,
	})
}

// SubmitQuiz processes a quiz submission
// POST /api/v1/topics/:id/quiz/submit
func (h *QuizHandler) SubmitQuiz(c echo.Context) error {
	userID := c.Get("userId").(uint)

	topicID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid topic ID",
		})
	}

	var req dto.QuizSubmissionRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: "Invalid request body",
		})
	}

	// Ensure the topic ID in the URL matches the request
	req.TopicID = uint(topicID)

	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Message: err.Error(),
		})
	}

	result, err := h.quizService.SubmitQuiz(userID, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Message: err.Error(),
		})
	}

	return c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Quiz submitted successfully",
		Data:    result,
	})
}
