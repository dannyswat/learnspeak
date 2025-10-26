import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { conversationService } from '../services/conversationService';
import { topicService } from '../services/topicService';
import type { Conversation } from '../types/conversation';
import type { Topic } from '../types/topic';
import Layout from '../components/Layout';

const ConversationManagement: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadTopic(parseInt(id));
      loadConversations(parseInt(id));
    }
  }, [id]);

  const loadTopic = async (topicId: number) => {
    try {
      const data = await topicService.getTopic(topicId, false);
      setTopic(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load topic');
    }
  };

  const loadConversations = async (topicId: number) => {
    try {
      setLoading(true);
      const data = await conversationService.getConversationsByTopic(topicId);
      setConversations(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (conversationId: number) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      setDeleting(conversationId);
      await conversationService.deleteConversation(conversationId);
      // Reload conversations
      if (id) {
        await loadConversations(parseInt(id));
      }
      alert('Conversation deleted successfully');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete conversation');
    } finally {
      setDeleting(null);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !topic) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error && !topic) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/topics')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Back to Topics
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/topics/${id}`)}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Topic
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                💬 Manage Conversations
              </h1>
              {topic && (
                <p className="text-sm sm:text-base text-gray-600">
                  Topic: <span className="font-semibold">{topic.name}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => navigate(`/topics/${id}/conversations/create`)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              ➕ Create Conversation
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 About Conversations</h3>
          <p className="text-sm text-blue-800">
            Create interactive dialogue scenarios for learners to practice real-world conversations. 
            Each conversation includes multiple lines with speaker roles, text, audio, and optional images 
            to help learners visualize the context.
          </p>
        </div>

        {/* Conversations List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Conversations ({conversations.length})
          </h2>

          {loading && conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first conversation to help learners practice dialogues
              </p>
              <button
                onClick={() => navigate(`/topics/${id}/conversations/create`)}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                ➕ Create First Conversation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {conversation.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(conversation.difficultyLevel)}`}>
                          {conversation.difficultyLevel}
                        </span>
                      </div>

                      {conversation.description && (
                        <p className="text-sm text-gray-600 mb-3">{conversation.description}</p>
                      )}

                      {conversation.context && (
                        <p className="text-xs text-gray-500 italic mb-3">
                          💡 Context: {conversation.context}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {conversation.lines.length} lines
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          {conversation.languageName}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => navigate(`/conversations/${conversation.id}/preview`, {
                          state: { from: `/topics/${id}/conversations/manage` }
                        })}
                        className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        title="Preview conversation"
                      >
                        👁️ Preview
                      </button>
                      <button
                        onClick={() => navigate(`/topics/${id}/conversations/${conversation.id}/edit`)}
                        className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        title="Edit conversation"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(conversation.id)}
                        disabled={deleting === conversation.id}
                        className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                        title="Delete conversation"
                      >
                        {deleting === conversation.id ? '...' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ConversationManagement;
