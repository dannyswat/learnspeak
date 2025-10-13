package services

import (
	"crypto/md5"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/Microsoft/cognitive-services-speech-sdk-go/audio"
	"github.com/Microsoft/cognitive-services-speech-sdk-go/common"
	"github.com/Microsoft/cognitive-services-speech-sdk-go/speech"

	"dannyswat/learnspeak/config"
)

// TTSService handles text-to-speech generation using Azure Cognitive Services
type TTSService struct {
	config      *config.Config
	cacheDir    string
	audioFormat string
}

// TTSRequest represents a text-to-speech generation request
type TTSRequest struct {
	Text     string `json:"text" validate:"required"`
	Language string `json:"language"` // e.g., "zh-HK" for Cantonese
	Voice    string `json:"voice"`    // Optional: override default voice
}

// TTSResponse represents the response from TTS generation
type TTSResponse struct {
	AudioURL string `json:"audioUrl"`
	Cached   bool   `json:"cached"`
	Duration int    `json:"duration"` // in milliseconds
}

// NewTTSService creates a new TTS service instance
func NewTTSService(cfg *config.Config) *TTSService {
	// Create cache directory if it doesn't exist
	cacheDir := filepath.Join(cfg.UploadDir, "tts-cache")
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		fmt.Printf("Warning: Could not create TTS cache directory: %v\n", err)
	}

	return &TTSService{
		config:      cfg,
		cacheDir:    cacheDir,
		audioFormat: "audio-16khz-32kbitrate-mono-mp3", // High-quality MP3 format
	}
}

// GenerateAudio generates speech audio from text using Azure TTS
func (s *TTSService) GenerateAudio(req *TTSRequest) (*TTSResponse, error) {
	if req.Text == "" {
		return nil, errors.New("text is required")
	}

	// Check if Azure TTS is configured
	if s.config.AzureTTSKey == "" {
		return nil, errors.New("Azure TTS is not configured. Please set AZURE_TTS_KEY environment variable")
	}

	// Determine voice to use
	voice := req.Voice
	if voice == "" {
		voice = s.getDefaultVoice(req.Language)
	}

	// Generate cache key based on text, language, and voice
	cacheKey := s.generateCacheKey(req.Text, req.Language, voice)
	audioFilename := cacheKey + ".mp3"
	audioPath := filepath.Join(s.cacheDir, audioFilename)

	// Check cache if enabled
	if s.config.TTSCacheEnabled {
		if _, err := os.Stat(audioPath); err == nil {
			// Cache hit - return cached audio
			audioURL := fmt.Sprintf("/uploads/tts-cache/%s", audioFilename)
			return &TTSResponse{
				AudioURL: audioURL,
				Cached:   true,
			}, nil
		}
	}

	// Generate new audio using Azure TTS
	duration, err := s.synthesizeSpeech(req.Text, voice, audioPath)
	if err != nil {
		return nil, fmt.Errorf("failed to synthesize speech: %w", err)
	}

	// Return audio URL
	audioURL := fmt.Sprintf("/uploads/tts-cache/%s", audioFilename)
	return &TTSResponse{
		AudioURL: audioURL,
		Cached:   false,
		Duration: duration,
	}, nil
}

// synthesizeSpeech uses Azure Cognitive Services Speech SDK to generate audio
func (s *TTSService) synthesizeSpeech(text, voice, outputPath string) (int, error) {
	// Create speech config
	speechConfig, err := speech.NewSpeechConfigFromSubscription(s.config.AzureTTSKey, s.config.AzureTTSRegion)
	if err != nil {
		return 0, fmt.Errorf("failed to create speech config: %w", err)
	}
	defer speechConfig.Close()

	// Set output format to MP3
	speechConfig.SetSpeechSynthesisOutputFormat(common.Audio16Khz32KBitRateMonoMp3)

	// Set voice name
	speechConfig.SetSpeechSynthesisVoiceName(voice)

	// Create audio config for file output
	audioConfig, err := audio.NewAudioConfigFromWavFileOutput(outputPath)
	if err != nil {
		return 0, fmt.Errorf("failed to create audio config: %w", err)
	}
	defer audioConfig.Close()

	// Create speech synthesizer
	synthesizer, err := speech.NewSpeechSynthesizerFromConfig(speechConfig, audioConfig)
	if err != nil {
		return 0, fmt.Errorf("failed to create synthesizer: %w", err)
	}
	defer synthesizer.Close()

	// Synthesize text to speech
	task := synthesizer.SpeakTextAsync(text)
	var outcome speech.SpeechSynthesisOutcome
	select {
	case outcome = <-task:
	}

	defer outcome.Close()

	if outcome.Error != nil {
		return 0, fmt.Errorf("synthesis error: %w", outcome.Error)
	}

	if outcome.Result.Reason == common.SynthesizingAudioCompleted {
		// Get audio duration from result
		duration := int(outcome.Result.AudioDuration / 10000) // Convert to milliseconds
		return duration, nil
	}

	return 0, fmt.Errorf("synthesis failed with reason: %v", outcome.Result.Reason)
}

// getDefaultVoice returns the default voice for a given language
func (s *TTSService) getDefaultVoice(language string) string {
	// Default to configured voice
	if language == "" {
		return s.config.AzureTTSVoice
	}

	// Map languages to Azure neural voices
	voiceMap := map[string]string{
		"zh-HK": "zh-HK-HiuMaanNeural",  // Cantonese (Hong Kong) - Female
		"zh-CN": "zh-CN-XiaoxiaoNeural", // Mandarin (Simplified) - Female
		"en":    "en-US-JennyNeural",    // English (US) - Female
		"en-US": "en-US-JennyNeural",
		"es":    "es-ES-ElviraNeural", // Spanish - Female
		"fr":    "fr-FR-DeniseNeural", // French - Female
		"ja":    "ja-JP-NanamiNeural", // Japanese - Female
		"ko":    "ko-KR-SunHiNeural",  // Korean - Female
	}

	if voice, ok := voiceMap[language]; ok {
		return voice
	}

	// Fallback to configured default
	return s.config.AzureTTSVoice
}

// generateCacheKey generates a unique cache key for the audio
func (s *TTSService) generateCacheKey(text, language, voice string) string {
	data := fmt.Sprintf("%s|%s|%s", text, language, voice)
	hash := md5.Sum([]byte(data))
	return hex.EncodeToString(hash[:])
}

// ClearCache removes all cached audio files
func (s *TTSService) ClearCache() error {
	return os.RemoveAll(s.cacheDir)
}

// GetCacheSize returns the size of the cache directory in bytes
func (s *TTSService) GetCacheSize() (int64, error) {
	var size int64
	err := filepath.Walk(s.cacheDir, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			size += info.Size()
		}
		return nil
	})
	return size, err
}
