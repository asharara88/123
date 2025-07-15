// Optimized icon imports - only import what we need
export { 
  Send, 
  Loader, 
  User, 
  VolumeX, 
  Volume2, 
  Settings, 
  History, 
  Bell, 
  Download, 
  Activity,
  Heart,
  Moon,
  Zap,
  Brain,
  Apple,
  Dumbbell,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Check,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Share,
  Plus,
  Minus,
  Play,
  Pause,
  Stop
} from 'lucide-react';

// Tree-shakeable utility functions
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};