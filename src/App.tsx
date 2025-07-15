import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AIHealthCoach from './components/chat/AIHealthCoach';
import { performanceMonitor } from './utils/performance';
import './index.css';

// Initialize performance monitoring
if (import.meta.env.PROD) {
  // In production, you might want to send metrics to an analytics service
  setInterval(() => {
    const metrics = performanceMonitor.getMetrics();
    if (metrics.length > 0) {
      console.log('Performance metrics:', metrics.slice(-5)); // Log last 5 metrics
    }
  }, 30000); // Every 30 seconds
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background text-text">
              <div className="container mx-auto px-4 py-8 h-screen">
                <Routes>
                  <Route path="/" element={<AIHealthCoach />} />
                  <Route path="/chat" element={<AIHealthCoach />} />
                  <Route path="*" element={<AIHealthCoach />} />
                </Routes>
              </div>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;