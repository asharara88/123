import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { logError } from '../utils/logger';

export interface HealthMetric {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  timestamp: string;
  source: string;
  metadata?: any;
}

export interface HealthInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'achievement' | 'trend';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  data?: any;
}

export interface UseHealthDataReturn {
  metrics: HealthMetric[];
  insights: HealthInsight[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addMetric: (metric: Omit<HealthMetric, 'id' | 'timestamp'>) => Promise<void>;
  addInsight: (insight: Omit<HealthInsight, 'id' | 'created_at'>) => Promise<void>;
  getMetricsByType: (type: string, limit?: number) => HealthMetric[];
  getMetricTrend: (type: string, days?: number) => { current: number; previous: number; trend: 'up' | 'down' | 'stable' };
}

export const useHealthData = (): UseHealthDataReturn => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchHealthData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch health metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(500);

      if (metricsError) throw metricsError;

      // Fetch health insights (simulated for now)
      // In a real app, this would be a separate table
      const simulatedInsights: HealthInsight[] = [
        {
          id: '1',
          type: 'recommendation',
          title: 'Improve Sleep Quality',
          description: 'Your sleep duration has been below optimal levels. Consider establishing a consistent bedtime routine.',
          priority: 'medium',
          created_at: new Date().toISOString()
        }
      ];

      setMetrics(metricsData || []);
      setInsights(simulatedInsights);
    } catch (err: any) {
      logError('Error fetching health data', err);
      setError(err.message || 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  const addMetric = async (metric: Omit<HealthMetric, 'id' | 'timestamp'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('health_metrics')
        .insert({
          ...metric,
          user_id: user.id,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;

      await fetchHealthData(); // Refresh data
    } catch (err: any) {
      logError('Error adding health metric', err);
      throw err;
    }
  };

  const addInsight = async (insight: Omit<HealthInsight, 'id' | 'created_at'>) => {
    // In a real app, this would insert into a health_insights table
    const newInsight: HealthInsight = {
      ...insight,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };

    setInsights(prev => [newInsight, ...prev]);
  };

  const getMetricsByType = (type: string, limit?: number): HealthMetric[] => {
    const filtered = metrics.filter(m => m.metric_type === type);
    return limit ? filtered.slice(0, limit) : filtered;
  };

  const getMetricTrend = (type: string, days: number = 7) => {
    const typeMetrics = getMetricsByType(type);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentMetrics = typeMetrics.filter(
      m => new Date(m.timestamp) >= cutoffDate
    );

    if (recentMetrics.length < 2) {
      return { current: 0, previous: 0, trend: 'stable' as const };
    }

    const current = recentMetrics[0].value;
    const previous = recentMetrics[Math.floor(recentMetrics.length / 2)].value;
    
    const trend = current > previous ? 'up' : current < previous ? 'down' : 'stable';

    return { current, previous, trend };
  };

  useEffect(() => {
    fetchHealthData();
  }, [user]);

  return {
    metrics,
    insights,
    loading,
    error,
    refreshData: fetchHealthData,
    addMetric,
    addInsight,
    getMetricsByType,
    getMetricTrend
  };
};