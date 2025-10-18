import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { flashcardService, type Flashcard } from '../services/flashcardService';

const FlashcardPractice: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const journeyId = searchParams.get('journeyId');

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [topicName, setTopicName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (topicId) {
      loadFlashcards(parseInt(topicId));
    }
  }, [topicId]);

  const loadFlashcards = async (id: number) => {
    try {
      setLoading(true);
      const data = await flashcardService.getTopicFlashcards(id);
      setFlashcards(data.flashcards);
      setTopicName(data.topicName);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const currentCard = flashcards[currentIndex];
  const isFirstCard = currentIndex === 0;
  const isLastCard = currentIndex === flashcards.length - 1;

  const handleFlip = () => {
    const newFlippedState = !isFlipped;
    setIsFlipped(newFlippedState);
    
    // Auto-play audio when flipping to the back
    if (newFlippedState && currentCard?.translations?.[0]?.audioUrl) {
      // Small delay to let the flip animation start
      setTimeout(() => {
        playAudio(currentCard.translations[0].audioUrl);
      }, 300);
    }
  };

  const handleNext = useCallback(() => {
    if (!isLastCard) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Reached the end
      setShowCompletionModal(true);
    }
  }, [currentIndex, isLastCard]);

  const handlePrevious = () => {
    if (!isFirstCard) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleBookmark = async () => {
    if (!currentCard) return;

    try {
      const result = await flashcardService.toggleBookmark(currentCard.id);
      
      // Update local state
      setFlashcards(cards =>
        cards.map(card =>
          card.id === currentCard.id
            ? { ...card, isBookmarked: result.bookmarked }
            : card
        )
      );
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleComplete = async () => {
    if (!topicId) return;

    try {
      setSaving(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      await flashcardService.completeFlashcardActivity(parseInt(topicId), {
        journeyId: journeyId ? parseInt(journeyId) : undefined,
        timeSpentSeconds: timeSpent,
      });

      // Navigate back to topic or journey
      if (journeyId) {
        navigate(`/journeys/${journeyId}`);
      } else {
        navigate(`/topics/${topicId}`);
      }
    } catch (err) {
      console.error('Failed to complete activity:', err);
      setError('Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const playAudio = (audioUrl?: string) => {
    if (!audioUrl) return;
    
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
      console.error('Failed to play audio:', err);
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showCompletionModal) return;

      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleFlip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isFlipped, showCompletionModal]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading flashcards...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-red-700 hover:text-red-800 font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No flashcards available for this topic.</p>
            <button
              onClick={() => navigate(-1)}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
              <p className="text-gray-600 mt-1">{topicName}</p>
            </div>

            {/* Progress */}
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {currentIndex + 1} / {flashcards.length}
              </div>
              <div className="text-sm text-gray-600">
                {Math.round(((currentIndex + 1) / flashcards.length) * 100)}% Complete
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="relative mb-8" style={{ perspective: '1000px' }}>
          <div
            className={`
              relative w-full h-96 transition-transform duration-500 cursor-pointer
              ${isFlipped ? '[transform:rotateY(180deg)]' : ''}
            `}
            style={{ transformStyle: 'preserve-3d' }}
            onClick={handleFlip}
          >
            {/* Front of card */}
            <div
              className="absolute w-full h-full bg-white rounded-lg shadow-lg p-8 flex flex-col items-center justify-center"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              {currentCard?.imageUrl && (
                <img
                  src={currentCard.imageUrl}
                  alt={currentCard.baseWord}
                  className="h-[300px] object-cover rounded-lg mb-6"
                />
              )}
              <h2 className="text-4xl font-bold text-gray-900 text-center">
                {currentCard?.baseWord}
              </h2>
              {currentCard?.notes && (
                <p className="text-gray-600 mt-4 text-center max-w-md">{currentCard.notes}</p>
              )}
              <p className="text-gray-400 mt-8 text-sm">
                Click to flip {currentCard?.translations?.[0]?.audioUrl && '(audio plays automatically)'}
              </p>
            </div>

            {/* Back of card */}
            <div
              className="absolute w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-8 flex flex-col items-center justify-center"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="text-center">
                {currentCard?.imageUrl && (
                  <img
                    src={currentCard.imageUrl}
                    alt={currentCard.baseWord}
                    className="h-[200px] object-cover rounded-lg mb-4 mx-auto border-4 border-white shadow-lg"
                  />
                )}
                {currentCard?.translations.map((translation, idx) => (
                  <div key={idx} className="mb-6">
                    <h3 className="text-4xl font-bold text-white mb-2">
                      {translation.translation}
                    </h3>
                    {translation.romanization && (
                      <p className="text-2xl text-green-100 mb-3">
                        {translation.romanization}
                      </p>
                    )}
                    {translation.audioUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(translation.audioUrl);
                        }}
                        className="mt-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors inline-flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                        Play Audio
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-green-100 mt-4 text-sm">Click to flip back</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevious}
            disabled={isFirstCard}
            className={`
              px-6 py-3 rounded-lg font-medium flex items-center transition-colors
              ${isFirstCard
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <button
            onClick={handleBookmark}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors
              ${currentCard?.isBookmarked
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <svg className="w-5 h-5 inline mr-2" fill={currentCard?.isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {currentCard?.isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
          >
            {isLastCard ? 'Finish' : 'Next'}
            {!isLastCard && (
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Keyboard Hints */}
        <div className="text-center text-sm text-gray-500">
          <p>Keyboard: ← Previous | → Next | Space/Enter to Flip (Audio plays automatically)</p>
        </div>

        {/* Completion Modal */}
        {showCompletionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <svg className="w-16 h-16 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Great Job!</h2>
                <p className="text-gray-600 mb-6">
                  You've completed all {flashcards.length} flashcards for {topicName}
                </p>

                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Total Cards:</span>
                    <span className="font-semibold text-gray-900">{flashcards.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Spent:</span>
                    <span className="font-semibold text-gray-900">
                      {Math.floor((Date.now() - startTime) / 60000)}m {Math.floor(((Date.now() - startTime) % 60000) / 1000)}s
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setCurrentIndex(0);
                      setIsFlipped(false);
                      setShowCompletionModal(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Review Again
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Complete & Return'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FlashcardPractice;
