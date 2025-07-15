/**
 * Accessibility utilities and helpers
 */

// Focus management
export const focusManagement = {
  /**
   * Trap focus within a container element
   */
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Restore focus to a previously focused element
   */
  restoreFocus: (element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },

  /**
   * Get the currently focused element
   */
  getCurrentFocus: (): HTMLElement | null => {
    return document.activeElement as HTMLElement;
  }
};

// ARIA utilities
export const ariaUtils = {
  /**
   * Announce text to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  /**
   * Generate unique IDs for ARIA relationships
   */
  generateId: (prefix: string = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Set ARIA expanded state
   */
  setExpanded: (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString());
  },

  /**
   * Set ARIA selected state
   */
  setSelected: (element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString());
  }
};

// Keyboard navigation
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation in a list
   */
  handleArrowKeys: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (newIndex: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    onIndexChange(newIndex);
    items[newIndex]?.focus();
  },

  /**
   * Handle escape key to close modals/dropdowns
   */
  handleEscape: (event: KeyboardEvent, onEscape: () => void) => {
    if (event.key === 'Escape') {
      onEscape();
    }
  }
};

// Color contrast utilities
export const colorContrast = {
  /**
   * Calculate relative luminance of a color
   */
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: [number, number, number], color2: [number, number, number]): number => {
    const lum1 = colorContrast.getLuminance(...color1);
    const lum2 = colorContrast.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if color combination meets WCAG AA standards
   */
  meetsWCAG: (color1: [number, number, number], color2: [number, number, number]): boolean => {
    const ratio = colorContrast.getContrastRatio(color1, color2);
    return ratio >= 4.5; // WCAG AA standard
  }
};

// Screen reader utilities
export const screenReader = {
  /**
   * Check if screen reader is likely active
   */
  isActive: (): boolean => {
    // This is a heuristic and not 100% reliable
    return window.navigator.userAgent.includes('NVDA') ||
           window.navigator.userAgent.includes('JAWS') ||
           window.speechSynthesis?.speaking === true ||
           document.body.classList.contains('screen-reader-active');
  },

  /**
   * Add screen reader only text
   */
  addSROnlyText: (element: HTMLElement, text: string) => {
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = text;
    element.appendChild(srText);
  }
};

// Motion preferences
export const motionPreferences = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Apply animation only if motion is not reduced
   */
  conditionalAnimation: (element: HTMLElement, animationClass: string) => {
    if (!motionPreferences.prefersReducedMotion()) {
      element.classList.add(animationClass);
    }
  }
};

// Form accessibility
export const formAccessibility = {
  /**
   * Associate label with form control
   */
  associateLabel: (label: HTMLLabelElement, control: HTMLElement) => {
    const id = control.id || ariaUtils.generateId('form-control');
    control.id = id;
    label.setAttribute('for', id);
  },

  /**
   * Add error message to form control
   */
  addErrorMessage: (control: HTMLElement, message: string) => {
    const errorId = ariaUtils.generateId('error');
    const errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    
    control.setAttribute('aria-describedby', errorId);
    control.setAttribute('aria-invalid', 'true');
    control.parentNode?.insertBefore(errorElement, control.nextSibling);
  },

  /**
   * Remove error message from form control
   */
  removeErrorMessage: (control: HTMLElement) => {
    const errorId = control.getAttribute('aria-describedby');
    if (errorId) {
      const errorElement = document.getElementById(errorId);
      errorElement?.remove();
      control.removeAttribute('aria-describedby');
      control.removeAttribute('aria-invalid');
    }
  }
};