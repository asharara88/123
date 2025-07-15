import { useState, useEffect } from 'react';
import { Heart, Activity, Moon, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface HealthMetric {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  timestamp: string;
  source: string;
}

interface MetricSummary {
  type: string;
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  icon: React.ReactNode;
  color: string;
}

export default function HealthMetrics() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [summaries, setSummaries] = useState<MetricSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHealthMetrics();
    }
  }, [user]);

  const fetchHealthMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      setMetrics(data || []);
      generateSummaries(data || []);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSummaries = (data: HealthMetric[]) => {
    const metricTypes = ['heart_rate', 'steps', 'sleep', 'energy'];
    const summaries: MetricSummary[] = [];

    metricTypes.forEach(type => {
      const typeMetrics = data.filter(m => m.metric_type === type);
      if (typeMetrics.length >= 2) {
        const current = typeMetrics[0];
        const previous = typeMetrics[1];
        const trend = current.value > previous.value ? 'up' : 
                     current.value < previous.value ? 'down' : 'stable';

        summaries.push({
          type,
          current: current.value,
          previous: previous.value,
          trend,
          unit: current.unit,
          icon: getMetricIcon(type),
          color: getMetricColor(type)
        });
      }
    });

    setSummaries(summaries);
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'heart_rate': return <Heart className="w-5 h-5" />;
      case 'steps': return <Activity className="w-5 h-5" />;
      case 'sleep': return <Moon className="w-5 h-5" />;
      case 'energy': return <Zap className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getMetricColor = (type: string) => {
    switch (type) {
      case 'heart_rate': return 'text-red-500';
      case 'steps': return 'text-blue-500';
      case 'sleep': return 'text-purple-500';
      case 'energy': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const formatMetricName = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="card-enhanced p-6">
        <div className="space-y-4">
          <div className="loading-shimmer h-6 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="loading-shimmer h-20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-enhanced p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Health Metrics Overview
      </h3>

      {summaries.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Activity className="w-8 h-8 opacity-50" />
          </div>
          <h4 className="text-lg font-medium mb-2">No health metrics available yet</h4>
          <p className="text-sm">Connect your wearable device to start tracking your health data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaries.map((summary) => (
            <div
              key={summary.type}
              className="card-interactive p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${summary.color}`}>
                  {summary.icon}
                </div>
                <div className="flex items-center">
                  {summary.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {summary.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {summary.trend === 'stable' && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                </div>
              </div>
              
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {summary.current}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {summary.unit}
                </span>
              </div>
              
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {formatMetricName(summary.type)}
              </div>
              
              <div className={`text-xs font-medium ${
                summary.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                summary.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                'text-gray-500 dark:text-gray-400'
              }`}>
                {summary.trend === 'up' && `↗ +${(summary.current - summary.previous).toFixed(1)}`}
                {summary.trend === 'down' && `↘ ${(summary.current - summary.previous).toFixed(1)}`}
                {summary.trend === 'stable' && '→ No change'}
                <span className="text-gray-400 ml-1">vs last</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}