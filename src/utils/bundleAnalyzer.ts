// Bundle analysis utilities for development
export const analyzeBundleSize = () => {
  if (import.meta.env.DEV) {
    // Analyze component sizes
    const components = document.querySelectorAll('[data-component]');
    const sizes = Array.from(components).map(el => ({
      name: el.getAttribute('data-component'),
      size: el.innerHTML.length
    }));
    
    console.table(sizes.sort((a, b) => b.size - a.size));
  }
};

// Memory usage tracking
export const trackMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
    };
  }
  return null;
};

// Unused CSS detection
export const detectUnusedCSS = () => {
  if (import.meta.env.DEV) {
    const usedClasses = new Set<string>();
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(el => {
      el.classList.forEach(cls => usedClasses.add(cls));
    });
    
    console.log(`Used CSS classes: ${usedClasses.size}`);
    return Array.from(usedClasses);
  }
};