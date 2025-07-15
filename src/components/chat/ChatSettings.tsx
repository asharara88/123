import { useState } from 'react';
import { Settings, Volume2, VolumeX, Palette, MessageSquare, User } from 'lucide-react';
import { useChatStore } from '../../store';
import { AVAILABLE_VOICES, VOICE_SETTINGS } from '../../api/elevenlabsApi';

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSettings({ isOpen, onClose }: ChatSettingsProps) {
  const {
    preferSpeech,
    setPreferSpeech,
    selectedVoice,
    setSelectedVoice,
    voiceSettings,
    updateVoiceSettings
  } = useChatStore();

  const [tempSettings, setTempSettings] = useState({
    ...voiceSettings,
    voice: selectedVoice,
    speech: preferSpeech
  });

  const handleSave = () => {
    setPreferSpeech(tempSettings.speech);
    setSelectedVoice(tempSettings.voice);
    updateVoiceSettings({
      stability: tempSettings.stability,
      similarityBoost: tempSettings.similarityBoost
    });
    onClose();
  };

  const handleReset = () => {
    setTempSettings({
      stability: 0.5,
      similarityBoost: 0.75,
      voice: "21m00Tcm4TlvDq8ikWAM",
      speech: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Speech Settings */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {tempSettings.speech ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <h3 className="font-medium text-gray-900 dark:text-white">Voice Response</h3>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSettings.speech}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, speech: e.target.checked }))}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Enable voice responses
                </span>
              </label>
            </div>

            {/* Voice Selection */}
            {tempSettings.speech && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Voice Selection</h3>
                </div>
                
                <select
                  value={tempSettings.voice}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, voice: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {AVAILABLE_VOICES.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Voice Quality Settings */}
            {tempSettings.speech && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Voice Quality</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Stability: {tempSettings.stability.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={tempSettings.stability}
                      onChange={(e) => setTempSettings(prev => ({ 
                        ...prev, 
                        stability: parseFloat(e.target.value) 
                      }))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Higher values make voice more stable but less expressive
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Similarity: {tempSettings.similarityBoost.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={tempSettings.similarityBoost}
                      onChange={(e) => setTempSettings(prev => ({ 
                        ...prev, 
                        similarityBoost: parseFloat(e.target.value) 
                      }))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Higher values make voice more similar to the original
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setTempSettings(prev => ({ ...prev, ...VOICE_SETTINGS.STANDARD }))}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setTempSettings(prev => ({ ...prev, ...VOICE_SETTINGS.CLEAR }))}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setTempSettings(prev => ({ ...prev, ...VOICE_SETTINGS.EXPRESSIVE }))}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Expressive
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}