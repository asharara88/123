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
  return (
    <button 
      className={`p-2 rounded-lg hover:bg-[hsl(var(--color-card-hover))] text-[hsl(var(--color-text-light))] ${className}`}
      title="Chat Settings"
    >
      <Settings className="h-4 w-4" />
    </button>
  );
};
import { Settings } from 'lucide-react';
