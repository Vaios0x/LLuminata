// Componentes de Accesibilidad
export { 
  HighContrastProvider, 
  HighContrastControls, 
  HighContrastWrapper, 
  useHighContrast, 
  useHighContrastStyles 
} from './high-contrast';

export { 
  ScreenReaderProvider, 
  ScreenReaderControls, 
  useScreenReader, 
  useScreenReaderAnnouncement, 
  ScreenReaderAnnouncer 
} from './screen-reader';

export { 
  AccessibilityPanel, 
  AccessibilityHelp, 
  useAccessibilityPanel 
} from './accessibility-panel';

export { 
  VoiceControlProvider, 
  VoiceControlPanel, 
  useVoiceControl, 
  useVoiceCommands, 
  NavigationVoiceCommands 
} from './voice-control';

export { default as BrailleDisplay } from './BrailleDisplay';

// Hook de accesibilidad
export { useAccessibility } from '../../lib/hooks/useAccessibility';
