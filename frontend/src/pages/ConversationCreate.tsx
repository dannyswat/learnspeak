import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { conversationService } from '../services/conversationService';
import { topicService } from '../services/topicService';
import type { Topic } from '../types/topic';
import ConversationForm from '../components/ConversationForm';
import Layout from '../components/Layout';
import { useInvalidateConversationsAndTopic } from '../hooks/useConversation';

const ConversationCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const invalidateConversationsAndTopic = useInvalidateConversationsAndTopic();

  useEffect(() => {
    if (id) {
      loadTopic(parseInt(id));
    }
  }, [id]);

  const loadTopic = async (topicId: number) => {
    try {
      setLoading(true);
      const data = await topicService.getTopic(topicId, false);
      setTopic(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load topic');
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
    if (!topic || !topic.language) return;

    try {
      // Create the conversation with topic link
      await conversationService.createConversation({
        title: data.title,
        description: data.description,
        context: data.context,
        languageCode: topic.language.code,
        difficultyLevel: data.difficultyLevel as 'beginner' | 'intermediate' | 'advanced',
        scenarioAudioUrl: data.scenarioAudioUrl || '',
        scenarioImageUrl: data.scenarioImageUrl || '',
        topicId: parseInt(id!),
        lines: data.lines.map((line, index) => ({
          sequenceOrder: index + 1,
          speakerRole: line.speakerRole,
          englishText: line.englishText,
          targetText: line.targetText,
          romanization: line.romanization || '',
          audioUrl: line.audioUrl || '',
          imageUrl: line.imageUrl || '',
          isLearnerLine: line.isLearnerLine,
        })),
      });

      // Invalidate conversation queries
      invalidateConversationsAndTopic(parseInt(id!));

      alert('Conversation created successfully!');
      navigate(`/topics/${id}/conversations/manage`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to create conversation');
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

  if (error || !topic) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-600 mb-4">{error || 'Topic not found'}</div>
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
            Create New Conversation
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Topic: <span className="font-semibold">{topic.name}</span> ({topic.language?.name || 'Unknown'})
          </p>
        </div>

        {/* Form */}
        <ConversationForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          languageCode={topic.language?.code || ''}
        />
      </div>
    </Layout>
  );
};

export default ConversationCreate;
