import { AlertCircle, Settings } from 'lucide-react';

interface ApiErrorDisplayProps {
  error: any;
  onShowSetup?: () => void;
}

export default function ApiErrorDisplay({ error, onShowSetup }: ApiErrorDisplayProps) {
  if (!error) return null;

  const isConfigurationError = error && typeof error === 'object' && 
    (error.setupRequired || error.type === 'ConfigurationError' || error.type === 'AuthenticationError');

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-500 dark:text-red-400 mt-0.5" size={20} />
        <div className="flex-1">
          <h3 className="text-red-800 dark:text-red-300 font-medium text-sm mb-1">
            {isConfigurationError ? 'Configuration Required' : 'Error'}
          </h3>
          <p className="text-red-700 dark:text-red-400 text-sm">
            {error.message || 'An error occurred'}
          </p>
          {isConfigurationError && onShowSetup && (
            <button
              onClick={onShowSetup}
              className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <Settings size={14} />
              Show Setup Guide
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
