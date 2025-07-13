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
    style: 0.7,
    use_speaker_boost: true
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
      // Check if API key is available
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      if (!apiKey) {
        throw new Error('ElevenLabs API key is not configured');
      }
      
      // Process text for better speech synthesis
      const processedText = prepareTextForSpeech(text);
      const trimmedText = truncateForSpeech(processedText, 5000);
      
      // Prepare request body
      const body = JSON.stringify({
        text: trimmedText,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: voiceSettings.stability,
          similarity_boost: voiceSettings.similarity_boost,
          style: voiceSettings.style || 0.0,
          use_speaker_boost: voiceSettings.use_speaker_boost || true
        }
      });
      
      // Make API request
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }
      
      // Return audio blob
      return await response.blob();
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
   * Check if the API key is configured
   */
  isConfigured(): boolean {
    return !!import.meta.env.VITE_ELEVENLABS_API_KEY;
  }
};