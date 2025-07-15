import { useState, useEffect } from 'react';
import { Watch, Smartphone, Wifi, WifiOff, RefreshCw, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface WearableConnection {
  id: string;
  provider: string;
  access_token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

const SUPPORTED_PROVIDERS = [
  { id: 'apple_health', name: 'Apple Health', icon: <Smartphone className="w-5 h-5" /> },
  { id: 'fitbit', name: 'Fitbit', icon: <Watch className="w-5 h-5" /> },
  { id: 'garmin', name: 'Garmin', icon: <Watch className="w-5 h-5" /> },
  { id: 'oura', name: 'Oura Ring', icon: <Watch className="w-5 h-5" /> },
];

export default function WearableSync() {
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('wearable_connections')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    setSyncing(provider);
    
    try {
      // In a real app, this would initiate OAuth flow
      // For demo purposes, we'll simulate a connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error } = await supabase
        .from('wearable_connections')
        .insert({
          user_id: user?.id,
          provider,
          access_token: 'demo_token_' + Date.now(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;
      
      await fetchConnections();
    } catch (error) {
      console.error('Error connecting device:', error);
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('wearable_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      
      await fetchConnections();
    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  };

  const handleSync = async (provider: string) => {
    setSyncing(provider);
    
    try {
      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, this would fetch data from the provider's API
      // and insert it into the health_metrics table
      
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setSyncing(null);
    }
  };

  const isConnected = (provider: string) => {
    return connections.some(conn => conn.provider === provider);
  };

  const getConnection = (provider: string) => {
    return connections.find(conn => conn.provider === provider);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          Connected Devices
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {connections.length} connected
        </div>
      </div>

      <div className="space-y-3">
        {SUPPORTED_PROVIDERS.map((provider) => {
          const connection = getConnection(provider.id);
          const connected = isConnected(provider.id);
          const isSyncing = syncing === provider.id;

          return (
            <div
              key={provider.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-3">
                <div className="text-gray-600 dark:text-gray-400">
                  {provider.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {provider.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {connected ? (
                      <div className="flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-green-500" />
                        Connected
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <WifiOff className="w-3 h-3 text-gray-400" />
                        Not connected
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {connected ? (
                  <>
                    <button
                      onClick={() => handleSync(provider.id)}
                      disabled={isSyncing}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Syncing...' : 'Sync'}
                    </button>
                    <button
                      onClick={() => handleDisconnect(connection!.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(provider.id)}
                    disabled={isSyncing}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                    {isSyncing ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Connecting your wearable devices allows MyCoach to provide more personalized health insights based on your real-time data.
        </div>
      </div>
    </div>
  );
}