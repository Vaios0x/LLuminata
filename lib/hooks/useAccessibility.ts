import { useState, useEffect } from 'react';

interface AccessibilitySettings {
  fontSize: number;
  contrast: 'normal' | 'high';
  voiceEnabled: boolean;
  readingAssist: boolean;
  reducedMotion: boolean;
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    contrast: 'normal',
    voiceEnabled: false,
    readingAssist: false,
    reducedMotion: false
  });

  useEffect(() => {
    // Cargar configuración desde localStorage
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Detectar preferencias del sistema
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSettings(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches
    }));
  }, []);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(updatedSettings));
  };

  const toggleVoice = () => {
    updateSettings({ voiceEnabled: !settings.voiceEnabled });
  };

  const toggleReadingAssist = () => {
    updateSettings({ readingAssist: !settings.readingAssist });
  };

  const toggleContrast = () => {
    updateSettings({ 
      contrast: settings.contrast === 'normal' ? 'high' : 'normal' 
    });
  };

  const increaseFontSize = () => {
    updateSettings({ fontSize: Math.min(settings.fontSize + 2, 24) });
  };

  const decreaseFontSize = () => {
    updateSettings({ fontSize: Math.max(settings.fontSize - 2, 12) });
  };

  const speakText = (text: string, language: string = 'es-MX') => {
    if (settings.voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  return {
    ...settings,
    isHighContrast: settings.contrast === 'high',
    isLargeText: settings.fontSize > 16,
    updateSettings,
    toggleVoice,
    toggleReadingAssist,
    toggleContrast,
    increaseFontSize,
    decreaseFontSize,
    speakText
  };
}
