import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { conversationService } from '../services/conversationService';
import type { Conversation } from '../types/conversation';
import ConversationForm from '../components/ConversationForm';
import Layout from '../components/Layout';
import { useInvalidateConversationsAndTopic } from '../hooks/useConversation';

const ConversationEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id, conversationId } = useParams<{ id: string; conversationId: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const invalidateConversationsAndTopic = useInvalidateConversationsAndTopic();

  useEffect(() => {
    if (conversationId) {
      loadConversation(parseInt(conversationId));
    }
  }, [conversationId]);

  const loadConversation = async (convId: number) => {
    try {
      setLoading(true);
      const data = await conversationService.getConversation(convId);
      setConversation(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: {
    title: string;
    description: string;
    context: string;
    difficultyLevel: string;
    scenarioAudioUrl?: string;
    scenarioImageUrl?: string;
    lines: {
      speakerRole: string;
      englishText: string;
      targetText: string;
      romanization: string;
      audioUrl: string;
      imageUrl: string;
      isLearnerLine: boolean;
    }[];
  }) => {
    if (!conversation) return;

    try {
      // Update the conversation details
      await conversationService.updateConversation(conversation.id, {
        title: data.title,
        description: data.description,
        context: data.context,
        difficultyLevel: data.difficultyLevel as 'beginner' | 'intermediate' | 'advanced',
        scenarioAudioUrl: data.scenarioAudioUrl,
        scenarioImageUrl: data.scenarioImageUrl,
      });

      // Delete all existing lines
      for (const line of conversation.lines) {
        await conversationService.deleteLine(conversation.id, line.id);
      }

      // Add new lines
      for (let i = 0; i < data.lines.length; i++) {
        const line = data.lines[i];
        await conversationService.addLine(conversation.id, {
          sequenceOrder: i + 1,
          speakerRole: line.speakerRole,
          englishText: line.englishText,
          targetText: line.targetText,
          romanization: line.romanization,
          audioUrl: line.audioUrl,
          imageUrl: line.imageUrl,
          isLearnerLine: line.isLearnerLine,
        });
      }

      // Invalidate conversation queries
      invalidateConversationsAndTopic(parseInt(id!));

      alert('Conversation updated successfully!');
      navigate(`/topics/${id}/conversations/manage`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to update conversation');
      throw err;
    }
  };

  const handleCancel = () => {
    navigate(`/topics/${id}/conversations/manage`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
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
            onClick={() => navigate(`/topics/${id}/conversations/manage`)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Back to Conversations
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/topics/${id}/conversations/manage`)}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Conversations
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Edit Conversation
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {conversation.title} - {conversation.languageName}
          </p>
        </div>

        {/* Form */}
        <ConversationForm
          initialData={{
            title: conversation.title,
            description: conversation.description,
            context: conversation.context,
            difficultyLevel: conversation.difficultyLevel,
            scenarioAudioUrl: conversation.scenarioAudioUrl,
            scenarioImageUrl: conversation.scenarioImageUrl,
            lines: conversation.lines,
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          languageCode={conversation.languageCode}
        />
      </div>
    </Layout>
  );
};

export default ConversationEdit;
