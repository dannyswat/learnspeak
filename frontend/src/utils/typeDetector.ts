/**
 * Determines the type of content based on file extension
 * @param value - The string value to analyze
 * @returns 'image' | 'audio' | 'text'
 */
export type ContentType = 'text' | 'image' | 'audio';

export const determineContentType = (value: string): ContentType => {
  if (!value) return 'text';
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const audioExtensions = ['.mp3', '.webm', '.wav', '.ogg', '.m4a'];
  
  const lowerValue = value.toLowerCase();
  
  if (imageExtensions.some(ext => lowerValue.includes(ext))) {
    return 'image';
  }
  
  if (audioExtensions.some(ext => lowerValue.includes(ext))) {
    return 'audio';
  }
  
  return 'text';
};
