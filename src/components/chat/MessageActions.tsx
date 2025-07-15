import { useState } from 'react';
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Share, Volume2 } from 'lucide-react';

interface MessageActionsProps {
  content: string;
  messageId?: string;
  onRegenerate?: () => void;
  onFeedback?: (type: 'positive' | 'negative') => void;
  onSpeak?: () => void;
  isAssistant?: boolean;
}

export default function MessageActions({ 
  content, 
  messageId, 
  onRegenerate, 
  onFeedback, 
  onSpeak,
  isAssistant = false 
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    onFeedback?.(type);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Health Advice from MyCoach',
          text: content,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
      <button
        onClick={handleCopy}
        className="btn-ghost p-1.5 rounded-md text-xs"
        title={copied ? 'Copied!' : 'Copy message'}
      >
        <Copy size={12} className={copied ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'} />
      </button>

      {isAssistant && (
        <>
          <button
            onClick={() => handleFeedback('positive')}
            className={`btn-ghost p-1.5 rounded-md text-xs ${
              feedback === 'positive' ? 'text-green-500' : 'text-gray-500'
            }`}
            title="Good response"
          >
            <ThumbsUp size={12} />
          </button>

          <button
            onClick={() => handleFeedback('negative')}
            className={`btn-ghost p-1.5 rounded-md text-xs ${
              feedback === 'negative' ? 'text-red-500' : 'text-gray-500'
            }`}
            title="Poor response"
          >
            <ThumbsDown size={12} />
          </button>

          <button
            onClick={onRegenerate}
            className="btn-ghost p-1.5 rounded-md text-xs text-gray-500 dark:text-gray-400"
            title="Regenerate response"
          >
            <RefreshCw size={12} />
          </button>

          <button
            onClick={onSpeak}
            className="btn-ghost p-1.5 rounded-md text-xs text-gray-500 dark:text-gray-400"
            title="Read aloud"
          >
            <Volume2 size={12} />
          </button>
        </>
      )}

      <button
        onClick={handleShare}
        className="btn-ghost p-1.5 rounded-md text-xs text-gray-500 dark:text-gray-400"
        title="Share message"
      >
        <Share size={12} />
      </button>
    </div>
  );
}