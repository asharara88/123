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
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={handleCopy}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={copied ? 'Copied!' : 'Copy message'}
      >
        <Copy size={14} className={copied ? 'text-green-500' : 'text-gray-500'} />
      </button>

      {isAssistant && (
        <>
          <button
            onClick={() => handleFeedback('positive')}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              feedback === 'positive' ? 'text-green-500' : 'text-gray-500'
            }`}
            title="Good response"
          >
            <ThumbsUp size={14} />
          </button>

          <button
            onClick={() => handleFeedback('negative')}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              feedback === 'negative' ? 'text-red-500' : 'text-gray-500'
            }`}
            title="Poor response"
          >
            <ThumbsDown size={14} />
          </button>

          <button
            onClick={onRegenerate}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
            title="Regenerate response"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={onSpeak}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
            title="Read aloud"
          >
            <Volume2 size={14} />
          </button>
        </>
      )}

      <button
        onClick={handleShare}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
        title="Share message"
      >
        <Share size={14} />
      </button>
    </div>
  );
}