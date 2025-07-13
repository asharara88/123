import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Moon, Sun, Volume2, Bell } from 'lucide-react';

export default function Settings() {
  const { user, isDemo } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--color-text))]">Settings</h1>
        <p className="mt-2 text-[hsl(var(--color-text-light))]">
          Manage your account and application preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-[hsl(var(--color-card))] rounded-xl border border-[hsl(var(--color-border))] p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User size={20} />
            Account
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--color-text))] mb-1">
                Email
              </label>
              <input
                type="email"
                value={isDemo ? 'demo@biowell.ai' : user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-[hsl(var(--color-border))] rounded-lg bg-[hsl(var(--color-surface-1))] text-[hsl(var(--color-text-light))]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--color-text))] mb-1">
                Account Type
              </label>
              <span className="inline-block px-3 py-1 bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))] rounded-full text-sm">
                {isDemo ? 'Demo Account' : 'Standard Account'}
              </span>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-[hsl(var(--color-card))] rounded-xl border border-[hsl(var(--color-border))] p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            Appearance
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--color-text))] mb-2">
                Theme
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                    theme === 'light'
                      ? 'bg-[hsl(var(--color-primary))] text-white border-[hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-surface-1))]'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-[hsl(var(--color-primary))] text-white border-[hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-surface-1))]'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                    theme === 'system'
                      ? 'bg-[hsl(var(--color-primary))] text-white border-[hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-surface-1))]'
                  }`}
                >
                  System
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Settings */}
        <div className="bg-[hsl(var(--color-card))] rounded-xl border border-[hsl(var(--color-border))] p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Volume2 size={20} />
            Chat Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Voice Responses</h3>
                <p className="text-sm text-[hsl(var(--color-text-light))]">
                  Enable text-to-speech for AI responses
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[hsl(var(--color-card))] rounded-xl border border-[hsl(var(--color-border))] p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell size={20} />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Health Reminders</h3>
                <p className="text-sm text-[hsl(var(--color-text-light))]">
                  Get reminded about supplements and health goals
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}