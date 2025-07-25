import { useState, useRef, useEffect } from 'react';
import { Send, Loader, User, VolumeX, Volume2, Settings, History } from 'lucide-react';
import { Bell, Download, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logError } from '../../utils/logger';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { useChatStore } from '../../store';
import MessageActions from './MessageActions';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';
import AudioVisualizer from './AudioVisualizer';
import AudioPlayer from './AudioPlayer';
import VoiceInput from './VoiceInput';
import { MessageContent } from './MessageContent';
import { SetupGuide } from '../common/SetupGuide';
import ApiErrorDisplay from '../common/ApiErrorDisplay';
import LazyWrapper from '../common/LazyWrapper';
import { 
  HealthDashboard, 
  NotificationCenter, 
  ChatExport, 
  ChatSettings, 
  ChatHistory 
} from '../../utils/lazyImports';

const suggestedQuestions = [
  "What's my current health status?",
  "How can I improve my sleep quality?",
  "What supplements should I take?",
  "Analyze my nutrition habits",
  "Help me reduce stress",
  "How's my metabolic health?",
  "What's the best exercise for me?",
  "How can I improve my energy levels?",
  "What's my heart rate variability?",
  "How can I optimize my recovery?"
];

interface AIHealthCoachProps {
  initialQuestion?: string | null;
}

export default function AIHealthCoach({ initialQuestion = null }: AIHealthCoachProps) {
  const [input, setInput] = useState(initialQuestion || '');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user, isDemo } = useAuth();
  useTheme();
  const { 
    messages, 
    loading, 
    error, 
    sendMessage, 
    generateSpeech,
    audioUrl,
    speechLoading,
    preferSpeech, 
    setPreferSpeech
  } = useChatStore();

  // Only use auto-scroll after the first render
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
    }
  }, []);

  // Use the updated useAutoScroll hook with the onlyScrollDown parameter set to true
  useAutoScroll(
    messagesEndRef, 
    [isFirstRender ? null : messages], 
    { behavior: 'smooth' }, 
    true
  );

  // Make sure the chat container starts at the top
  useEffect(() => {
    if (chatContainerRef.current && isFirstRender) {
      chatContainerRef.current.scrollTop = 0;
    }
  }, [isFirstRender]);
  
  // Handle initial question if provided
  useEffect(() => {
    if (initialQuestion && inputRef.current) {
      setInput(initialQuestion);
      // Focus the input
      inputRef.current.focus();
    }
  }, [initialQuestion]);

  useEffect(() => {
    // Select 5 random questions on component mount
    const shuffled = [...suggestedQuestions].sort(() => 0.5 - Math.random());
    setSelectedSuggestions(shuffled.slice(0, 5));
  }, []);

  const handleSubmit = async (e: React.FormEvent | string) => {
    if (typeof e === 'object' && e?.preventDefault) {
      e.preventDefault();
    }
    const messageContent = typeof e === 'string' ? e : input;
    
    if (!messageContent.trim()) return;
    
    setInput('');
    setShowSuggestions(false);

    try {
      // Get user ID properly
      const userId = user?.id || (isDemo ? '00000000-0000-0000-0000-000000000000' : undefined);
      
      await sendMessage(messageContent, userId);
    } catch (err: any) {
      // Show setup guide for configuration errors
      if (err && typeof err === 'object' && 'setupRequired' in err) {
        setShowSetupGuide(true);
      }
      
      logError('Error in chat submission', err);
    }
  };

  // Play audio when audioUrl changes
  useEffect(() => {
    if (audioUrl && audioRef.current && preferSpeech) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.onerror = (e) => {
        logError('Audio playback error', e);
        setIsPlaying(false);
      };
      
      audio.play().catch(err => {
        logError('Error playing audio', err);
        setIsPlaying(false);
      });
      
      return () => {
        audio.pause();
        audio.onplay = null;
        audio.onended = null;
        audio.onpause = null;
        audio.onerror = null;
      };
    }
  }, [audioUrl, preferSpeech]);

  // Cleanup audio and media recorder on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleRegenerate = async (messageIndex: number) => {
    if (messageIndex < 1) return;
    
    const userMessage = messages[messageIndex - 1];
    if (userMessage.role === 'user') {
      // This would require updating the store to support message replacement
      await handleSubmit(userMessage.content);
    }
  };

  const handleMessageFeedback = (messageIndex: number, type: 'positive' | 'negative') => {
    // This would typically send feedback to your analytics service
    console.log(`Feedback for message ${messageIndex}: ${type}`);
  };

  const handleSpeakMessage = async (content: string) => {
    await generateSpeech(content);
  };

  // Handle voice input transcription
  const handleVoiceTranscription = (text: string) => {
    setInput(text);
    // Optionally auto-submit
    // handleSubmit(text);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar for chat history */}
      {showHistory && (
        <div className="w-80 border-r border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
          <LazyWrapper>
            <ChatHistory 
              onSelectSession={(sessionId) => {
                // Load session messages
                console.log('Loading session:', sessionId);
                setShowHistory(false);
              }}
              onNewChat={() => {
                setShowHistory(false);
              }}
            />
          </LazyWrapper>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
      <div className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary/20 to-primary-dark/20 text-primary border-2 border-primary/20">
              <img 
                src="/favicon.svg" 
                alt="MyCoach" 
                className="h-6 w-6"
                loading="eager"
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">MyCoach</h3>
              <div className="flex items-center gap-2">
                <div className="status-dot status-online"></div>
                <p className="text-xs text-text-light">Online • Ready to help</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="btn-ghost p-2 rounded-lg"
              title="Chat History"
              onClick={() => setShowHistory(!showHistory)}
              type="button"
            >
              <History className="h-4 w-4" />
            </button>
            <button 
              className="btn-ghost p-2 rounded-lg"
              title="Health Dashboard"
              onClick={() => setShowDashboard(!showDashboard)}
              type="button"
            >
              <Activity className="h-4 w-4" />
            </button>
            <button 
              className="btn-ghost p-2 rounded-lg"
              title="Export Chat"
              onClick={() => setShowExport(true)}
              type="button"
            >
              <Download className="h-4 w-4" />
            </button>
            <button 
              className="btn-ghost p-2 rounded-lg relative"
              title="Notifications"
              onClick={() => setShowNotifications(true)}
              type="button"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
            </button>
            <button 
              className={`btn-ghost p-2 rounded-lg ${preferSpeech ? 'text-primary bg-primary/10' : ''}`}
              title={preferSpeech ? "Turn off voice" : "Turn on voice"}
              onClick={() => setPreferSpeech(!preferSpeech)}
              aria-pressed={preferSpeech}
              type="button"
            >
              {preferSpeech ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button 
              className="btn-ghost p-2 rounded-lg"
              title="Settings"
              onClick={() => setShowSettings(true)}
              type="button"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 overscroll-contain smooth-scroll"
        style={{ display: 'flex', flexDirection: 'column' }}>
        
        {error && (
          <div className="mb-4">
            <ApiErrorDisplay error={{ type: 'unknown', message: error }} />
          </div>
        )}

        {showSetupGuide && (
          <SetupGuide onClose={() => setShowSetupGuide(false)} />
        )}

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-gradient-to-r from-primary/20 to-primary-dark/20 p-6 border-4 border-primary/10">
              <img 
                src="/favicon.svg" 
                alt="MyCoach" 
                className="h-12 w-12 text-primary"
                loading="lazy"
              />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Welcome to MyCoach</h3>
            <p className="mb-8 text-lg text-text-light max-w-md">
              Your personalized AI health coach is ready to help you optimize your wellness journey.
            </p>
            
            <QuickActions 
              onActionSelect={handleSubmit}
              className="mb-8"
            />
            
            {showSuggestions && (
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                {selectedSuggestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSubmit(question)}
                    className="btn-ghost px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary border border-gray-200 dark:border-gray-700 hover:border-primary/30"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-grow space-y-6">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`group flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  message.role === 'assistant' 
                    ? 'bg-gradient-to-r from-primary/20 to-primary-dark/20 text-primary border-2 border-primary/20' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {message.role === 'assistant' ? (
                    <img 
                      src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/icons-favicons/stack%20dash%20metalic%20favicon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy1mYXZpY29ucy9zdGFjayBkYXNoIG1ldGFsaWMgZmF2aWNvbi5zdmciLCJpYXQiOjE3NTAyMjE4NjgsImV4cCI6MTc4MTc1Nzg2OH0.k7wGfiV-4klxCyuBpz_MhVhF0ahuZZqNI-LQh8rLLJA" 
                      alt="MyCoach" 
                      className="h-4 w-4"
                      loading="lazy"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                
                <div
                  className={`message-bubble ${
                    message.role === 'user'
                      ? 'message-bubble-user'
                      : 'message-bubble-assistant'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:mb-2 prose-p:last:mb-0">
                      <MessageContent content={message.content} />
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed">{message.content}</div>
                  )}
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs opacity-60">
                    {message.timestamp?.toLocaleTimeString()}
                    </div>
                    {message.role === 'assistant' && preferSpeech && (
                      <div className="flex items-center gap-1 text-xs opacity-60">
                        <Volume2 className="h-3 w-3" />
                        <span>Voice available</span>
                      </div>
                    )}
                  </div>
                  
                  <MessageActions
                    content={message.content}
                    messageId={`msg-${index}`}
                    isAssistant={message.role === 'assistant'}
                    onRegenerate={() => handleRegenerate(index)}
                    onFeedback={(type) => handleMessageFeedback(index, type)}
                    onSpeak={() => handleSpeakMessage(message.content)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary/20 to-primary-dark/20 text-primary border-2 border-primary/20">
              <img 
                src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/icons-favicons/stack%20dash%20metalic%20favicon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy1mYXZpY29ucy9zdGFjayBkYXNoIG1ldGFsaWMgZmF2aWNvbi5zdmciLCJpYXQiOjE3NTAyMjE4NjgsImV4cCI6MTc4MTc1Nzg2OH0.k7wGfiV-4klxCyuBpz_MhVhF0ahuZZqNI-LQh8rLLJA" 
                alt="MyCoach" 
                className="h-4 w-4"
                loading="lazy"
              />
            </div>
            <TypingIndicator isVisible={loading} userName="MyCoach" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Speech loading indicator */}
      {speechLoading && preferSpeech && (
        <div className="border-t border-[hsl(var(--color-border))] bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-3">
          <div className="flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
            <Loader className="h-3 w-3 animate-spin" />
            <span>Generating voice response...</span>
            <div className="flex-1 ml-4">
              <div className="h-2 w-full rounded-full bg-blue-200 dark:bg-blue-800">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio controls when playing */}
      {audioUrl && preferSpeech && (
        <div className="border-t border-[hsl(var(--color-border))] bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 space-y-3">
          <AudioPlayer 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)} 
          />
          <AudioVisualizer 
            audioUrl={audioUrl} 
            isPlaying={isPlaying} 
          />
        </div>
      )}

      <div className="border-t border-[hsl(var(--color-border))] p-6 bg-gray-50 dark:bg-gray-900/50">
        <form onSubmit={handleSubmit} className="flex gap-3 relative">
          <input
            key="chat-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your health..."
            className="input-field flex-1 text-base"
            disabled={loading}
            aria-label="Your message"
          />
          
          {/* Voice input component */}
          <div className="relative flex-shrink-0">
            <VoiceInput 
              onVoiceInput={handleVoiceTranscription}
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn btn-primary px-6 py-3 flex-shrink-0"
            aria-label="Send message"
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <LazyWrapper>
          <ChatSettings 
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        </LazyWrapper>
      )}

      {/* Export Modal */}
      {showExport && (
        <LazyWrapper>
          <ChatExport 
            isOpen={showExport}
            onClose={() => setShowExport(false)}
          />
        </LazyWrapper>
      )}

      {/* Health Dashboard Modal */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Health Dashboard
              </h2>
              <button
                onClick={() => setShowDashboard(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <LazyWrapper>
              <HealthDashboard />
            </LazyWrapper>
          </div>
        </div>
      )}

      {/* Notification Center */}
      {showNotifications && (
        <LazyWrapper>
          <NotificationCenter 
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </LazyWrapper>
      )}
    </div>
  );
}