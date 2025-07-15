import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { openaiApi } from '../../api/openaiApi';

interface HealthInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'achievement' | 'trend';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  data?: any;
}

export default function HealthInsights() {
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  const fetchInsights = async () => {
    try {
      // In a real app, this would fetch from a dedicated insights table
      // For now, we'll generate some sample insights
      const sampleInsights: HealthInsight[] = [
        {
          id: '1',
          type: 'recommendation',
          title: 'Optimize Your Sleep Schedule',
          description: 'Based on your recent sleep patterns, going to bed 30 minutes earlier could improve your sleep quality by 15%.',
          priority: 'medium',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Step Goal Achieved!',
          description: 'Congratulations! You\'ve reached your daily step goal for 7 consecutive days.',
          priority: 'low',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'alert',
          title: 'Heart Rate Variability Trend',
          description: 'Your HRV has been declining over the past week. Consider incorporating more recovery activities.',
          priority: 'high',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setInsights(sampleInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    setGenerating(true);
    
    try {
      // Fetch user's recent health data
      const { data: healthData } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (healthData && healthData.length > 0) {
        // Generate AI insights based on health data
        const prompt = `Analyze the following health data and provide 3 personalized insights:
        
        ${JSON.stringify(healthData.slice(0, 10))}
        
        Please provide insights in the following format:
        1. A recommendation for improvement
        2. A trend analysis
        3. An achievement or positive note
        
        Keep each insight concise and actionable.`;

        const response = await openaiApi.generateResponse(prompt);
        
        // Parse the AI response and create new insights
        const newInsight: HealthInsight = {
          id: Date.now().toString(),
          type: 'recommendation',
          title: 'AI-Generated Health Insight',
          description: response,
          priority: 'medium',
          created_at: new Date().toISOString()
        };

        setInsights(prev => [newInsight, ...prev]);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <Brain className="w-5 h-5" />;
      case 'alert': return <AlertTriangle className="w-5 h-5" />;
      case 'achievement': return <CheckCircle className="w-5 h-5" />;
      case 'trend': return <TrendingUp className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (type === 'alert') return 'text-red-500 bg-red-50 border-red-200';
    if (type === 'achievement') return 'text-green-500 bg-green-50 border-green-200';
    if (priority === 'high') return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-blue-500 bg-blue-50 border-blue-200';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Health Insights
        </h3>
        <button
          onClick={generateAIInsights}
          disabled={generating}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
        >
          <Brain className={`w-4 h-4 ${generating ? 'animate-pulse' : ''}`} />
          {generating ? 'Generating...' : 'Generate AI Insights'}
        </button>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No insights available yet.</p>
          <p className="text-sm mt-1">Generate AI insights or connect your devices to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type, insight.priority)} dark:bg-gray-700 dark:border-gray-600`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${getInsightColor(insight.type, insight.priority).split(' ')[0]}`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {insight.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(insight.created_at)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {insight.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {insight.priority} priority
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      insight.type === 'recommendation' ? 'bg-blue-100 text-blue-700' :
                      insight.type === 'alert' ? 'bg-red-100 text-red-700' :
                      insight.type === 'achievement' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {insight.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}