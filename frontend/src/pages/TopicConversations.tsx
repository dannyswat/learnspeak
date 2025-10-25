import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { conversationService } from '../services/conversationService';
import type { Conversation } from '../types/conversation';
import Layout from '../components/Layout';
import ConversationPlayer from '../components/ConversationPlayer';

const TopicConversations: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const journeyId = searchParams.get('journeyId');

  useEffect(() => {
    if (id) {
      loadConversations(parseInt(id));
    }
  }, [id]);

  const loadConversations = async (topicId: number) => {
    try {
      setLoading(true);
      const data = await conversationService.getConversationsByTopic(topicId);
      setConversations(data);
      // Auto-select first conversation if available
      if (data.length > 0) {
        setSelectedConversation(data[0]);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationComplete = () => {
    // Find next conversation
    const currentIndex = conversations.findIndex(c => c.id === selectedConversation?.id);
    if (currentIndex < conversations.length - 1) {
      setSelectedConversation(conversations[currentIndex + 1]);
    } else {
      // All conversations completed
      alert('🎉 Congratulations! You completed all conversations in this topic!');
      navigate(journeyId ? `/topics/${id}?journeyId=${journeyId}` : `/topics/${id}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading conversations...</div>
        </div>
      </Layout>
    );
  }

  if (error || conversations.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-600 mb-4">{error || 'No conversations available for this topic'}</div>
          <button
            onClick={() => navigate(journeyId ? `/topics/${id}?journeyId=${journeyId}` : `/topics/${id}`)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Back to Topic
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(journeyId ? `/topics/${id}?journeyId=${journeyId}` : `/topics/${id}`)}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Topic
          </button>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            💬 Conversation Practice
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Practice real-world dialogues with audio playback
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversation List (Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Conversations ({conversations.length})
              </h3>
              <div className="space-y-2">
                {conversations.map((conv, index) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation?.id === conv.id
                        ? 'bg-indigo-100 border-2 border-indigo-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}. {conv.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {conv.lines.length} lines
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        conv.difficultyLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                        conv.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {conv.difficultyLevel.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Conversation Player (Main Content) */}
          <div className="lg:col-span-3">
            {selectedConversation && (
              <ConversationPlayer
                conversation={selectedConversation}
                onComplete={handleConversationComplete}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TopicConversations;
