/**
 * Performance monitoring and optimization utilities
 */

// Performance metrics tracking
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric('page-load', navEntry.loadEventEnd - navEntry.navigationStart);
              this.recordMetric('dom-content-loaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart);
              this.recordMetric('first-paint', navEntry.loadEventStart - navEntry.navigationStart);
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error);
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              if (resourceEntry.duration > 1000) { // Log slow resources (>1s)
                this.recordMetric(`slow-resource-${resourceEntry.name}`, resourceEntry.duration);
              }
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource timing observer not supported:', error);
      }

      // Observe largest contentful paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              this.recordMetric('largest-contentful-paint', entry.startTime);
            }
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }
    }
  }

  recordMetric(name: string, value: number) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now()
    });

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log performance issues in development
    if (import.meta.env.DEV) {
      if (name === 'page-load' && value > 3000) {
        console.warn(`Slow page load detected: ${value}ms`);
      }
      if (name === 'largest-contentful-paint' && value > 2500) {
        console.warn(`Poor LCP detected: ${value}ms`);
      }
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / relevantMetrics.length;
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for performance optimization
export const measureAsync = async <T>(
  name: string,
  asyncFn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await asyncFn();
    const duration = performance.now() - start;
    performanceMonitor.recordMetric(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.recordMetric(`${name}-error`, duration);
    throw error;
  }
};

export const measureSync = <T>(
  name: string,
  syncFn: () => T
): T => {
  const start = performance.now();
  try {
    const result = syncFn();
    const duration = performance.now() - start;
    performanceMonitor.recordMetric(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.recordMetric(`${name}-error`, duration);
    throw error;
  }
};

// Memory usage monitoring
export const getMemoryUsage = (): {
  used: number;
  total: number;
  percentage: number;
} | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }
  return null;
};

// Image optimization utilities
export const optimizeImage = (
  src: string,
  width?: number,
  height?: number,
  quality: number = 80
): string => {
  // This would typically integrate with an image optimization service
  // For now, return the original src
  return src;
};

// Lazy loading utility
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Bundle size analysis (development only)
export const analyzeBundleSize = () => {
  if (import.meta.env.DEV) {
    // This would integrate with webpack-bundle-analyzer or similar
    console.log('Bundle analysis would run here in development');
  }
};