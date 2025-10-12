package dto

// CreateQuizQuestionRequest represents the request to create a quiz question
type CreateQuizQuestionRequest struct {
	TopicID       uint    `json:"topicId" validate:"required"`
	WordID        *uint   `json:"wordId"`
	QuestionType  string  `json:"questionType" validate:"required,oneof=translation listening image"`
	QuestionText  string  `json:"questionText" validate:"required"`
	AudioURL      *string `json:"audioUrl"`
	ImageURL      *string `json:"imageUrl"`
	CorrectAnswer string  `json:"correctAnswer" validate:"required,oneof=a b c d"`
	OptionA       string  `json:"optionA" validate:"required"`
	OptionB       string  `json:"optionB" validate:"required"`
	OptionC       string  `json:"optionC" validate:"required"`
	OptionD       string  `json:"optionD" validate:"required"`
}

// UpdateQuizQuestionRequest represents the request to update a quiz question
type UpdateQuizQuestionRequest struct {
	QuestionType  string  `json:"questionType" validate:"omitempty,oneof=translation listening image"`
	QuestionText  string  `json:"questionText"`
	AudioURL      *string `json:"audioUrl"`
	ImageURL      *string `json:"imageUrl"`
	CorrectAnswer string  `json:"correctAnswer" validate:"omitempty,oneof=a b c d"`
	OptionA       string  `json:"optionA"`
	OptionB       string  `json:"optionB"`
	OptionC       string  `json:"optionC"`
	OptionD       string  `json:"optionD"`
}

// QuizQuestionResponse represents a quiz question in responses
type QuizQuestionResponse struct {
	ID            uint    `json:"id"`
	TopicID       uint    `json:"topicId"`
	WordID        *uint   `json:"wordId,omitempty"`
	QuestionType  string  `json:"questionType"`
	QuestionText  string  `json:"questionText"`
	AudioURL      *string `json:"audioUrl,omitempty"`
	ImageURL      *string `json:"imageUrl,omitempty"`
	CorrectAnswer string  `json:"correctAnswer"`
	OptionA       string  `json:"optionA"`
	OptionB       string  `json:"optionB"`
	OptionC       string  `json:"optionC"`
	OptionD       string  `json:"optionD"`
}

// QuizAnswerRequest represents a user's answer to a quiz question
type QuizAnswerRequest struct {
	QuestionID uint   `json:"questionId" validate:"required"`
	Answer     string `json:"answer" validate:"required,oneof=a b c d"`
}

// QuizSubmissionRequest represents a complete quiz submission
type QuizSubmissionRequest struct {
	TopicID   uint                `json:"topicId" validate:"required"`
	JourneyID *uint               `json:"journeyId"`
	Answers   []QuizAnswerRequest `json:"answers" validate:"required,min=1"`
	TimeSpent int                 `json:"timeSpent"` // in seconds
}

// QuizResultResponse represents the result of a quiz submission
type QuizResultResponse struct {
	TotalQuestions  int              `json:"totalQuestions"`
	CorrectAnswers  int              `json:"correctAnswers"`
	Score           float64          `json:"score"` // percentage
	TimeSpent       int              `json:"timeSpent"`
	Passed          bool             `json:"passed"`
	QuestionResults []QuestionResult `json:"questionResults"`
}

// QuestionResult represents the result for a single question
type QuestionResult struct {
	QuestionID    uint    `json:"questionId"`
	QuestionType  string  `json:"questionType"`
	QuestionText  string  `json:"questionText"`
	AudioURL      *string `json:"audioUrl,omitempty"`
	ImageURL      *string `json:"imageUrl,omitempty"`
	UserAnswer    string  `json:"userAnswer"`
	CorrectAnswer string  `json:"correctAnswer"`
	IsCorrect     bool    `json:"isCorrect"`
	OptionA       string  `json:"optionA"`
	OptionB       string  `json:"optionB"`
	OptionC       string  `json:"optionC"`
	OptionD       string  `json:"optionD"`
}

// QuizQuestionsResponse represents a list of quiz questions for taking a quiz
// (without correct answers revealed)
type QuizQuestionsResponse struct {
	Questions []QuizQuestionForPractice `json:"questions"`
}

// QuizQuestionForPractice represents a quiz question without the correct answer
type QuizQuestionForPractice struct {
	ID           uint    `json:"id"`
	QuestionType string  `json:"questionType"`
	QuestionText string  `json:"questionText"`
	AudioURL     *string `json:"audioUrl,omitempty"`
	ImageURL     *string `json:"imageUrl,omitempty"`
	OptionA      string  `json:"optionA"`
	OptionB      string  `json:"optionB"`
	OptionC      string  `json:"optionC"`
	OptionD      string  `json:"optionD"`
	WordID       *uint   `json:"wordId,omitempty"`
}
