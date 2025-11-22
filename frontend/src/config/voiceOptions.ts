/**
 * Azure TTS Voice Options
 * 
 * This file contains the voice mappings for different languages used in the AudioInput component.
 * Each language code maps to an array of available voices with their display names and gender.
 * 
 * Voice names follow the format: <language>-<region>-<name>Neural
 * 
 * Source: Azure Cognitive Services Text-to-Speech API
 * Docs: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support
 */

export interface VoiceOption {
  name: string;
  voice: string;
  gender: 'Male' | 'Female';
}

export const voiceOptions: { [languageCode: string]: VoiceOption[] } = {
  // English (US)
  'en-US': [
    { name: 'Jenny (Female)', voice: 'en-US-JennyNeural', gender: 'Female' },
    { name: 'Guy (Male)', voice: 'en-US-GuyNeural', gender: 'Male' },
    { name: 'Aria (Female)', voice: 'en-US-AriaNeural', gender: 'Female' },
    { name: 'Davis (Male)', voice: 'en-US-DavisNeural', gender: 'Male' },
  ],

  // Cantonese (Hong Kong)
  'zh-HK': [
    { name: 'HiuMaan (Female)', voice: 'zh-HK-HiuMaanNeural', gender: 'Female' },
    { name: 'WanLung (Male)', voice: 'zh-HK-WanLungNeural', gender: 'Male' },
    { name: 'HiuGaai (Female)', voice: 'zh-HK-HiuGaaiNeural', gender: 'Female' },
  ],

  // Mandarin (China)
  'zh-CN': [
    { name: 'Xiaoxiao (Female)', voice: 'zh-CN-XiaoxiaoNeural', gender: 'Female' },
    { name: 'Yunyang (Male)', voice: 'zh-CN-YunyangNeural', gender: 'Male' },
    { name: 'Xiaoyi (Female)', voice: 'zh-CN-XiaoyiNeural', gender: 'Female' },
    { name: 'Yunjian (Male)', voice: 'zh-CN-YunjianNeural', gender: 'Male' },
  ],

  // Spanish (Spain)
  'es': [
    { name: 'Elvira (Female)', voice: 'es-ES-ElviraNeural', gender: 'Female' },
    { name: 'Alvaro (Male)', voice: 'es-ES-AlvaroNeural', gender: 'Male' },
    { name: 'Abril (Female)', voice: 'es-ES-AbrilNeural', gender: 'Female' },
    { name: 'Arnold (Male)', voice: 'es-ES-ArnoldNeural', gender: 'Male' },
  ],

  // Spanish (Spain) - alternate code
  'es-ES': [
    { name: 'Elvira (Female)', voice: 'es-ES-ElviraNeural', gender: 'Female' },
    { name: 'Alvaro (Male)', voice: 'es-ES-AlvaroNeural', gender: 'Male' },
    { name: 'Abril (Female)', voice: 'es-ES-AbrilNeural', gender: 'Female' },
    { name: 'Arnold (Male)', voice: 'es-ES-ArnoldNeural', gender: 'Male' },
  ],

  // French (France)
  'fr': [
    { name: 'Denise (Female)', voice: 'fr-FR-DeniseNeural', gender: 'Female' },
    { name: 'Henri (Male)', voice: 'fr-FR-HenriNeural', gender: 'Male' },
    { name: 'Brigitte (Female)', voice: 'fr-FR-BrigitteNeural', gender: 'Female' },
    { name: 'Alain (Male)', voice: 'fr-FR-AlainNeural', gender: 'Male' },
  ],

  // French (France) - alternate code
  'fr-FR': [
    { name: 'Denise (Female)', voice: 'fr-FR-DeniseNeural', gender: 'Female' },
    { name: 'Henri (Male)', voice: 'fr-FR-HenriNeural', gender: 'Male' },
    { name: 'Brigitte (Female)', voice: 'fr-FR-BrigitteNeural', gender: 'Female' },
    { name: 'Alain (Male)', voice: 'fr-FR-AlainNeural', gender: 'Male' },
  ],

  // Japanese (Japan)
  'ja': [
    { name: 'Nanami (Female)', voice: 'ja-JP-NanamiNeural', gender: 'Female' },
    { name: 'Keita (Male)', voice: 'ja-JP-KeitaNeural', gender: 'Male' },
    { name: 'Aoi (Female)', voice: 'ja-JP-AoiNeural', gender: 'Female' },
    { name: 'Daichi (Male)', voice: 'ja-JP-DaichiNeural', gender: 'Male' },
  ],

  // Japanese (Japan) - alternate code
  'ja-JP': [
    { name: 'Nanami (Female)', voice: 'ja-JP-NanamiNeural', gender: 'Female' },
    { name: 'Keita (Male)', voice: 'ja-JP-KeitaNeural', gender: 'Male' },
    { name: 'Aoi (Female)', voice: 'ja-JP-AoiNeural', gender: 'Female' },
    { name: 'Daichi (Male)', voice: 'ja-JP-DaichiNeural', gender: 'Male' },
  ],

  // Korean (Korea)
  'ko': [
    { name: 'SunHi (Female)', voice: 'ko-KR-SunHiNeural', gender: 'Female' },
    { name: 'InJoon (Male)', voice: 'ko-KR-InJoonNeural', gender: 'Male' },
    { name: 'JiMin (Female)', voice: 'ko-KR-JiMinNeural', gender: 'Female' },
    { name: 'BongJin (Male)', voice: 'ko-KR-BongJinNeural', gender: 'Male' },
  ],

  // Korean (Korea) - alternate code
  'ko-KR': [
    { name: 'SunHi (Female)', voice: 'ko-KR-SunHiNeural', gender: 'Female' },
    { name: 'InJoon (Male)', voice: 'ko-KR-InJoonNeural', gender: 'Male' },
    { name: 'JiMin (Female)', voice: 'ko-KR-JiMinNeural', gender: 'Female' },
    { name: 'BongJin (Male)', voice: 'ko-KR-BongJinNeural', gender: 'Male' },
  ],

  // Vietnamese (Vietnam)
  'vi': [
    { name: 'HoaiMy (Female)', voice: 'vi-VN-HoaiMyNeural', gender: 'Female' },
    { name: 'NamMinh (Male)', voice: 'vi-VN-NamMinhNeural', gender: 'Male' },
  ],

  // Vietnamese (Vietnam) - alternate code
  'vi-VN': [
    { name: 'HoaiMy (Female)', voice: 'vi-VN-HoaiMyNeural', gender: 'Female' },
    { name: 'NamMinh (Male)', voice: 'vi-VN-NamMinhNeural', gender: 'Male' },
  ],
};

/**
 * Get available voices for a specific language code
 */
export function getVoicesForLanguage(languageCode: string): VoiceOption[] {
  return voiceOptions[languageCode] || [];
}

/**
 * Check if voice selection is available for a language
 */
export function hasVoiceOptions(languageCode: string): boolean {
  return languageCode in voiceOptions && voiceOptions[languageCode].length > 0;
}
