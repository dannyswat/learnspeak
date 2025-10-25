import React, { useState, useEffect } from 'react';
import AudioInput from './AudioInput';
import ImageInput from './ImageInput';
import type { ConversationLine } from '../types/conversation';

interface ConversationFormProps {
  initialData?: {
    title: string;
    description: string;
    context: string;
    difficultyLevel: string;
    scenarioAudioUrl?: string;
    scenarioImageUrl?: string;
    lines: ConversationLine[];
  };
  onSubmit: (data: {
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
  }) => Promise<void>;
  onCancel: () => void;
  languageCode: string;
}

interface LineFormData {
  tempId: string;
  speakerRole: string;
  englishText: string;
  targetText: string;
  romanization: string;
  audioUrl: string;
  imageUrl: string;
  isLearnerLine: boolean;
  showRomanization?: boolean;
}

const ConversationForm: React.FC<ConversationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [context, setContext] = useState(initialData?.context || '');
  const [difficultyLevel, setDifficultyLevel] = useState(initialData?.difficultyLevel || 'beginner');
  const [scenarioAudioUrl, setScenarioAudioUrl] = useState(initialData?.scenarioAudioUrl || '');
  const [scenarioImageUrl, setScenarioImageUrl] = useState(initialData?.scenarioImageUrl || '');
  const [lines, setLines] = useState<LineFormData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData?.lines && initialData.lines.length > 0) {
      setLines(
        initialData.lines.map((line, index) => ({
          tempId: `existing-${index}`,
          speakerRole: line.speakerRole || '',
          englishText: line.englishText || '',
          targetText: line.targetText || '',
          romanization: line.romanization || '',
          audioUrl: line.audioUrl || '',
          imageUrl: line.imageUrl || '',
          isLearnerLine: line.isLearnerLine || false,
          showRomanization: !!(line.romanization || '').trim(),
        }))
      );
    } else {
      // Start with one empty line
      setLines([createEmptyLine()]);
    }
  }, [initialData]);

  const createEmptyLine = (): LineFormData => ({
    tempId: `new-${Date.now()}-${Math.random()}`,
    speakerRole: '',
    englishText: '',
    targetText: '',
    romanization: '',
    audioUrl: '',
    imageUrl: '',
    isLearnerLine: false,
    showRomanization: false,
  });

  const handleAddLine = () => {
    setLines([...lines, createEmptyLine()]);
  };

  const handleRemoveLine = (tempId: string) => {
    if (lines.length <= 1) {
      alert('A conversation must have at least one line');
      return;
    }
    setLines(lines.filter((line) => line.tempId !== tempId));
  };

  const handleLineChange = (tempId: string, field: keyof LineFormData, value: string) => {
    setLines(
      lines.map((line) =>
        line.tempId === tempId ? { ...line, [field]: value } : line
      )
    );
  };

  const handleMoveLine = (index: number, direction: 'up' | 'down') => {
    const newLines = [...lines];
    if (direction === 'up' && index > 0) {
      [newLines[index - 1], newLines[index]] = [newLines[index], newLines[index - 1]];
    } else if (direction === 'down' && index < lines.length - 1) {
      [newLines[index], newLines[index + 1]] = [newLines[index + 1], newLines[index]];
    }
    setLines(newLines);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }

    if (lines.length === 0) {
      setError('At least one conversation line is required');
      return false;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.speakerRole.trim()) {
        setError(`Line ${i + 1}: Speaker role is required`);
        return false;
      }
      if (!line.targetText.trim() && !line.englishText.trim()) {
        setError(`Line ${i + 1}: Text is required`);
        return false;
      }
      if (!line.audioUrl.trim()) {
        setError(`Line ${i + 1}: Audio is required`);
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        context: context.trim(),
        difficultyLevel,
        scenarioAudioUrl: scenarioAudioUrl || undefined,
        scenarioImageUrl: scenarioImageUrl || undefined,
        lines: lines.map((line) => ({
          speakerRole: line.speakerRole.trim(),
          englishText: line.englishText.trim(),
          targetText: line.targetText.trim(),
          romanization: line.romanization.trim(),
          audioUrl: line.audioUrl,
          imageUrl: line.imageUrl || '',
          isLearnerLine: line.isLearnerLine,
        })),
      });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save conversation');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., At the Restaurant"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Brief description of the conversation scenario"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Context
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Additional context or scenario setup"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level <span className="text-red-500">*</span>
            </label>
            <select
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Scenario Media */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Scenario Media (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AudioInput
                value={scenarioAudioUrl}
                onChange={setScenarioAudioUrl}
                label="Scenario Audio"
                showRecordButton={false}
                showTTSButton={true}
                onGenerateTTS={async () => ({
                  text: description || context || title,
                  languageCode: 'auto',
                })}
              />

              <ImageInput
                value={scenarioImageUrl}
                onChange={setScenarioImageUrl}
                label="Scenario Image"
                showGenerateButton={true}
                onGenerateImage={async () => ({
                  word: title,
                  translation: description,
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Lines */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Conversation Lines ({lines.length})
          </h3>
          <button
            type="button"
            onClick={handleAddLine}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            ➕ Add Line
          </button>
        </div>

        <div className="space-y-4">
          {lines.map((line, index) => (
            <div key={line.tempId} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Line {index + 1}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveLine(index, 'up')}
                      disabled={index === 0}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveLine(index, 'down')}
                      disabled={index === lines.length - 1}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLine(line.tempId)}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={lines.length <= 1}
                >
                  🗑️ Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Row 1: Speaker Role and Is Learner Line checkbox */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Speaker Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={line.speakerRole}
                      onChange={(e) => handleLineChange(line.tempId, 'speakerRole', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., Customer, Waiter, Person A"
                      required
                    />
                  </div>

                  <div className="flex items-end pb-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={line.isLearnerLine}
                        onChange={(e) => handleLineChange(line.tempId, 'isLearnerLine', e.target.checked ? 'true' : 'false')}
                        className="mr-2"
                      />
                      Is Learner Line
                    </label>
                  </div>
                </div>

                {/* Row 2: English Text and Target Language Text side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      English Text
                    </label>
                    <input
                      type="text"
                      value={line.englishText}
                      onChange={(e) => handleLineChange(line.tempId, 'englishText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="English translation..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Language Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={line.targetText}
                      onChange={(e) => handleLineChange(line.tempId, 'targetText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Target language text..."
                      required
                    />
                  </div>
                </div>

                {/* Row 3: Romanization (collapsible) */}
                {!line.showRomanization ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => handleLineChange(line.tempId, 'showRomanization', 'true')}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      + Add Romanization
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Romanization
                      <button
                        type="button"
                        onClick={() => {
                          handleLineChange(line.tempId, 'romanization', '');
                          handleLineChange(line.tempId, 'showRomanization', 'false');
                        }}
                        className="ml-2 text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </label>
                    <input
                      type="text"
                      value={line.romanization}
                      onChange={(e) => handleLineChange(line.tempId, 'romanization', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Phonetic romanization..."
                    />
                  </div>
                )}

                {/* Row 4: Audio and Image side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AudioInput
                    value={line.audioUrl}
                    onChange={(url) => handleLineChange(line.tempId, 'audioUrl', url)}
                    label="Audio *"
                    showRecordButton={true}
                    showTTSButton={true}
                    onGenerateTTS={async () => ({
                      text: line.targetText || line.englishText,
                      languageCode: 'auto',
                    })}
                  />

                  <ImageInput
                    value={line.imageUrl}
                    onChange={(url) => handleLineChange(line.tempId, 'imageUrl', url)}
                    label="Image (Optional)"
                    showGenerateButton={true}
                    onGenerateImage={async () => ({
                      word: line.targetText || line.englishText,
                      translation: line.englishText,
                    })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Saving...' : initialData ? 'Update Conversation' : 'Create Conversation'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ConversationForm;
