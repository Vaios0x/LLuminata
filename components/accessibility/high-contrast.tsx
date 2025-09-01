import React, { createContext, useContext, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Palette, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HighContrastContextType {
  isEnabled: boolean;
  toggle: () => void;
  theme: 'light' | 'dark' | 'high-contrast';
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineSpacing: number;
  setLineSpacing: (spacing: number) => void;
  getStyles: (baseStyles?: React.CSSProperties) => React.CSSProperties;
}

const HighContrastContext = createContext<HighContrastContextType | undefined>(undefined);

export const useHighContrast = () => {
  const context = useContext(HighContrastContext);
  if (!context) {
    throw new Error('useHighContrast must be used within a HighContrastProvider');
  }
  return context;
};

interface HighContrastProviderProps {
  children: React.ReactNode;
  defaultEnabled?: boolean;
}

export const HighContrastProvider: React.FC<HighContrastProviderProps> = ({
  children,
  defaultEnabled = false
}) => {
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');
  const [fontSize, setFontSize] = useState(16);
  const [lineSpacing, setLineSpacing] = useState(1.5);

  // Aplicar estilos de alto contraste
  useEffect(() => {
    const root = document.documentElement;
    
    if (isEnabled) {
      root.style.setProperty('--high-contrast', 'enabled');
      root.style.setProperty('--font-size-base', `${fontSize}px`);
      root.style.setProperty('--line-height-base', lineSpacing.toString());
      
      // Aplicar tema de alto contraste
      if (theme === 'high-contrast') {
        root.classList.add('high-contrast');
        root.classList.remove('dark');
      } else if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('high-contrast');
      } else {
        root.classList.remove('dark', 'high-contrast');
      }
    } else {
      root.style.removeProperty('--high-contrast');
      root.style.removeProperty('--font-size-base');
      root.style.removeProperty('--line-height-base');
      root.classList.remove('high-contrast');
    }
  }, [isEnabled, theme, fontSize, lineSpacing]);

  // Guardar preferencias en localStorage
  useEffect(() => {
    const preferences = {
      isEnabled,
      theme,
      fontSize,
      lineSpacing
    };
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
  }, [isEnabled, theme, fontSize, lineSpacing]);

  // Cargar preferencias al inicializar
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-preferences');
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        setIsEnabled(preferences.isEnabled ?? defaultEnabled);
        setTheme(preferences.theme ?? 'light');
        setFontSize(preferences.fontSize ?? 16);
        setLineSpacing(preferences.lineSpacing ?? 1.5);
      } catch (error) {
        console.error('Error loading accessibility preferences:', error);
      }
    }
  }, [defaultEnabled]);

  const toggle = () => {
    setIsEnabled(!isEnabled);
  };

  const getStyles = (baseStyles: React.CSSProperties = {}) => {
    if (!isEnabled) return baseStyles;

    return {
      ...baseStyles,
      fontSize: `${fontSize}px`,
      lineHeight: lineSpacing,
      '--font-size-base': `${fontSize}px`,
      '--line-height-base': lineSpacing
    } as React.CSSProperties;
  };

  const value: HighContrastContextType = {
    isEnabled,
    toggle,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    lineSpacing,
    setLineSpacing,
    getStyles
  };

  return (
    <HighContrastContext.Provider value={value}>
      {children}
    </HighContrastContext.Provider>
  );
};

interface HighContrastControlsProps {
  className?: string;
  showAdvanced?: boolean;
}

export const HighContrastControls: React.FC<HighContrastControlsProps> = ({
  className,
  showAdvanced = true
}) => {
  const { 
    isEnabled, 
    toggle, 
    theme, 
    setTheme, 
    fontSize, 
    setFontSize, 
    lineSpacing, 
    setLineSpacing 
  } = useHighContrast();
  
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Accesibilidad Visual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle principal */}
        <div className="flex items-center gap-2">
          <Button
            onClick={toggle}
            variant={isEnabled ? "default" : "outline"}
            size="sm"
            className="flex-1"
            aria-label={isEnabled ? "Desactivar accesibilidad visual" : "Activar accesibilidad visual"}
          >
            {isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {isEnabled ? "Activado" : "Desactivado"}
          </Button>
        </div>

        {/* Configuración de tema */}
        {isEnabled && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Tema:</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === 'light' ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex items-center gap-1"
              >
                <Sun className="h-3 w-3" />
                Claro
              </Button>
              <Button
                variant={theme === 'dark' ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex items-center gap-1"
              >
                <Moon className="h-3 w-3" />
                Oscuro
              </Button>
              <Button
                variant={theme === 'high-contrast' ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme('high-contrast')}
                className="flex items-center gap-1"
              >
                <Palette className="h-3 w-3" />
                Alto Contraste
              </Button>
            </div>
          </div>
        )}

        {/* Configuración avanzada */}
        {showAdvanced && isEnabled && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full justify-between"
            >
              <span>Configuración avanzada</span>
              <Palette className="h-4 w-4" />
            </Button>

            {showAdvancedSettings && (
              <div className="space-y-4 pt-2 border-t">
                {/* Tamaño de fuente */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Tamaño de fuente: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                    aria-label="Ajustar tamaño de fuente"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Pequeño</span>
                    <span>Grande</span>
                  </div>
                </div>

                {/* Espaciado de líneas */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Espaciado de líneas: {lineSpacing.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="1.2"
                    max="2.5"
                    step="0.1"
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                    className="w-full"
                    aria-label="Ajustar espaciado de líneas"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Compacto</span>
                    <span>Espaciado</span>
                  </div>
                </div>

                {/* Vista previa */}
                <div className="p-3 bg-muted rounded-md">
                  <p 
                    className="text-sm"
                    style={{
                      fontSize: `${fontSize}px`,
                      lineHeight: lineSpacing
                    }}
                  >
                    Este es un ejemplo de texto con la configuración actual.
                    Puedes ver cómo se ve el tamaño de fuente y el espaciado.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Información */}
        {isEnabled && (
          <div className="text-xs text-muted-foreground">
            <p>Configuración aplicada globalmente.</p>
            <p>Las preferencias se guardan automáticamente.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para aplicar estilos de alto contraste
export const HighContrastWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isEnabled, theme } = useHighContrast();

  return (
    <div
      className={cn(
        "transition-all duration-200",
        isEnabled && "high-contrast-enabled",
        theme === 'high-contrast' && "high-contrast-theme"
      )}
      style={{
        '--font-size-base': isEnabled ? 'var(--font-size-base, 16px)' : '16px',
        '--line-height-base': isEnabled ? 'var(--line-height-base, 1.5)' : '1.5'
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

// Hook para aplicar estilos de alto contraste a componentes específicos
export const useHighContrastStyles = () => {
  const { isEnabled, fontSize, lineSpacing } = useHighContrast();

  const getStyles = (baseStyles: React.CSSProperties = {}) => {
    if (!isEnabled) return baseStyles;

    return {
      ...baseStyles,
      fontSize: `${fontSize}px`,
      lineHeight: lineSpacing,
      '--font-size-base': `${fontSize}px`,
      '--line-height-base': lineSpacing
    } as React.CSSProperties;
  };

  return { getStyles, isEnabled };
};
