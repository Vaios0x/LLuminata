import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accessibility, 
  Volume2, 
  Mic, 
  Eye, 
  Settings, 
  X,
  HelpCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScreenReaderControls } from './screen-reader';
import { VoiceControlPanel } from './voice-control';
import { HighContrastControls } from './high-contrast';

interface AccessibilityPanelProps {
  className?: string;
  defaultOpen?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  className,
  defaultOpen = false,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState('general');

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4'
  };

  return (
    <div className={cn("fixed z-50", positionClasses[position])}>
      {/* Botón flotante */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "rounded-full shadow-lg transition-all duration-200",
          isOpen ? "scale-110" : "scale-100",
          "bg-primary hover:bg-primary/90"
        )}
        aria-label={isOpen ? "Cerrar panel de accesibilidad" : "Abrir panel de accesibilidad"}
      >
        <Accessibility className="h-5 w-5" />
      </Button>

      {/* Panel de accesibilidad */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-96 max-h-[80vh] overflow-hidden">
          <Card className="shadow-2xl border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Accessibility className="h-5 w-5" />
                  Accesibilidad
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  aria-label="Cerrar panel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general" className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="visual" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Visual
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="flex items-center gap-1">
                    <Volume2 className="h-3 w-3" />
                    Audio
                  </TabsTrigger>
                </TabsList>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  {/* Pestaña General */}
                  <TabsContent value="general" className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm">Configuración Rápida</h3>
                      
                      {/* Resumen de estado */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-muted rounded">
                          <div className="font-medium">Lector de Pantalla</div>
                          <div className="text-muted-foreground">Desactivado</div>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <div className="font-medium">Control por Voz</div>
                          <div className="text-muted-foreground">Desactivado</div>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <div className="font-medium">Alto Contraste</div>
                          <div className="text-muted-foreground">Desactivado</div>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <div className="font-medium">Tamaño de Fuente</div>
                          <div className="text-muted-foreground">Normal</div>
                        </div>
                      </div>

                      {/* Acciones rápidas */}
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Volume2 className="h-4 w-4 mr-2" />
                          Activar Lector de Pantalla
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Mic className="h-4 w-4 mr-2" />
                          Activar Control por Voz
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Eye className="h-4 w-4 mr-2" />
                          Activar Alto Contraste
                        </Button>
                      </div>

                      {/* Información */}
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="text-xs text-blue-800 dark:text-blue-200">
                            <p className="font-medium">Consejo de Accesibilidad</p>
                            <p>Usa las pestañas para configurar cada función específica de accesibilidad.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Pestaña Visual */}
                  <TabsContent value="visual" className="space-y-4">
                    <HighContrastControls showAdvanced={true} />
                  </TabsContent>

                  {/* Pestaña Audio */}
                  <TabsContent value="audio" className="space-y-4">
                    <div className="space-y-4">
                      <ScreenReaderControls showSettings={true} />
                      <VoiceControlPanel showCommands={true} showConfidence={true} />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Componente de ayuda de accesibilidad
export const AccessibilityHelp: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <Button
        onClick={() => setShowHelp(!showHelp)}
        variant="outline"
        size="sm"
        className="rounded-full shadow-lg"
        aria-label="Ayuda de accesibilidad"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {showHelp && (
        <div className="absolute bottom-full left-0 mb-2 w-80">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm">Ayuda de Accesibilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <h4 className="font-medium mb-1">Lector de Pantalla</h4>
                <p className="text-muted-foreground">
                  Convierte el texto en audio. Útil para personas con discapacidad visual.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Control por Voz</h4>
                <p className="text-muted-foreground">
                  Navega y controla la aplicación usando comandos de voz.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Alto Contraste</h4>
                <p className="text-muted-foreground">
                  Mejora la visibilidad con colores de alto contraste y fuentes más grandes.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Atajos de Teclado</h4>
                <p className="text-muted-foreground">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Tab</kbd> para navegar,{' '}
                  <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> para activar.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Hook para usar el panel de accesibilidad
export const useAccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return { isOpen, open, close, toggle };
};
