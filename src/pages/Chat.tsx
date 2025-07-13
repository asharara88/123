import AIHealthCoach from '../components/chat/AIHealthCoach';
import { useAuth } from '../contexts/AuthContext';

export default function Chat() {
  const { user, isDemo } = useAuth();

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--color-text))]">
          Health Coach Chat
        </h1>
        <p className="text-[hsl(var(--color-text-light))]">
          {user || isDemo 
            ? "Ask me anything about your health and wellness"
            : "Sign in or try the demo to start chatting"
          }
        </p>
      </div>
      
      <div className="h-full">
        <AIHealthCoach />
      </div>
    </div>
  );
}