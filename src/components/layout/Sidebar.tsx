import { Link, useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  BarChart3, 
  Settings, 
  Heart,
  Activity,
  Brain,
  Zap
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Health Metrics', href: '/metrics', icon: Activity },
  { name: 'Supplements', href: '/supplements', icon: Heart },
  { name: 'Wellness', href: '/wellness', icon: Brain },
  { name: 'Energy', href: '/energy', icon: Zap },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-[hsl(var(--color-card))] border-r border-[hsl(var(--color-border))] min-h-screen">
      <div className="p-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-[hsl(var(--color-primary))] text-white' 
                    : 'text-[hsl(var(--color-text-light))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-card-hover))]'
                  }
                `}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}