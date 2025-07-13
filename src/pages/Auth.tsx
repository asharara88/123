import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, enterDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    enterDemoMode();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-background))]">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <img 
            src="/favicon.svg" 
            alt="Biowell" 
            className="mx-auto h-12 w-12"
          />
          <h2 className="mt-6 text-3xl font-bold text-[hsl(var(--color-text))]">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-[hsl(var(--color-text-light))]">
            Get personalized health guidance from your AI coach
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--color-text))]">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[hsl(var(--color-border))] rounded-lg bg-[hsl(var(--color-surface-1))] text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-text-light))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]/20"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[hsl(var(--color-text))]">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-[hsl(var(--color-border))] rounded-lg bg-[hsl(var(--color-surface-1))] text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-text-light))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]/20"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-light))] hover:text-[hsl(var(--color-text))]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[hsl(var(--color-text))]">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-[hsl(var(--color-border))] rounded-lg bg-[hsl(var(--color-surface-1))] text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-text-light))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]/20"
                  placeholder="Confirm your password"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-dark))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  {isSignUp ? <UserPlus size={16} className="mr-2" /> : <LogIn size={16} className="mr-2" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDemoMode}
              className="w-full px-4 py-3 border border-[hsl(var(--color-border))] rounded-lg text-sm font-medium text-[hsl(var(--color-text))] bg-[hsl(var(--color-surface-1))] hover:bg-[hsl(var(--color-surface-2))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]/20"
            >
              Try Demo Mode
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary-dark))]"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}