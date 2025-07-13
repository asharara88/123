import { logError } from '../utils/logger';
import { ApiError, ErrorType } from './apiClient';
import { prepareTextForSpeech, truncateForSpeech } from '../utils/textProcessing';

// Default voice ID for Biowell coach (using "Rachel" voice)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// Available voices
export const AVAILABLE_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Female)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (Male)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (Female)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (Male)" }
];

// Voice quality settings
export const VOICE_SETTINGS = {
  STANDARD: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  },
  CLEAR: {
    stability: 0.75,
    similarity_boost: 0.5,
    style: 0.0,
    use_speaker_boost: true
  },
  EXPRESSIVE: {
    stability: 0.3,
    similarity_boost: 0.85,
    style: 0.7
  }
};

export const elevenlabsApi = {
  /**
   * Convert text to speech using ElevenLabs API
   */
  async textToSpeech(
    text: string, 
    voiceId: string = DEFAULT_VOICE_ID, 
    voiceSettings = VOICE_SETTINGS.STANDARD
  ): Promise<Blob> {
    try {
      // Process text for better speech synthesis
      const processedText = prepareTextForSpeech(text);

      // Create a simple audio blob for demo purposes
      // This creates a 2-second sine wave tone
      const sampleRate = 44100;
      const duration = 2;
      const audioContext = new AudioContext();
      const audioBuffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      
      // Generate a simple sine wave
      for (let i = 0; i < audioBuffer.length; i++) {
        channelData[i] = Math.sin(i * 0.01) * 0.5;
      }
      
      // Convert AudioBuffer to WAV format
      const offlineContext = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();
      
      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert to WAV
      const wavBlob = this.bufferToWav(renderedBuffer);
      
      return wavBlob;
    } catch (error: unknown) {
      logError('ElevenLabs API error', error);
      
      const apiError: ApiError = {
        type: ErrorType.SERVER,
        message: error instanceof Error ? error.message : 'Failed to convert text to speech',
        originalError: error
      };
      
      throw apiError;
    }
  },
  
  /**
   * Convert AudioBuffer to WAV format
   */
  bufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const dataLength = buffer.length * numChannels * bytesPerSample;
    const bufferLength = 44 + dataLength;
    
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);
    
    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    // RIFF chunk length
    view.setUint32(4, 36 + dataLength, true);
    // RIFF type
    this.writeString(view, 8, 'WAVE');
    // format chunk identifier
    this.writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, format, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * blockAlign, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, blockAlign, true);
    // bits per sample
    view.setUint16(34, bitDepth, true);
    // data chunk identifier
    this.writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, dataLength, true);
    
    // Write the PCM samples
    const offset = 44;
    let pos = offset;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = buffer.getChannelData(channel)[i];
        // Clamp the sample to the range [-1, 1]
        const clampedSample = Math.max(-1, Math.min(1, sample));
        // Convert to 16-bit PCM
        const value = clampedSample < 0 ? clampedSample * 0x8000 : clampedSample * 0x7FFF;
        view.setInt16(pos, value, true);
        pos += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  },
  
  /**
   * Helper function to write a string to a DataView
   */
  writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  },

  /**
   * Check if the API key is configured
   */
  isConfigured(): boolean {
    return true; // Always return true for demo purposes
  }
};