import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { conversationService } from '../services/conversationService';
import type { Conversation } from '../types/conversation';
import Layout from '../components/Layout';
import ConversationPlayer from '../components/ConversationPlayer';

const ConversationPreview: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get the return path from location state or default to topics
  const returnPath = (location.state as { from?: string })?.from || '/topics';

  useEffect(() => {
    if (id) {
      loadConversation(parseInt(id));
    }
  }, [id]);

  const loadConversation = async (conversationId: number) => {
    try {
      setLoading(true);
      const data = await conversationService.getConversation(conversationId);
      setConversation(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    alert('🎉 Preview completed!');
    navigate(returnPath);
  };

  const handleBack = () => {
    navigate(returnPath);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading conversation...</div>
        </div>
      </Layout>
    );
  }

  if (error || !conversation) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-600 mb-4">{error || 'Conversation not found'}</div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Go Back
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
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              💬 Conversation Preview
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
              Preview Mode
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Preview how this conversation will appear to learners
          </p>
        </div>

        {/* Conversation Player */}
        <ConversationPlayer 
          conversation={conversation} 
          onComplete={handleComplete}
        />

        {/* Back Button at Bottom */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Management
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ConversationPreview;
