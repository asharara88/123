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
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Health Metrics Overview
      </h3>

      {summaries.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No health metrics available yet.</p>
          <p className="text-sm mt-1">Connect your wearable device to start tracking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaries.map((summary) => (
            <div
              key={summary.type}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`${summary.color}`}>
                  {summary.icon}
                </div>
                <div className="flex items-center text-sm">
                  {summary.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {summary.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {summary.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full"></div>}
                </div>
              </div>
              
              <div className="mb-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.current}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  {summary.unit}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {formatMetricName(summary.type)}
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {summary.trend === 'up' && `+${(summary.current - summary.previous).toFixed(1)}`}
                {summary.trend === 'down' && `${(summary.current - summary.previous).toFixed(1)}`}
                {summary.trend === 'stable' && 'No change'}
                {' from last reading'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}