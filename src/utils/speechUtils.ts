/**
 * Utility functions for speech synthesis and audio processing
 */

/**
 * Creates a mock audio blob for testing or offline mode
 * @param durationSeconds The duration of the mock audio in seconds
 * @returns A Blob that can be used as an audio source
 */
export function createMockAudioBlob(durationSeconds: number = 3): Blob {
  // Create a simple audio context
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * durationSeconds;
  
  // Create an audio buffer
  const audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  
  // Fill with a simple sine wave
  for (let i = 0; i < frameCount; i++) {
    // Simple sine wave at 440Hz (A4 note)
    channelData[i] = Math.sin(440 * Math.PI * 2 * i / sampleRate) * 0.5;
  }
  
  // Convert to WAV format
  const offlineContext = new OfflineAudioContext(1, frameCount, sampleRate);
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start(0);
  
  // Return a promise that resolves to a blob
  return offlineContext.startRendering().then(renderedBuffer => {
    // Convert buffer to 16-bit PCM WAV
    const numOfChannels = renderedBuffer.numberOfChannels;
    const length = renderedBuffer.length * numOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // WAV header (simplified)
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numOfChannels * 2, true);
    view.setUint16(32, numOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);
    
    // Write audio data
    const channelData = renderedBuffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  });
}

// Helper function to write strings to DataView
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Analyzes text to determine optimal chunking for speech synthesis
 * @param text The text to analyze
 * @returns An array of text chunks that can be processed separately
 */
export function chunkTextForSpeech(text: string, maxChunkLength: number = 300): string[] {
  if (!text) return [];
  if (text.length <= maxChunkLength) return [text];
  
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed the max length, start a new chunk
    if (currentChunk.length + sentence.length > maxChunkLength && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Converts a Blob to an ArrayBuffer
 * @param blob The Blob to convert
 * @returns Promise resolving to an ArrayBuffer
 */
export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Concatenates multiple audio blobs into a single blob
 * @param blobs Array of audio blobs to concatenate
 * @param mimeType The MIME type of the resulting blob
 * @returns Promise resolving to a concatenated Blob
 */
export async function concatenateAudioBlobs(blobs: Blob[], mimeType: string = 'audio/mpeg'): Promise<Blob> {
  // Convert blobs to array buffers
  const arrayBuffers = await Promise.all(blobs.map(blobToArrayBuffer));
  
  // Calculate total length
  const totalLength = arrayBuffers.reduce((total, buffer) => total + buffer.byteLength, 0);
  
  // Create a new array buffer with the total length
  const result = new Uint8Array(totalLength);
  
  // Copy data from each array buffer
  let offset = 0;
  arrayBuffers.forEach(buffer => {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });
  
  // Create a new blob from the result
  return new Blob([result], { type: mimeType });
}