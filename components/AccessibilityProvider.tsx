// ABOUTME: Accessibility provider component for comprehensive accessibility features
// ABOUTME: Handles screen reader support, keyboard navigation, and accessibility preferences

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  reducedMotion: boolean;
  screenReaderAnnouncements: boolean;
  keyboardNavigation: boolean;
  visualIndicators: boolean;
  audioDescriptions: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (elementId: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: 'medium',
  reducedMotion: false,
  screenReaderAnnouncements: true,
  keyboardNavigation: true,
  visualIndicators: true,
  audioDescriptions: false
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [ariaLiveRegion, setAriaLiveRegion] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }

    // Detect system preferences
    detectSystemPreferences();

    // Create ARIA live region for announcements
    createAriaLiveRegion();

    // Setup keyboard navigation
    setupKeyboardNavigation();

    return () => {
      if (ariaLiveRegion && ariaLiveRegion.parentNode) {
        ariaLiveRegion.parentNode.removeChild(ariaLiveRegion);
      }
    };
  }, []);

  useEffect(() => {
    // Apply settings to document
    applySettingsToDocument();
    
    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const detectSystemPreferences = () => {
    // Detect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }

    // Detect high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      setSettings(prev => ({ ...prev, highContrast: true }));
    }

    // Listen for changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    motionQuery.addEventListener('change', (e) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
    });

    contrastQuery.addEventListener('change', (e) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
    });
  };

  const createAriaLiveRegion = () => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);
    setAriaLiveRegion(liveRegion);
  };

  const setupKeyboardNavigation = () => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip link functionality
      if (e.key === 'Tab' && !e.shiftKey && e.target === document.body) {
        const skipLink = document.querySelector('[href="#main-content"]') as HTMLElement;
        if (skipLink) {
          skipLink.focus();
        }
      }

      // Focus trap for modals
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
        if (activeModal) {
          const closeButton = activeModal.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }

      // Global keyboard shortcuts for audio controls
      if (e.key === ' ' || e.key === 'Spacebar') {
        const focusedElement = document.activeElement;
        if (focusedElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(focusedElement.tagName)) {
          return; // Don't interfere with form inputs
        }
        
        e.preventDefault();
        const playPauseButton = document.querySelector('[aria-label*="play"], [aria-label*="pause"]') as HTMLElement;
        if (playPauseButton) {
          playPauseButton.click();
          announceToScreenReader('Toggled audio playback', 'assertive');
        }
      }

      // Volume controls
      if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        const volumeSlider = document.querySelector('[aria-label*="volume"]') as HTMLInputElement;
        if (volumeSlider) {
          const currentValue = parseFloat(volumeSlider.value);
          const newValue = Math.min(1, currentValue + 0.1);
          volumeSlider.value = newValue.toString();
          volumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
          announceToScreenReader(`Volume ${Math.round(newValue * 100)}%`, 'assertive');
        }
      }

      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        const volumeSlider = document.querySelector('[aria-label*="volume"]') as HTMLInputElement;
        if (volumeSlider) {
          const currentValue = parseFloat(volumeSlider.value);
          const newValue = Math.max(0, currentValue - 0.1);
          volumeSlider.value = newValue.toString();
          volumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
          announceToScreenReader(`Volume ${Math.round(newValue * 100)}%`, 'assertive');
        }
      }

      // Mute toggle
      if (e.key === 'm' && e.altKey) {
        e.preventDefault();
        const muteButton = document.querySelector('[aria-label*="mute"], [aria-label*="unmute"]') as HTMLElement;
        if (muteButton) {
          muteButton.click();
        }
      }

      // Help shortcut
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        const helpButton = document.querySelector('[aria-label*="help"], [aria-label*="shortcuts"]') as HTMLElement;
        if (helpButton) {
          helpButton.click();
        } else {
          announceToScreenReader('Keyboard shortcuts: Space to play/pause, Alt+Up/Down for volume, Alt+M to mute, Escape to close dialogs', 'assertive');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  };

  const applySettingsToDocument = () => {
    const root = document.documentElement;

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size
    root.setAttribute('data-font-size', settings.fontSize);

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Visual indicators
    if (settings.visualIndicators) {
      root.classList.add('visual-indicators');
    } else {
      root.classList.remove('visual-indicators');
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Announce changes to screen reader
    if (settings.screenReaderAnnouncements) {
      announceToScreenReader(`${key} setting changed to ${value}`);
    }
  };

  const announceToScreenReader = (
    message: string, 
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    if (!settings.screenReaderAnnouncements || !ariaLiveRegion) return;

    ariaLiveRegion.setAttribute('aria-live', priority);
    ariaLiveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (ariaLiveRegion) {
        ariaLiveRegion.textContent = '';
      }
    }, 1000);
  };

  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      
      // Announce focus change for screen readers
      if (settings.screenReaderAnnouncements) {
        const elementText = element.textContent || element.getAttribute('aria-label') || 'element';
        announceToScreenReader(`Focused on ${elementText}`);
      }
    }
  };

  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    announceToScreenReader,
    focusElement
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

// Utility hook for keyboard navigation
export function useKeyboardNavigation() {
  const { settings } = useAccessibility();

  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleTabKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Add visible focus indicators
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      // Remove focus indicators when using mouse
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleTabKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleTabKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [settings.keyboardNavigation]);
}

// Custom hook for audio descriptions
export function useAudioDescriptions() {
  const { settings, announceToScreenReader } = useAccessibility();

  const describeAudioState = (isPlaying: boolean, mode?: string, frequency?: number, volume?: number) => {
    if (!settings.audioDescriptions) return;

    let description = '';
    if (isPlaying) {
      description = `Audio playing. ${mode ? `Mode: ${mode}. ` : ''}${frequency ? `Frequency: ${frequency} Hz. ` : ''}${volume !== undefined ? `Volume: ${Math.round(volume * 100)}%. ` : ''}`;
    } else {
      description = 'Audio stopped.';
    }

    announceToScreenReader(description, 'assertive');
  };

  const describeProgress = (percentage: number, timeRemaining?: string) => {
    if (!settings.audioDescriptions) return;

    const description = `Session progress: ${percentage}% complete. ${timeRemaining ? `Time remaining: ${timeRemaining}.` : ''}`;
    announceToScreenReader(description);
  };

  const describeVolumeChange = (volume: number, isMuted: boolean) => {
    if (!settings.audioDescriptions) return;

    const description = isMuted ? 'Audio muted' : `Volume set to ${Math.round(volume * 100)}%`;
    announceToScreenReader(description, 'assertive');
  };

  const describeModeChange = (mode: string, frequency: number, duration: number) => {
    if (!settings.audioDescriptions) return;

    const description = `Selected ${mode} mode. Frequency: ${frequency} Hz. Duration: ${duration} minutes.`;
    announceToScreenReader(description, 'assertive');
  };

  const describeSessionComplete = (totalTime: number) => {
    if (!settings.audioDescriptions) return;

    const description = `Session complete. Total time: ${totalTime} minutes.`;
    announceToScreenReader(description, 'assertive');
  };

  const describeKeyboardShortcuts = () => {
    if (!settings.audioDescriptions) return;

    const shortcuts = [
      'Space bar: Play or pause audio',
      'Alt plus Up arrow: Increase volume',
      'Alt plus Down arrow: Decrease volume',
      'Alt plus M: Toggle mute',
      'Shift plus question mark: Show this help',
      'Escape: Close dialogs',
      'Tab: Navigate between elements',
      'Enter or Space: Activate buttons and controls'
    ];

    const description = `Keyboard shortcuts available: ${shortcuts.join('. ')}.`;
    announceToScreenReader(description, 'assertive');
  };

  return {
    describeAudioState,
    describeProgress,
    describeVolumeChange,
    describeModeChange,
    describeSessionComplete,
    describeKeyboardShortcuts
  };
}