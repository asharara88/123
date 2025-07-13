import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Navbar() {
  const { user, isDemo, signOut, enterDemoMode } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDemoMode = () => {
    enterDemoMode();
    navigate('/chat');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/favicon.svg" 
                alt="Biowell" 
                className="h-8 w-8"
                loading="eager"
              />
              <span className="text-xl font-bold text-[hsl(var(--color-text))]">
                Biowell
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/dashboard"
                className="text-[hsl(var(--color-text-light))] hover:text-[hsl(var(--color-text))] px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                className="text-[hsl(var(--color-text-light))] hover:text-[hsl(var(--color-text))] px-3 py-2 rounded-md text-sm font-medium"
              >
                Chat
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[hsl(var(--color-card-hover))] text-[hsl(var(--color-text-light))]"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user || isDemo ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-sm">
                  <User size={16} />
                  <span className="text-[hsl(var(--color-text))]">
                    {isDemo ? 'Demo User' : user?.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-[hsl(var(--color-text-light))] hover:text-[hsl(var(--color-text))]"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDemoMode}
                  className="px-4 py-2 text-sm font-medium text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-card-hover))] rounded-md"
                >
                  Try Demo
                </button>
                <Link
                  to="/auth"
                  className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-dark))] rounded-md"
                >
                  Sign In
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[hsl(var(--color-card-hover))]"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[hsl(var(--color-border))]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-[hsl(var(--color-text-light))] hover:text-[hsl(var(--color-text))]"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/chat"
              className="block px-3 py-2 rounded-md text-base font-medium text-[hsl(var(--color-text-light))] hover:text-[hsl(var(--color-text))]"
              onClick={() => setIsMenuOpen(false)}
            >
              Chat
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}