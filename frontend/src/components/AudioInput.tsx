import React, { useState, useRef, useEffect } from 'react';
import { uploadService } from '../services/wordService';
import ttsService from '../services/ttsService';

interface AudioInputProps {
  value: string;
  onChange: (url: string) => void;
  onGenerateTTS?: () => Promise<{ text: string; languageCode?: string }>;
  label?: string;
  showRecordButton?: boolean;
  showTTSButton?: boolean;
  disabled?: boolean;
}

const AudioInput: React.FC<AudioInputProps> = ({
  value,
  onChange,
  onGenerateTTS,
  label = 'Audio',
  showRecordButton = true,
  showTTSButton = true,
  disabled = false,
}) => {
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [generatingTTS, setGeneratingTTS] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAudio(true);
      const response = await uploadService.uploadAudio(file);
      onChange(response.url);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to upload audio');
    } finally {
      setUploadingAudio(false);
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
        // Create audio file from recorded chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

        // Upload the recorded audio
        try {
          setUploadingAudio(true);
          const response = await uploadService.uploadAudio(audioFile);
          onChange(response.url);
        } catch (err) {
          const error = err as { response?: { data?: { message?: string } } };
          alert(error.response?.data?.message || 'Failed to upload audio');
        } finally {
          setUploadingAudio(false);
        }

        // Stop all tracks
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

      // Start timer
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

  const handleGenerateTTS = async () => {
    if (!onGenerateTTS) return;

    try {
      setGeneratingTTS(true);
      const { text, languageCode } = await onGenerateTTS();

      if (!text) {
        alert('Please enter text first');
        return;
      }

      const result = await ttsService.generateAudio({
        text,
        language: languageCode || 'en-US',
      });

      onChange(result.audioUrl);
      
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to generate audio');
    } finally {
      setGeneratingTTS(false);
    }
  };

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 space-y-2">
        {/* Audio Player */}
        {value && (
          <div className="flex items-center space-x-2">
            <audio src={uploadService.getFileUrl(value)} controls className="h-10 flex-1" />
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-sm text-red-600 hover:text-red-500 font-medium"
              >
                Remove
              </button>
            )}
          </div>
        )}

        {/* Recording Controls */}
        {!disabled && (
          <div className="flex items-center space-x-2">
            {isRecording ? (
              <div className="flex items-center space-x-2 flex-1">
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-4 py-2 rounded-lg flex-1">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-red-700">
                    Recording: {formatRecordingTime(recordingTime)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-sm text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  ⏹ Stop
                </button>
              </div>
            ) : uploadingAudio ? (
              <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm font-medium text-blue-700">Uploading...</span>
              </div>
            ) : generatingTTS ? (
              <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 px-4 py-2 rounded-lg">
                <svg
                  className="animate-spin h-5 w-5 text-purple-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm font-medium text-purple-700">Generating...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  📤 Upload
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="sr-only"
                  />
                </label>

                {showRecordButton && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    🎤 Record
                  </button>
                )}

                {showTTSButton && onGenerateTTS && (
                  <button
                    type="button"
                    onClick={handleGenerateTTS}
                    className="py-2 px-3 border border-purple-300 rounded-md shadow-sm text-sm leading-4 font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    🔊 Generate
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioInput;
