import { useEffect, RefObject } from 'react';

interface ScrollOptions {
  behavior?: 'auto' | 'instant' | 'smooth';
  block?: 'start' | 'center' | 'end' | 'nearest';
  inline?: 'start' | 'center' | 'end' | 'nearest';
}

/**
 * Hook to automatically scroll to a target element when dependencies change
 */
export const useAutoScroll = (
  targetRef: RefObject<HTMLElement>,
  dependencies: any[],
  options: ScrollOptions = { behavior: 'smooth' },
  onlyScrollDown: boolean = false
) => {
  useEffect(() => {
    // Skip if no dependencies or if first dependency is null (used to skip initial render)
    if (!dependencies || dependencies.length === 0 || dependencies[0] === null) {
      return;
    }

    const scrollToTarget = () => {
      if (targetRef.current) {
        // If onlyScrollDown is true, check if we should scroll
        if (onlyScrollDown) {
          const container = targetRef.current.closest('[data-scroll-container]') || 
                          targetRef.current.parentElement;
          
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = targetRef.current.getBoundingClientRect();
            
            // Only scroll if target is below the visible area
            if (targetRect.top > containerRect.bottom) {
              targetRef.current.scrollIntoView(options);
            }
          } else {
            // Fallback to always scroll if no container found
            targetRef.current.scrollIntoView(options);
          }
        } else {
          targetRef.current.scrollIntoView(options);
        }
      }
    };

    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToTarget, 100);

    return () => clearTimeout(timeoutId);
  }, dependencies);
};
