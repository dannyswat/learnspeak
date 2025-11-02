import React, { useState, useRef, useEffect } from 'react';
import { uploadService } from '../services/wordService';
import { convertBlobToMp3 } from '../utils/audioConverter';
import { generateImage } from '../services/imageGenerationService';
import ttsService from '../services/ttsService';
import { determineContentType, type ContentType } from '../utils/typeDetector';
import ImageBrowser from './ImageBrowser';

interface DynamicInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

type InputMode = ContentType;

const DynamicInput: React.FC<DynamicInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter text, select image, or record audio',
  disabled = false,
  label = '',
}) => {
  const [mode, setMode] = useState<InputMode>('text');
  const [textValue, setTextValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [showImageBrowser, setShowImageBrowser] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [audioText, setAudioText] = useState('');
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [showImageGenerateDialog, setShowImageGenerateDialog] = useState(false);
  const [showAudioGenerateDialog, setShowAudioGenerateDialog] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Determine input type based on initial value or when value changes
  useEffect(() => {
    if (value) {
      const detectedType = determineContentType(value);
      setMode(detectedType);
      // If it's text mode and value is text, set it in textValue
      if (detectedType === 'text') {
        setTextValue(value);
      }
    }
  }, [value]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTextChange = (text: string) => {
    setTextValue(text);
    onChange(text);
  };

  const handleImageSelect = (imageUrl: string) => {
    onChange(imageUrl);
    setMode('image');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await uploadService.uploadImage(file);
      onChange(uploadService.addCacheBuster(response.url));
      setMode('image');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        try {
          setConverting(true);

          let mp3Blob: Blob;
          try {
            mp3Blob = await convertBlobToMp3(audioBlob, 128);
          } catch (convertError) {
            console.error('MP3 conversion failed, uploading original format:', convertError);
            mp3Blob = audioBlob;
          }

          setConverting(false);
          setUploading(true);

          const audioFile = new File([mp3Blob], 'recording.mp3', { type: 'audio/mpeg' });
          const response = await uploadService.uploadAudio(audioFile);
          onChange(uploadService.addCacheBuster(response.url));
          setMode('audio');
        } catch (err) {
          const error = err as { response?: { data?: { message?: string } } };
          alert(error.response?.data?.message || 'Failed to upload audio');
        } finally {
          setUploading(false);
          setConverting(false);
        }

        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleClear = () => {
    onChange('');
    setTextValue('');
    setMode('text');
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      alert('Please enter a prompt for image generation');
      return;
    }

    try {
      setGeneratingImage(true);
      const response = await generateImage({
        word: imagePrompt,
        customPrompt: imagePrompt,
      });
      onChange(uploadService.addCacheBuster(response.local_path));
      setImagePrompt('');
      setShowImageGenerateDialog(false);
      setMode('image');
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to generate image');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!audioText.trim()) {
      alert('Please enter text for audio generation');
      return;
    }

    try {
      setGeneratingAudio(true);
      const response = await ttsService.generateAudio({
        text: audioText,
      });
      onChange(uploadService.addCacheBuster(response.audioUrl));
      setAudioText('');
      setShowAudioGenerateDialog(false);
      setMode('audio');
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to generate audio');
    } finally {
      setGeneratingAudio(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setMode('text')}
          disabled={disabled || !!(value && mode !== 'text')}
          title={value && mode !== 'text' ? 'Clear the current value to change input type' : ''}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === 'text'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          📝 Text
        </button>
        <button
          type="button"
          onClick={() => setMode('image')}
          disabled={disabled || !!(value && mode !== 'image')}
          title={value && mode !== 'image' ? 'Clear the current value to change input type' : ''}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === 'image'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          🖼️ Image
        </button>
        <button
          type="button"
          onClick={() => setMode('audio')}
          disabled={disabled || !!(value && mode !== 'audio')}
          title={value && mode !== 'audio' ? 'Clear the current value to change input type' : ''}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === 'audio'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          🎤 Audio
        </button>
      </div>

      {/* Mode Content */}
      <div className="mt-4">
        {mode === 'text' && (
          <div className="space-y-2">
            <input
              type="text"
              value={textValue}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            {textValue && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'image' && (
          <div className="space-y-3">
            {value && (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.gif') || value.includes('.webp')) ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={uploadService.getFileUrl(value)}
                  alt="Selected"
                  className="max-h-48 max-w-full rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                  }}
                />
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <label className="cursor-pointer flex-1 py-2 px-3 border border-gray-300 rounded-lg shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  📤 Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading || disabled}
                    className="sr-only"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowImageBrowser(true)}
                  disabled={disabled}
                  className="flex-1 py-2 px-3 border border-blue-300 rounded-lg shadow-sm text-sm leading-4 font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📁 Browse
                </button>
                <button
                  type="button"
                  onClick={() => setShowImageGenerateDialog(true)}
                  disabled={disabled || generatingImage}
                  className="flex-1 py-2 px-3 border border-purple-300 rounded-lg shadow-sm text-sm leading-4 font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingImage ? '✨ Generating...' : '✨ Generate'}
                </button>
              </div>
            )}
            {uploading && (
              <div className="flex items-center justify-center py-2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>
        )}

        {mode === 'audio' && (
          <div className="space-y-3">
            {value && (value.includes('.mp3') || value.includes('.webm') || value.includes('.wav')) ? (
              <div className="flex flex-col gap-3">
                <audio
                  src={uploadService.getFileUrl(value)}
                  controls
                  className="w-full h-10 rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                {isRecording ? (
                  <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-red-700">
                      Recording: {formatTime(recordingTime)}
                    </span>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="ml-auto bg-red-600 text-white py-1 px-3 rounded text-sm font-medium hover:bg-red-700"
                    >
                      ⏹ Stop
                    </button>
                  </div>
                ) : converting ? (
                  <div className="flex items-center justify-center py-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                    <svg
                      className="animate-spin h-5 w-5 text-cyan-600 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium text-cyan-700">Converting to MP3...</span>
                  </div>
                ) : generatingAudio ? (
                  <div className="flex items-center justify-center py-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <svg
                      className="animate-spin h-5 w-5 text-purple-600 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium text-purple-700">Generating audio...</span>
                  </div>
                ) : uploading ? (
                  <div className="flex items-center justify-center py-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-600 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-700">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={disabled}
                      className="flex-1 py-2 px-3 border border-gray-300 rounded-lg shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🎤 Record
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAudioGenerateDialog(true)}
                      disabled={disabled || generatingAudio}
                      className="flex-1 py-2 px-3 border border-purple-300 rounded-lg shadow-sm text-sm leading-4 font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingAudio ? '🔊 Generating...' : '🔊 Generate'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Generate Dialog */}
      {showImageGenerateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Image with AI</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image you want..."
                disabled={generatingImage}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowImageGenerateDialog(false)}
                  disabled={generatingImage}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={generatingImage || !imagePrompt.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingImage ? '✨ Generating...' : '✨ Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Generate Dialog */}
      {showAudioGenerateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Audio with TTS</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={audioText}
                onChange={(e) => setAudioText(e.target.value)}
                placeholder="Enter text to convert to speech..."
                disabled={generatingAudio}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAudioGenerateDialog(false)}
                  disabled={generatingAudio}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAudio}
                  disabled={generatingAudio || !audioText.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingAudio ? '🔊 Generating...' : '🔊 Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Browser Modal */}
      <ImageBrowser
        isOpen={showImageBrowser}
        onClose={() => setShowImageBrowser(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
};

export default DynamicInput;
