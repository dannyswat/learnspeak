import React, { useState } from 'react';
import ttsService from '../services/ttsService';

interface CustomAudioGenerationButtonProps {
  onAudioGenerated: (audioUrl: string) => void;
  className?: string;
}

const CustomAudioGenerationButton: React.FC<CustomAudioGenerationButtonProps> = ({
  onAudioGenerated,
  className = "bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600"
}) => {
  const [showTTSModal, setShowTTSModal] = useState(false);
  const [ttsText, setTtsText] = useState('');
  const [ttsVoice, setTtsVoice] = useState('zh-HK-HiuMaanNeural');
  const [generatingTTS, setGeneratingTTS] = useState(false);

  const handleGenerateTTS = async () => {
    if (!ttsText.trim()) {
      alert('Please enter text to generate audio');
      return;
    }

    try {
      setGeneratingTTS(true);
      const response = await ttsService.generateAudio({
        text: ttsText,
        voice: ttsVoice,
        language: 'zh-HK', // Default language, could be made dynamic
      });
      
      onAudioGenerated(response.audioUrl);
      setShowTTSModal(false);
      setTtsText('');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to generate audio');
    } finally {
      setGeneratingTTS(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowTTSModal(true)}
        className={className}
      >
        🤖 Generate AI Audio
      </button>

      {/* TTS Generation Modal */}
      {showTTSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Generate AI Audio
              </h3>
              <button
                onClick={() => {
                  setShowTTSModal(false);
                  setTtsText('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text to Speech
                </label>
                <textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="Enter the text you want to convert to speech..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  The AI will generate natural-sounding speech from your text.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Selection
                </label>
                <select
                  value={ttsVoice}
                  onChange={(e) => setTtsVoice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="zh-HK-HiuMaanNeural">Cantonese (Hong Kong) - Female (HiuMaan)</option>
                  <option value="zh-HK-HiuGaaiNeural">Cantonese (Hong Kong) - Female (HiuGaai)</option>
                  <option value="zh-HK-WanLungNeural">Cantonese (Hong Kong) - Male (WanLung)</option>
                  <option value="zh-CN-XiaoxiaoNeural">Mandarin (China) - Female (Xiaoxiao)</option>
                  <option value="zh-CN-YunxiNeural">Mandarin (China) - Male (Yunxi)</option>
                  <option value="en-US-JennyNeural">English (US) - Female (Jenny)</option>
                  <option value="en-US-GuyNeural">English (US) - Male (Guy)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleGenerateTTS}
                  disabled={generatingTTS || !ttsText.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  {generatingTTS ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    '🤖 Generate Audio'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowTTSModal(false);
                    setTtsText('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomAudioGenerationButton;
