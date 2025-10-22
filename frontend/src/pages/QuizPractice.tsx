import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { uploadService } from '../services/wordService';
import Layout from '../components/Layout';
import type { QuizQuestionForPractice, QuizAnswer, QuizResult } from '../types/quiz';

const QuizPractice: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const journeyId = searchParams.get('journeyId');

  const [questions, setQuestions] = useState<QuizQuestionForPractice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, 'a' | 'b' | 'c' | 'd'>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (topicId) {
      loadQuiz(parseInt(topicId));
    }
  }, [topicId]);

  // Autoplay audio for listening questions when question changes
  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentIndex];
      if (currentQuestion.questionType === 'listening' && currentQuestion.audioUrl && audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch(err => {
          console.error('Audio autoplay failed:', err);
        });
      }
    }
  }, [currentIndex, questions]);

  const loadQuiz = async (id: number) => {
    try {
      setLoading(true);
      const data = await quizService.getTopicQuizForPractice(id, true);
      setQuestions(data.questions);
      
      if (data.questions.length === 0) {
        setError('No quiz questions available for this topic');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: 'a' | 'b' | 'c' | 'd') => {
    const newAnswers = new Map(answers);
    newAnswers.set(questions[currentIndex].id, answer);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.size < questions.length) {
      if (!window.confirm(`You've only answered ${answers.size} out of ${questions.length} questions. Submit anyway?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      const quizAnswers: QuizAnswer[] = Array.from(answers.entries()).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const result = await quizService.submitQuiz(parseInt(topicId!), {
        topicId: parseInt(topicId!),
        journeyId: journeyId ? parseInt(journeyId) : undefined,
        answers: quizAnswers,
        timeSpent,
      });

      setResults(result);
      setShowResults(true);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers(new Map());
    setCurrentIndex(0);
    setShowResults(false);
    setResults(null);
    loadQuiz(parseInt(topicId!));
  };

  const handleExit = () => {
    if (journeyId) {
      navigate(`/my-journeys`);
    } else {
      navigate(`/topics/${topicId}`);
    }
  };

  const getOptionLabel = (option: 'a' | 'b' | 'c' | 'd'): string => {
    return { a: 'A', b: 'B', c: 'C', d: 'D' }[option];
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading quiz...</div>
        </div>
      </Layout>
    );
  }

  if (error || questions.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="text-red-600 mb-4">{error || 'No quiz questions available'}</div>
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  // Results view
  if (showResults && results) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="bg-white shadow rounded-lg p-8 mb-6 text-center">
            <div className={`text-6xl mb-4`}>
              {results.passed ? '🎉' : '📚'}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {results.passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {results.passed
                ? 'You passed the quiz!'
                : 'You need 70% to pass. Review the questions and try again.'}
            </p>

            {/* Score Stats */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">{results.score.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">
                  {results.correctAnswers}/{results.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600">{formatTime(results.timeSpent)}</div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Try Again
              </button>
              <button
                onClick={handleExit}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Question Review */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Review Answers</h3>
            <div className="space-y-4">
              {results.questionResults.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`border rounded-lg p-4 ${
                    result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded mr-2">
                        {result.questionType}
                      </span>
                      <span className="font-medium text-gray-700">Q{index + 1}.</span>
                      <span className="text-gray-900">{result.questionText}</span>
                    </div>
                    {result.isCorrect ? (
                      <span className="text-green-600 font-medium">✓ Correct</span>
                    ) : (
                      <span className="text-red-600 font-medium">✗ Incorrect</span>
                    )}
                  </div>

                  {/* Audio Player for Listening Questions in Review */}
                  {result.questionType === 'listening' && result.audioUrl && (
                    <div className="mb-3">
                      <audio
                        controls
                        className="w-full max-w-md"
                        src={uploadService.getFileUrl(result.audioUrl)}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {/* Image for Image Questions in Review */}
                  {result.questionType === 'image' && result.imageUrl && (
                    <div className="mb-3 flex justify-center">
                      <img
                        src={uploadService.getFileUrl(result.imageUrl)}
                        alt="Question"
                        className="max-w-xs max-h-48 rounded-lg shadow-sm object-contain"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {(['a', 'b', 'c', 'd'] as const).map((option) => {
                      const isUserAnswer = result.userAnswer === option;
                      const isCorrectAnswer = result.correctAnswer === option;
                      const optionText = result[`option${option.toUpperCase()}` as keyof typeof result];

                      return (
                        <div
                          key={option}
                          className={`p-2 rounded ${
                            isCorrectAnswer
                              ? 'bg-green-100 border-2 border-green-500'
                              : isUserAnswer
                              ? 'bg-red-100 border-2 border-red-500'
                              : 'bg-gray-50'
                          }`}
                        >
                          <span className="font-medium">{getOptionLabel(option)}.</span> {optionText}
                          {isCorrectAnswer && <span className="ml-2 text-green-600">✓</span>}
                          {isUserAnswer && !isCorrectAnswer && <span className="ml-2 text-red-600">✗</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Quiz taking view
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.get(currentQuestion.id);
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = answers.size;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className="text-sm text-gray-600">
              Answered: {answeredCount}/{questions.length}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white shadow rounded-lg p-8 mb-6">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
              {currentQuestion.questionType}
            </span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentQuestion.questionText}
            </h2>

            {/* Audio Player for Listening Questions */}
            {currentQuestion.questionType === 'listening' && currentQuestion.audioUrl && (
              <div className="mt-4 mb-4">
                <audio
                  ref={audioRef}
                  controls
                  className="w-full max-w-md"
                  src={uploadService.getFileUrl(currentQuestion.audioUrl)}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Image for Image Questions */}
            {currentQuestion.questionType === 'image' && currentQuestion.imageUrl && (
              <div className="mt-4 mb-4 flex justify-center">
                <img
                  src={uploadService.getFileUrl(currentQuestion.imageUrl)}
                  alt="Question"
                  className="max-w-md max-h-64 rounded-lg shadow-md object-contain"
                />
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {(['a', 'b', 'c', 'd'] as const).map((option) => {
              const optionText = currentQuestion[`option${option.toUpperCase()}` as keyof typeof currentQuestion];
              const isSelected = currentAnswer === option;

              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 font-medium ${
                        isSelected
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {getOptionLabel(option)}
                    </div>
                    <span className="text-gray-900">{optionText}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`px-6 py-3 rounded-lg font-medium ${
              currentIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-10 h-10 rounded-lg font-medium ${
                  index === currentIndex
                    ? 'bg-green-500 text-white'
                    : answers.has(questions[index].id)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuizPractice;
