import { useState } from 'react';
import { Activity, Heart, Moon, Zap, Settings, Plus } from 'lucide-react';
import HealthMetrics from '../health/HealthMetrics';
import WearableSync from '../health/WearableSync';
import HealthInsights from '../health/HealthInsights';

interface DashboardTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export default function HealthDashboard() {
  const [activeTab, setActiveTab] = useState('metrics');

  const tabs: DashboardTab[] = [
    {
      id: 'metrics',
      label: 'Metrics',
      icon: <Activity className="w-4 h-4" />,
      component: <HealthMetrics />
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <Heart className="w-4 h-4" />,
      component: <HealthInsights />
    },
    {
      id: 'devices',
      label: 'Devices',
      icon: <Settings className="w-4 h-4" />,
      component: <WearableSync />
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Health Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Monitor your health metrics and get personalized insights
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-8 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}