// @ts-expect-error - lamejs types not available
import { Mp3Encoder } from 'lamejs';

/**
 * Convert a Float32Array to Int16Array (PCM format)
 * Required for MP3 encoding via lamejs
 */
function float32ToInt16(float32Array: Float32Array): Int16Array {
  const l = float32Array.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

/**
 * Convert an audio Blob (e.g., audio/webm from MediaRecorder) to MP3 Blob (audio/mpeg)
 * @param inputBlob - The audio blob to convert (webm, wav, etc.)
 * @param bitrate - MP3 bitrate in kbps (default: 128)
 * @returns Promise resolving to an MP3 Blob
 */
export async function convertBlobToMp3(
  inputBlob: Blob,
  bitrate: number = 128
): Promise<Blob> {
  // Decode the audio blob to PCM
  const arrayBuffer = await inputBlob.arrayBuffer();
  // @ts-expect-error - webkitAudioContext is a webkit-prefixed version
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Get channel data (use mono for simplicity, or mix channels)
    const channelData =
      audioBuffer.numberOfChannels > 0
        ? audioBuffer.getChannelData(0)
        : new Float32Array();

    // Convert Float32 [-1, 1] to 16-bit PCM
    const samples = float32ToInt16(channelData);

    // Create MP3 encoder (mono, sample rate from original, bitrate)
    const mp3Encoder = new Mp3Encoder(1, audioBuffer.sampleRate, bitrate);
    const sampleBlockSize = 1152;
    const mp3Data: Uint8Array[] = [];

    // Encode in chunks
    for (let i = 0; i < samples.length; i += sampleBlockSize) {
      const chunk = samples.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3Encoder.encodeBuffer(chunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }

    // Flush remaining data
    const mp3buf = mp3Encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }

    // Create blob from MP3 data
    const blob = new Blob(mp3Data as BlobPart[], { type: 'audio/mpeg' });
    
    return blob;
  } finally {
    audioCtx.close();
  }
}

/**
 * Get the MIME type of an audio blob
 */
export function getAudioMimeType(blob: Blob): string {
  return blob.type || 'audio/mpeg';
}

/**
 * Check if a blob is already MP3
 */
export function isMP3(blob: Blob): boolean {
  return blob.type === 'audio/mpeg' || blob.type === 'audio/mp3';
}
