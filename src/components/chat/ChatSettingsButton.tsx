interface ChatSettingsButtonProps {
  className?: string;
  showVoiceSettings?: boolean;
  onVoiceToggle?: () => void;
  selectedVoice?: string;
  onVoiceSelect?: (voice: string) => void;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
  };
  onVoiceSettingsUpdate?: (settings: { stability: number; similarityBoost: number }) => void;
}

export default function ChatSettingsButton({ 
  className = "",
  showVoiceSettings = false,
  onVoiceToggle,
  selectedVoice,
  onVoiceSelect,
  voiceSettings,
  onVoiceSettingsUpdate
}: ChatSettingsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-[hsl(var(--color-card-hover))] text-[hsl(var(--color-text-light))]"
        title="Chat Settings"
      >
        <Settings className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-sm font-medium mb-3">Chat Settings</h3>
          
          {showVoiceSettings && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Voice Response</span>
                <button
                  onClick={onVoiceToggle}
                  className="p-1 rounded text-[hsl(var(--color-primary))]"
                >
                  {showVoiceSettings ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
              </div>
              
              {voiceSettings && onVoiceSettingsUpdate && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-[hsl(var(--color-text-light))]">Stability</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={voiceSettings.stability}
                      onChange={(e) => onVoiceSettingsUpdate({
                        ...voiceSettings,
                        stability: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[hsl(var(--color-text-light))]">Similarity</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={voiceSettings.similarityBoost}
                      onChange={(e) => onVoiceSettingsUpdate({
                        ...voiceSettings,
                        similarityBoost: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
import { Settings } from 'lucide-react';
