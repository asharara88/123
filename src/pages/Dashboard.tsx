import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Activity, Heart, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, isDemo, enterDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleStartChat = () => {
    if (user || isDemo) {
      navigate('/chat');
    } else {
      enterDemoMode();
      navigate('/chat');
    }
  };

  const stats = [
    { name: 'Health Score', value: '87', icon: TrendingUp, color: 'text-green-600' },
    { name: 'Active Days', value: '12', icon: Activity, color: 'text-blue-600' },
    { name: 'Supplements', value: '5', icon: Heart, color: 'text-purple-600' },
    { name: 'Chat Sessions', value: '23', icon: MessageCircle, color: 'text-orange-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--color-text))]">
          Welcome to Biowell
        </h1>
        <p className="mt-2 text-[hsl(var(--color-text-light))]">
          Your personalized AI health coach for evidence-based wellness guidance
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="bg-[hsl(var(--color-card))] rounded-xl border border-[hsl(var(--color-border))] p-6">
          <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--color-text))]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={handleStartChat}
              className="flex items-center space-x-3 p-4 bg-[hsl(var(--color-primary))] text-white rounded-lg hover:bg-[hsl(var(--color-primary-dark))] transition-colors"
            >
              <MessageCircle size={24} />
              <div className="text-left">
                <div className="font-medium">Start Chat</div>
                <div className="text-sm opacity-90">Talk to your AI coach</div>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-[hsl(var(--color-surface-1))] rounded-lg hover:bg-[hsl(var(--color-surface-2))] transition-colors">
              <Activity size={24} className="text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-[hsl(var(--color-text))]">Track Health</div>
                <div className="text-sm text-[hsl(var(--color-text-light))]">Log your metrics</div>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-[hsl(var(--color-surface-1))] rounded-lg hover:bg-[hsl(var(--color-surface-2))] transition-colors">
              <Heart size={24} className="text-red-600" />
              <div className="text-left">
                <div className="font-medium text-[hsl(var(--color-text))]">Supplements</div>
                <div className="text-sm text-[hsl(var(--color-text-light))]">Manage your stack</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-[hsl(var(--color-card))] rounded-xl border border-[hsl(var(--color-border))] p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[hsl(var(--color-text-light))]">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-[hsl(var(--color-text))]">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">
          Start Your Wellness Journey Today
        </h2>
        <p className="text-lg mb-6 opacity-90">
          Get personalized health recommendations based on the latest scientific research. 
          Our AI coach is here to help you optimize your nutrition, sleep, exercise, and supplements.
        </p>
        <button
          onClick={handleStartChat}
          className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Ask Your First Question
        </button>
      </div>
    </div>
  );
}