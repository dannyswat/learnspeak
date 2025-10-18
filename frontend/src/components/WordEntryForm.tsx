import React from 'react';
import ImageInput from './ImageInput';
import AudioInput from './AudioInput';
import type { Language } from '../types/word';

export interface WordEntryData {
  baseWord: string;
  translation: string;
  romanization: string;
  notes: string;
  imageUrl: string;
  audioUrl: string;
}

interface WordEntryFormProps {
  word: WordEntryData;
  index: number;
  onChange: (index: number, field: keyof WordEntryData, value: string) => void;
  onRemove?: (index: number) => void;
  languages: Language[];
  targetLanguage: number | null;
  disabled?: boolean;
  showRemoveButton?: boolean;
  readOnlyBaseWord?: boolean;
}

/**
 * Reusable word entry form component for bulk operations
 */
const WordEntryForm: React.FC<WordEntryFormProps> = ({
  word,
  index,
  onChange,
  onRemove,
  languages,
  targetLanguage,
  disabled = false,
  showRemoveButton = true,
  readOnlyBaseWord = false,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-medium text-green-700">
          {index + 1}
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              English Word *
            </label>
            <input
              type="text"
              value={word.baseWord}
              onChange={(e) => onChange(index, 'baseWord', e.target.value)}
              placeholder="e.g., Hello"
              disabled={disabled || readOnlyBaseWord}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Translation *
            </label>
            <input
              type="text"
              value={word.translation}
              onChange={(e) => onChange(index, 'translation', e.target.value)}
              placeholder="e.g., 你好"
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Romanization
            </label>
            <input
              type="text"
              value={word.romanization}
              onChange={(e) => onChange(index, 'romanization', e.target.value)}
              placeholder="e.g., nei5 hou2"
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={word.notes}
              onChange={(e) => onChange(index, 'notes', e.target.value)}
              placeholder="e.g., Informal greeting"
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {showRemoveButton && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={disabled}
            className="flex-shrink-0 w-8 h-8 text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove word"
          >
            ✕
          </button>
        )}
      </div>

      {/* Image and Audio Section - Side by Side */}
      <div className="ml-12 grid grid-cols-2 gap-6">
        {/* Image Upload Section - Left */}
        <ImageInput
          label="Image (optional)"
          value={word.imageUrl}
          onChange={(url) => onChange(index, 'imageUrl', url)}
          onGenerateImage={async () => ({
            word: word.baseWord,
            translation: word.translation
          })}
          showGenerateButton={true}
          disabled={disabled}
        />

        {/* Audio Recording Section - Right */}
        <AudioInput
          label="Audio Pronunciation (optional)"
          value={word.audioUrl}
          onChange={(url) => onChange(index, 'audioUrl', url)}
          onGenerateTTS={async () => ({
            text: word.translation,
            languageCode: languages.find(l => l.id === targetLanguage)?.code
          })}
          showRecordButton={true}
          showTTSButton={true}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default WordEntryForm;
