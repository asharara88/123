import { lazy } from 'react';

// Lazy load heavy components
export const HealthDashboard = lazy(() => import('../components/dashboard/HealthDashboard'));
export const NotificationCenter = lazy(() => import('../components/notifications/NotificationCenter'));
export const ChatExport = lazy(() => import('../components/chat/ChatExport'));
export const ChatSettings = lazy(() => import('../components/chat/ChatSettings'));
export const ChatHistory = lazy(() => import('../components/chat/ChatHistory'));
export const HealthAnalytics = lazy(() => import('../components/analytics/HealthAnalytics'));
export const OnboardingFlow = lazy(() => import('../components/onboarding/OnboardingFlow'));

// Lazy load utility functions
export const loadDataExport = () => import('../utils/dataExport');
export const loadPerformanceUtils = () => import('../utils/performance');
export const loadAccessibilityUtils = () => import('../utils/accessibility');