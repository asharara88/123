import { useState, useCallback, useMemo } from 'react';

// Optimized state hook with memoization
export function useOptimizedState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);

  const optimizedSetState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prev => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev) 
        : newValue;
      
      // Shallow comparison to prevent unnecessary re-renders
      if (typeof nextValue === 'object' && nextValue !== null) {
        return JSON.stringify(nextValue) === JSON.stringify(prev) ? prev : nextValue;
      }
      
      return nextValue === prev ? prev : nextValue;
    });
  }, []);

  return [state, optimizedSetState] as const;
}

// Memoized selector hook
export function useSelector<T, R>(state: T, selector: (state: T) => R): R {
  return useMemo(() => selector(state), [state, selector]);
}