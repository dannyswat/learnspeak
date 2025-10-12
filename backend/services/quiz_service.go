package services

import (
	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/models"
	"dannyswat/learnspeak/repositories"
	"errors"
	"math/rand"
	"time"
)

type QuizService struct {
	quizRepo     repositories.QuizRepository
	topicRepo    repositories.TopicRepository
	progressRepo repositories.UserProgressRepository
}

func NewQuizService(
	quizRepo repositories.QuizRepository,
	topicRepo repositories.TopicRepository,
	progressRepo repositories.UserProgressRepository,
) *QuizService {
	return &QuizService{
		quizRepo:     quizRepo,
		topicRepo:    topicRepo,
		progressRepo: progressRepo,
	}
}

// CreateQuestion creates a new quiz question
func (s *QuizService) CreateQuestion(req *dto.CreateQuizQuestionRequest) (*models.QuizQuestion, error) {
	// Verify topic exists
	_, err := s.topicRepo.GetByID(req.TopicID, false)
	if err != nil {
		return nil, errors.New("topic not found")
	}

	question := &models.QuizQuestion{
		TopicID:       req.TopicID,
		WordID:        req.WordID,
		QuestionType:  req.QuestionType,
		QuestionText:  req.QuestionText,
		AudioURL:      req.AudioURL,
		ImageURL:      req.ImageURL,
		CorrectAnswer: req.CorrectAnswer,
		OptionA:       req.OptionA,
		OptionB:       req.OptionB,
		OptionC:       req.OptionC,
		OptionD:       req.OptionD,
	}

	if err := s.quizRepo.Create(question); err != nil {
		return nil, err
	}

	return question, nil
}

// GetQuestion retrieves a quiz question by ID
func (s *QuizService) GetQuestion(id uint) (*models.QuizQuestion, error) {
	return s.quizRepo.GetByID(id)
}

// GetTopicQuestions retrieves all quiz questions for a topic
func (s *QuizService) GetTopicQuestions(topicID uint) ([]models.QuizQuestion, error) {
	return s.quizRepo.GetByTopicID(topicID)
}

// GetTopicQuestionsForPractice retrieves quiz questions without correct answers
func (s *QuizService) GetTopicQuestionsForPractice(topicID uint, shuffle bool) (*dto.QuizQuestionsResponse, error) {
	questions, err := s.quizRepo.GetByTopicID(topicID)
	if err != nil {
		return nil, err
	}

	// Shuffle questions if requested
	if shuffle {
		rand.Seed(time.Now().UnixNano())
		rand.Shuffle(len(questions), func(i, j int) {
			questions[i], questions[j] = questions[j], questions[i]
		})
	}

	// Convert to practice format (without correct answers)
	practiceQuestions := make([]dto.QuizQuestionForPractice, len(questions))
	for i, q := range questions {
		practiceQuestions[i] = dto.QuizQuestionForPractice{
			ID:           q.ID,
			QuestionType: q.QuestionType,
			QuestionText: q.QuestionText,
			AudioURL:     q.AudioURL,
			ImageURL:     q.ImageURL,
			OptionA:      q.OptionA,
			OptionB:      q.OptionB,
			OptionC:      q.OptionC,
			OptionD:      q.OptionD,
			WordID:       q.WordID,
		}
	}

	return &dto.QuizQuestionsResponse{
		Questions: practiceQuestions,
	}, nil
}

// UpdateQuestion updates a quiz question
func (s *QuizService) UpdateQuestion(id uint, req *dto.UpdateQuizQuestionRequest) (*models.QuizQuestion, error) {
	question, err := s.quizRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.QuestionType != "" {
		question.QuestionType = req.QuestionType
	}
	if req.QuestionText != "" {
		question.QuestionText = req.QuestionText
	}
	if req.AudioURL != nil {
		question.AudioURL = req.AudioURL
	}
	if req.ImageURL != nil {
		question.ImageURL = req.ImageURL
	}
	if req.CorrectAnswer != "" {
		question.CorrectAnswer = req.CorrectAnswer
	}
	if req.OptionA != "" {
		question.OptionA = req.OptionA
	}
	if req.OptionB != "" {
		question.OptionB = req.OptionB
	}
	if req.OptionC != "" {
		question.OptionC = req.OptionC
	}
	if req.OptionD != "" {
		question.OptionD = req.OptionD
	}

	if err := s.quizRepo.Update(question); err != nil {
		return nil, err
	}

	return question, nil
}

// DeleteQuestion deletes a quiz question
func (s *QuizService) DeleteQuestion(id uint) error {
	return s.quizRepo.Delete(id)
}

// SubmitQuiz processes a quiz submission and returns results
func (s *QuizService) SubmitQuiz(userID uint, req *dto.QuizSubmissionRequest) (*dto.QuizResultResponse, error) {
	// Get all questions for the topic
	questions, err := s.quizRepo.GetByTopicID(req.TopicID)
	if err != nil {
		return nil, err
	}

	if len(questions) == 0 {
		return nil, errors.New("no questions found for this topic")
	}

	// Create a map for quick lookup
	questionMap := make(map[uint]*models.QuizQuestion)
	for i := range questions {
		questionMap[questions[i].ID] = &questions[i]
	}

	// Grade the answers
	correctCount := 0
	questionResults := make([]dto.QuestionResult, 0, len(req.Answers))

	for _, answer := range req.Answers {
		question, exists := questionMap[answer.QuestionID]
		if !exists {
			continue
		}

		isCorrect := answer.Answer == question.CorrectAnswer
		if isCorrect {
			correctCount++
		}

		questionResults = append(questionResults, dto.QuestionResult{
			QuestionID:    question.ID,
			QuestionType:  question.QuestionType,
			QuestionText:  question.QuestionText,
			AudioURL:      question.AudioURL,
			ImageURL:      question.ImageURL,
			UserAnswer:    answer.Answer,
			CorrectAnswer: question.CorrectAnswer,
			IsCorrect:     isCorrect,
			OptionA:       question.OptionA,
			OptionB:       question.OptionB,
			OptionC:       question.OptionC,
			OptionD:       question.OptionD,
		})
	}

	// Calculate score
	totalQuestions := len(req.Answers)
	score := float64(correctCount) / float64(totalQuestions) * 100.0
	passed := score >= 70.0 // Pass threshold is 70%

	now := time.Now()
	// Save progress
	progress := &models.UserProgress{
		UserID:           userID,
		TopicID:          &req.TopicID,
		JourneyID:        req.JourneyID,
		ActivityType:     "quiz",
		Completed:        passed,
		Score:            &score,
		TimeSpentSeconds: req.TimeSpent,
		CompletedAt:      &now,
	}

	if err := s.progressRepo.Create(progress); err != nil {
		// Log error but don't fail the request
		// The user should still see their results
	}

	return &dto.QuizResultResponse{
		TotalQuestions:  totalQuestions,
		CorrectAnswers:  correctCount,
		Score:           score,
		TimeSpent:       req.TimeSpent,
		Passed:          passed,
		QuestionResults: questionResults,
	}, nil
}

// ListQuestions lists all quiz questions with pagination
func (s *QuizService) ListQuestions(limit, offset int) ([]models.QuizQuestion, int64, error) {
	return s.quizRepo.List(limit, offset)
}
