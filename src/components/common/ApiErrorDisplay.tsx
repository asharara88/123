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
    <div className="notification notification-error">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-2">
            {isConfigurationError ? 'Configuration Required' : 'Error'}
          </h3>
          <p className="text-sm leading-relaxed">
            {error.message || 'An error occurred'}
          </p>
          {isConfigurationError && onShowSetup && (
            <button
              onClick={onShowSetup}
              className="mt-3 btn-ghost text-sm inline-flex items-center gap-2 text-current hover:bg-red-100 dark:hover:bg-red-800/30"
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
