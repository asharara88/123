import { Heart, Activity, Moon, Dumbbell, Apple, Brain, Zap, Shield } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  category: 'health' | 'fitness' | 'nutrition' | 'mental';
}

const quickActions: QuickAction[] = [
  {
    id: 'health-check',
    label: 'Health Check',
    icon: <Heart className="w-4 h-4" />,
    prompt: 'Give me a comprehensive health assessment based on my current data and goals.',
    category: 'health'
  },
  {
    id: 'sleep-analysis',
    label: 'Sleep Analysis',
    icon: <Moon className="w-4 h-4" />,
    prompt: 'Analyze my sleep patterns and provide recommendations for better sleep quality.',
    category: 'health'
  },
  {
    id: 'workout-plan',
    label: 'Workout Plan',
    icon: <Dumbbell className="w-4 h-4" />,
    prompt: 'Create a personalized workout plan based on my fitness goals and current level.',
    category: 'fitness'
  },
  {
    id: 'nutrition-advice',
    label: 'Nutrition Guide',
    icon: <Apple className="w-4 h-4" />,
    prompt: 'Provide personalized nutrition recommendations based on my dietary preferences and health goals.',
    category: 'nutrition'
  },
  {
    id: 'stress-management',
    label: 'Stress Relief',
    icon: <Brain className="w-4 h-4" />,
    prompt: 'Help me manage stress and improve my mental well-being with practical techniques.',
    category: 'mental'
  },
  {
    id: 'energy-boost',
    label: 'Energy Boost',
    icon: <Zap className="w-4 h-4" />,
    prompt: 'How can I naturally increase my energy levels throughout the day?',
    category: 'health'
  },
  {
    id: 'supplement-stack',
    label: 'Supplements',
    icon: <Shield className="w-4 h-4" />,
    prompt: 'Recommend a personalized supplement stack based on my health goals and current needs.',
    category: 'health'
  },
  {
    id: 'activity-tracking',
    label: 'Activity Review',
    icon: <Activity className="w-4 h-4" />,
    prompt: 'Review my recent activity data and suggest improvements for better health outcomes.',
    category: 'fitness'
  }
];

interface QuickActionsProps {
  onActionSelect: (prompt: string) => void;
  className?: string;
}

export default function QuickActions({ onActionSelect, className = '' }: QuickActionsProps) {
  const categoryColors = {
    health: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    fitness: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    nutrition: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    mental: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
  };

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionSelect(action.prompt)}
            className={`card-interactive p-4 text-sm font-medium flex flex-col items-center gap-3 min-h-[100px] ${categoryColors[action.category]}`}
          >
            <div className="text-current opacity-80">
              {action.icon}
            </div>
            <span className="text-xs text-center font-medium leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}