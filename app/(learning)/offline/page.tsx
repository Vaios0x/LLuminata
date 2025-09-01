import React from 'react';
import { OfflineContentManager } from '@/components/offline/offline-content-manager';
import { CulturalContentViewer } from '@/components/offline/cultural-content-viewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  WifiOff, 
  Globe, 
  BookOpen, 
  HardDrive,
  Users,
  Star,
  Clock
} from 'lucide-react';

export default function OfflinePage() {
  // En producción, esto vendría de la sesión del usuario
  const studentId = 'student-123';
  const culture = 'maya';
  const language = 'es-GT';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Contenido Offline</h1>
        <p className="text-muted-foreground">
          Descarga y accede a contenido educativo sin conexión a internet
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            Modo Offline
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {culture}
          </Badge>
          <Badge variant="outline">{language}</Badge>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Paquetes instalados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">Lecciones disponibles</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">156MB</div>
                <div className="text-sm text-muted-foreground">Espacio usado</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">12h</div>
                <div className="text-sm text-muted-foreground">Tiempo offline</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <Tabs defaultValue="manager" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manager" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Gestor de Contenido
          </TabsTrigger>
          <TabsTrigger value="viewer" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Visor de Contenido
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manager" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Gestión de Paquetes Offline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OfflineContentManager
                studentId={studentId}
                culture={culture}
                language={language}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="viewer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Visor de Contenido Cultural
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CulturalContentViewer
                contentId="lesson-456"
                culture={culture}
                language={language}
                isOffline={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Beneficios del Modo Offline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Acceso sin conexión</h4>
                <p className="text-sm text-muted-foreground">
                  Estudia en cualquier lugar, incluso sin internet
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Contenido adaptado</h4>
                <p className="text-sm text-muted-foreground">
                  Lecciones personalizadas para tu cultura e idioma
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Sincronización automática</h4>
                <p className="text-sm text-muted-foreground">
                  Tu progreso se sincroniza cuando hay conexión
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Culturas Soportadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Maya</span>
              <Badge variant="secondary">Completo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Náhuatl</span>
              <Badge variant="secondary">Completo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Afrodescendiente</span>
              <Badge variant="outline">En desarrollo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">K'iche'</span>
              <Badge variant="outline">En desarrollo</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consejos de uso */}
      <Card>
        <CardHeader>
          <CardTitle>Consejos para el Uso Offline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">📱 Antes de salir</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Descarga paquetes cuando tengas WiFi</li>
                <li>• Verifica que tienes espacio suficiente</li>
                <li>• Revisa que las descargas estén completas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🎯 Durante el uso</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Completa las lecciones sin interrupciones</li>
                <li>• Toma notas en tu cuaderno</li>
                <li>• Practica con las actividades interactivas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🔄 Al regresar</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Conecta a internet para sincronizar</li>
                <li>• Descarga nuevos paquetes disponibles</li>
                <li>• Comparte tu progreso con tu maestro</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
