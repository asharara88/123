import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  isVisible: boolean;
  userName?: string;
}

export default function TypingIndicator({ isVisible, userName = 'MyCoach' }: TypingIndicatorProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="message-bubble-assistant max-w-[200px]">
      <div className="flex items-center gap-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">{userName} is thinking{dots}</span>
      </div>
    </div>
  );
}