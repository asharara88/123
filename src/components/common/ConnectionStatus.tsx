import React, { useState, useEffect } from 'react';
import { getConnectionStatus, isWebContainerEnvironment } from '../../utils/supabaseConnection';
import { logInfo, logWarning } from '../../utils/logger';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

interface ConnectionState {
  connected: boolean;
  error?: string;
  timestamp: string;
  checking: boolean;
  isWebContainer: boolean;
}

export function ConnectionStatus({ showDetails = false, className = '' }: ConnectionStatusProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    connected: false,
    timestamp: new Date().toISOString(),
    checking: true,
    isWebContainer: false
  });

  const checkConnection = async () => {
    try {
      setConnectionState(prev => ({ ...prev, checking: true }));
      
      // Check if we're in a WebContainer environment
      const isWebContainer = isWebContainerEnvironment();
      
      // In WebContainer environments, we'll show a special status
      if (isWebContainer) {
        setConnectionState({
          connected: true,
          timestamp: new Date().toISOString(),
          checking: false,
          isWebContainer: true
        });
        return;
      }
      
      const status = await getConnectionStatus();
      
      setConnectionState({
        connected: status.connected,
        error: status.error,
        timestamp: status.timestamp,
        checking: false,
        isWebContainer: false
      });

      if (status.connected) {
        logInfo('Connection status: Connected', {});
      } else {
        logWarning('Connection status: Offline', { error: status.error });
      }
    } catch (error: any) {
      setConnectionState({
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        checking: false,
        isWebContainer: false
      });
      
      logWarning('Connection status check failed', { error: error.message });
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Set up periodic checks (every 30 seconds)
    const interval = setInterval(checkConnection, 30000);

    // Listen for online/offline events
    const handleOnline = () => {
      logInfo('Browser detected online status', {});
      checkConnection();
    };
    
    const handleOffline = () => {
      logWarning('Browser detected offline status', {});
      setConnectionState(prev => ({
        ...prev,
        connected: false,
        error: 'Browser is offline',
        timestamp: new Date().toISOString(),
        checking: false
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = () => {
    if (connectionState.checking) return 'text-yellow-500';
    if (connectionState.isWebContainer) return 'text-blue-500';
    return connectionState.connected ? 'text-green-500' : 'text-red-500';
  };

  const getStatusText = () => {
    if (connectionState.checking) return 'Checking...';
    if (connectionState.isWebContainer) return 'WebContainer';
    return connectionState.connected ? 'Connected' : 'Offline';
  };

  const getStatusIcon = () => {
    if (connectionState.checking) {
      return (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-500"></div>
      );
    }
    
    if (connectionState.isWebContainer) {
      return (
        <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
      );
    }
    
    return connectionState.connected ? (
      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
    ) : (
      <div className="h-3 w-3 bg-red-500 rounded-full"></div>
    );
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className} bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm`}>
        {getStatusIcon()}
        <span className={`text-xs ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${className} ${
      connectionState.connected 
        ? connectionState.isWebContainer
          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
          : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
        : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
    }`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className={`font-medium ${getStatusColor()}`}>
            Database Connection: {getStatusText()}
          </h3>
          
          {connectionState.isWebContainer && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Running in WebContainer environment - limited network connectivity
            </p>
          )}
          
          {connectionState.error && !connectionState.isWebContainer && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {connectionState.error}
            </p>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last checked: {new Date(connectionState.timestamp).toLocaleTimeString()}
          </p>
          
          {!connectionState.connected && !connectionState.isWebContainer && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              <p>The app will continue to work with limited functionality.</p>
              <p>Some features may not be available while offline.</p>
            </div>
          )}
          
          {connectionState.isWebContainer && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              <p>WebContainer environments have limited network access.</p>
              <p>The app will run in demo mode with simulated data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConnectionStatus;