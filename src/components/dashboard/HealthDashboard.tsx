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
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Health Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your health metrics and get personalized insights
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}