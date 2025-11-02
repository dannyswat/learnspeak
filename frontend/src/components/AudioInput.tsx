import React, { useState, useRef, useEffect } from 'react';
import { uploadService } from '../services/wordService';
import ttsService from '../services/ttsService';
import { convertBlobToMp3 } from '../utils/audioConverter';

interface AudioInputProps {
  value: string;
  onChange: (url: string) => void;
  onGenerateTTS?: () => Promise<{ text: string; languageCode?: string }>;
  languageCode?: string; // Add direct language code prop for voice selection
  label?: string;
  showRecordButton?: boolean;
  showTTSButton?: boolean;
  disabled?: boolean;
}

const AudioInput: React.FC<AudioInputProps> = ({
  value,
  onChange,
  onGenerateTTS,
  languageCode,
  label = 'Audio',
  showRecordButton = true,
  showTTSButton = true,
  disabled = false,
}) => {
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [generatingTTS, setGeneratingTTS] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [convertingAudio, setConvertingAudio] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const voiceSelectorRef = useRef<HTMLDivElement | null>(null);

  // Close voice selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        voiceSelectorRef.current &&
        !voiceSelectorRef.current.contains(event.target as Node)
      ) {
        setShowVoiceSelector(false);
      }
    };

    if (showVoiceSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVoiceSelector]);

  // Voice options for different languages
  const voiceOptions: { [key: string]: { name: string; voice: string; gender: string }[] } = {
    'en-US': [
      { name: 'Jenny (Female)', voice: 'en-US-JennyNeural', gender: 'Female' },
      { name: 'Guy (Male)', voice: 'en-US-GuyNeural', gender: 'Male' },
      { name: 'Aria (Female)', voice: 'en-US-AriaNeural', gender: 'Female' },
      { name: 'Davis (Male)', voice: 'en-US-DavisNeural', gender: 'Male' },
    ],
    'zh-HK': [
      { name: 'HiuMaan (Female)', voice: 'zh-HK-HiuMaanNeural', gender: 'Female' },
      { name: 'WanLung (Male)', voice: 'zh-HK-WanLungNeural', gender: 'Male' },
      { name: 'HiuGaai (Female)', voice: 'zh-HK-HiuGaaiNeural', gender: 'Female' },
    ],
    'zh-CN': [
      { name: 'Xiaoxiao (Female)', voice: 'zh-CN-XiaoxiaoNeural', gender: 'Female' },
      { name: 'Yunyang (Male)', voice: 'zh-CN-YunyangNeural', gender: 'Male' },
      { name: 'Xiaoyi (Female)', voice: 'zh-CN-XiaoyiNeural', gender: 'Female' },
      { name: 'Yunjian (Male)', voice: 'zh-CN-YunjianNeural', gender: 'Male' },
    ],
    'es': [
      { name: 'Elvira (Female)', voice: 'es-ES-ElviraNeural', gender: 'Female' },
      { name: 'Alvaro (Male)', voice: 'es-ES-AlvaroNeural', gender: 'Male' },
      { name: 'Abril (Female)', voice: 'es-ES-AbrilNeural', gender: 'Female' },
      { name: 'Arnold (Male)', voice: 'es-ES-ArnoldNeural', gender: 'Male' },
    ],
    'fr': [
      { name: 'Denise (Female)', voice: 'fr-FR-DeniseNeural', gender: 'Female' },
      { name: 'Henri (Male)', voice: 'fr-FR-HenriNeural', gender: 'Male' },
      { name: 'Brigitte (Female)', voice: 'fr-FR-BrigitteNeural', gender: 'Female' },
      { name: 'Alain (Male)', voice: 'fr-FR-AlainNeural', gender: 'Male' },
    ],
    'ja': [
      { name: 'Nanami (Female)', voice: 'ja-JP-NanamiNeural', gender: 'Female' },
      { name: 'Keita (Male)', voice: 'ja-JP-KeitaNeural', gender: 'Male' },
      { name: 'Aoi (Female)', voice: 'ja-JP-AoiNeural', gender: 'Female' },
      { name: 'Daichi (Male)', voice: 'ja-JP-DaichiNeural', gender: 'Male' },
    ],
    'ko': [
      { name: 'SunHi (Female)', voice: 'ko-KR-SunHiNeural', gender: 'Female' },
      { name: 'InJoon (Male)', voice: 'ko-KR-InJoonNeural', gender: 'Male' },
      { name: 'JiMin (Female)', voice: 'ko-KR-JiMinNeural', gender: 'Female' },
      { name: 'BongJin (Male)', voice: 'ko-KR-BongJinNeural', gender: 'Male' },
    ],
  };

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
      // Add cache buster to force browser to reload the newly uploaded audio
      onChange(uploadService.addCacheBuster(response.url));
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
        
        try {
          setConvertingAudio(true);
          
          // Convert webm to MP3 on client side
          let mp3Blob: Blob;
          try {
            mp3Blob = await convertBlobToMp3(audioBlob, 128);
          } catch (convertError) {
            console.error('MP3 conversion failed, uploading original format:', convertError);
            // Fallback: upload as-is if conversion fails
            mp3Blob = audioBlob;
          }
          
          setConvertingAudio(false);
          setUploadingAudio(true);
          
          const audioFile = new File([mp3Blob], 'recording.mp3', { type: 'audio/mpeg' });

          // Upload the recorded audio
          const response = await uploadService.uploadAudio(audioFile);
          // Add cache buster to force browser to reload the newly recorded audio
          onChange(uploadService.addCacheBuster(response.url));
        } catch (err) {
          const error = err as { response?: { data?: { message?: string } } };
          alert(error.response?.data?.message || 'Failed to upload audio');
        } finally {
          setUploadingAudio(false);
          setConvertingAudio(false);
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
        voice: selectedVoice || undefined,
      });

      // Add cache buster to force browser to reload the newly generated audio
      onChange(uploadService.addCacheBuster(result.audioUrl));
      
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to generate audio');
    } finally {
      setGeneratingTTS(false);
    }
  };

  const handleVoiceSelect = (voice: string) => {
    setSelectedVoice(voice);
    setShowVoiceSelector(false);
  };

  // Get voices for current language
  const getCurrentVoices = () => {
    if (!languageCode) return [];
    return voiceOptions[languageCode] || [];
  };

  const getSelectedVoiceName = () => {
    if (!selectedVoice) return null;
    const voices = getCurrentVoices();
    const voice = voices.find(v => v.voice === selectedVoice);
    return voice?.name || null;
  };

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRemoveAudio = async () => {
    if (!value) return;

    // If the audio URL is from TTS cache, delete it from server
    if (value.includes('/uploads/tts-cache/')) {
      try {
        // Remove cache buster params to get the clean URL
        const cleanUrl = value.split('?')[0];
        await ttsService.deleteCachedAudio(cleanUrl);
      } catch (err) {
        console.error('Failed to delete cached audio:', err);
        // Continue with removal even if cache deletion fails
      }
    }

    // Clear the audio URL
    onChange('');
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
                onClick={handleRemoveAudio}
                className="text-sm text-red-600 hover:text-red-500 font-medium"
              >
                Remove
              </button>
            )}
          </div>
        )}

        {/* Recording Controls */}
        {!disabled && !value && (
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
            ) : convertingAudio ? (
              <div className="flex items-center space-x-2 bg-cyan-50 border border-cyan-200 px-4 py-2 rounded-lg">
                <svg
                  className="animate-spin h-5 w-5 text-cyan-600"
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
                <span className="text-sm font-medium text-cyan-700">Converting to MP3...</span>
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
                  <div className="relative flex items-center" ref={voiceSelectorRef}>
                    <button
                      type="button"
                      onClick={handleGenerateTTS}
                      className="py-2 px-3 border border-purple-300 rounded-l-md shadow-sm text-sm leading-4 font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      🔊 Generate
                    </button>
                    {languageCode && getCurrentVoices().length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                        className="py-2 px-2 border-l-0 border border-purple-300 rounded-r-md shadow-sm text-sm leading-4 font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        title="Select voice"
                      >
                        ⋯
                      </button>
                    )}
                    
                    {/* Voice Selector Popup */}
                    {showVoiceSelector && languageCode && (
                      <div className="absolute top-full mt-1 right-0 z-10 bg-white rounded-md shadow-lg border border-gray-200 min-w-[200px]">
                        <div className="p-2">
                          <div className="text-xs font-semibold text-gray-500 px-2 py-1">
                            Select Voice
                            {getSelectedVoiceName() && (
                              <span className="ml-2 text-purple-600">
                                ({getSelectedVoiceName()})
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 max-h-64 overflow-y-auto">
                            {getCurrentVoices().map((voice) => (
                              <button
                                key={voice.voice}
                                type="button"
                                onClick={() => handleVoiceSelect(voice.voice)}
                                className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-purple-50 transition-colors ${
                                  selectedVoice === voice.voice
                                    ? 'bg-purple-100 text-purple-900 font-medium'
                                    : 'text-gray-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{voice.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {voice.gender === 'Male' ? '♂' : '♀'}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
