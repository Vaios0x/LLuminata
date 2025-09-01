'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Eye, 
  EyeOff,
  User,
  Settings,
  Download,
  Trash2,
  CheckCircle,
  X,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  FileText,
  Database,
  Globe,
  Lock,
  Unlock,
  Key,
  Copy,
  RefreshCw,
  Activity,
  BarChart3,
  Zap,
  Target,
  Crosshair,
  MapPin,
  Timer,
  RotateCcw,
  Play,
  Pause,
  Plus,
  Minus,
  AlertOctagon,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Ban,
  Hash,
  Fingerprint,
  LockKeyhole,
  UnlockKeyhole,
  FileText as FileTextIcon,
  Code,
  Network,
  Server,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  CheckCircle as CheckCircleIcon,
  XCircle,
  Loader2,
  Save,
  Edit,
  ExternalLink,
  Link,
  Unlink,
  Bell,
  Mail,
  Phone,
  Video as VideoIcon,
  Image,
  Monitor,
  Smartphone,
  Tablet,
  Cpu,
  HardDrive,
  Maximize2,
  Minimize2,
  MousePointer,
  Scroll,
  Move,
  Filter,
  Search,
  Archive,
  Share
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrivacyConsent {
  id: string;
  userId: string;
  consentType: 'analytics' | 'marketing' | 'necessary' | 'preferences' | 'third_party';
  isGranted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  expiresAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  version: string;
  description: string;
  isRequired: boolean;
}

interface DataRequest {
  id: string;
  userId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  submittedAt: Date;
  completedAt?: Date;
  description: string;
  dataTypes: string[];
  estimatedCompletion?: Date;
  notes?: string;
}

interface PrivacySettings {
  id: string;
  userId: string;
  dataRetention: {
    analytics: number; // días
    marketing: number;
    userData: number;
    logs: number;
  };
  dataSharing: {
    thirdParty: boolean;
    analytics: boolean;
    marketing: boolean;
    research: boolean;
  };
  notifications: {
    dataBreach: boolean;
    policyChanges: boolean;
    consentUpdates: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
}

interface DataCategory {
  id: string;
  name: string;
  description: string;
  isCollected: boolean;
  isShared: boolean;
  retentionPeriod: number;
  legalBasis: string;
  examples: string[];
}

export default function PrivacyPage() {
  const [consents, setConsents] = useState<PrivacyConsent[]>([]);
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [dataCategories, setDataCategories] = useState<DataCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'consents' | 'requests' | 'settings' | 'data'>('overview');
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Datos de ejemplo
  const mockConsents: PrivacyConsent[] = [
    {
      id: 'consent_1',
      userId: 'user_123',
      consentType: 'necessary',
      isGranted: true,
      grantedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      version: '1.0',
      description: 'Cookies necesarias para el funcionamiento del sitio',
      isRequired: true
    },
    {
      id: 'consent_2',
      userId: 'user_123',
      consentType: 'analytics',
      isGranted: true,
      grantedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      version: '1.0',
      description: 'Análisis de uso y estadísticas',
      isRequired: false
    },
    {
      id: 'consent_3',
      userId: 'user_123',
      consentType: 'marketing',
      isGranted: false,
      revokedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      version: '1.0',
      description: 'Publicidad personalizada y marketing',
      isRequired: false
    }
  ];

  const mockDataRequests: DataRequest[] = [
    {
      id: 'request_1',
      userId: 'user_123',
      requestType: 'access',
      status: 'completed',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      description: 'Solicitud de acceso a datos personales',
      dataTypes: ['profile', 'activity', 'preferences'],
      notes: 'Datos exportados y enviados por email'
    },
    {
      id: 'request_2',
      userId: 'user_123',
      requestType: 'erasure',
      status: 'processing',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      description: 'Solicitud de eliminación de datos',
      dataTypes: ['marketing_data', 'analytics_data']
    }
  ];

  const mockPrivacySettings: PrivacySettings = {
    id: 'settings_1',
    userId: 'user_123',
    dataRetention: {
      analytics: 90,
      marketing: 365,
      userData: 2555,
      logs: 30
    },
    dataSharing: {
      thirdParty: false,
      analytics: true,
      marketing: false,
      research: false
    },
    notifications: {
      dataBreach: true,
      policyChanges: true,
      consentUpdates: true
    },
    preferences: {
      language: 'es-MX',
      timezone: 'America/Mexico_City',
      dateFormat: 'DD/MM/YYYY'
    }
  };

  const mockDataCategories: DataCategory[] = [
    {
      id: 'cat_1',
      name: 'Datos de Perfil',
      description: 'Información básica del usuario',
      isCollected: true,
      isShared: false,
      retentionPeriod: 2555,
      legalBasis: 'Consentimiento',
      examples: ['Nombre', 'Email', 'Fecha de nacimiento']
    },
    {
      id: 'cat_2',
      name: 'Datos de Actividad',
      description: 'Información sobre el uso de la plataforma',
      isCollected: true,
      isShared: false,
      retentionPeriod: 90,
      legalBasis: 'Interés legítimo',
      examples: ['Páginas visitadas', 'Tiempo de sesión', 'Acciones realizadas']
    },
    {
      id: 'cat_3',
      name: 'Datos de Preferencias',
      description: 'Configuraciones y preferencias del usuario',
      isCollected: true,
      isShared: false,
      retentionPeriod: 2555,
      legalBasis: 'Consentimiento',
      examples: ['Idioma', 'Tema', 'Notificaciones']
    }
  ];

  useEffect(() => {
    loadPrivacyData();
  }, []);

  const loadPrivacyData = async () => {
    try {
      setIsLoading(true);
      // Simulando carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConsents(mockConsents);
      setDataRequests(mockDataRequests);
      setPrivacySettings(mockPrivacySettings);
      setDataCategories(mockDataCategories);
    } catch (error) {
      console.error('Error loading privacy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConsentTypeColor = (type: string) => {
    switch (type) {
      case 'necessary': return 'text-blue-600 bg-blue-100';
      case 'analytics': return 'text-green-600 bg-green-100';
      case 'marketing': return 'text-purple-600 bg-purple-100';
      case 'preferences': return 'text-orange-600 bg-orange-100';
      case 'third_party': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'access': return <Eye className="w-4 h-4" />;
      case 'rectification': return <Edit className="w-4 h-4" />;
      case 'erasure': return <Trash2 className="w-4 h-4" />;
      case 'portability': return <Download className="w-4 h-4" />;
      case 'restriction': return <Lock className="w-4 h-4" />;
      case 'objection': return <Ban className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRetentionPeriod = (days: number) => {
    if (days < 30) return `${days} días`;
    if (days < 365) return `${Math.floor(days / 30)} meses`;
    return `${Math.floor(days / 365)} años`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacidad</h1>
              <p className="text-gray-600">Gestión de datos personales y configuración de privacidad</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setShowConsentModal(true)}
              variant="outline"
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Actualizar consentimientos"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar Consentimientos</span>
            </Button>
            <Button 
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Nueva solicitud de datos"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Solicitud</span>
            </Button>
          </div>
        </div>

        {/* Métricas de privacidad */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Consentimientos Activos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {consents.filter(c => c.isGranted).length}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                de {consents.length} total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Solicitudes Pendientes</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {dataRequests.filter(r => r.status === 'pending' || r.status === 'processing').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Requieren atención
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Cumplimiento GDPR</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">98%</p>
              <p className="text-xs text-gray-600 mt-1">
                Excelente estado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Categorías de Datos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {dataCategories.length}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Gestionadas activamente
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'consents', label: 'Consentimientos', icon: CheckCircle },
              { id: 'requests', label: 'Solicitudes', icon: FileText },
              { id: 'settings', label: 'Configuración', icon: Settings },
              { id: 'data', label: 'Datos', icon: Database }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm",
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                  tabIndex={0}
                  aria-label={`Ver ${tab.label}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Estado de privacidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span>Estado de Privacidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Cumplimiento GDPR</h4>
                  <div className="text-3xl font-bold text-green-600">98%</div>
                  <Progress value={98} className="mt-2" />
                  <p className="text-sm text-gray-600 mt-1">Excelente cumplimiento</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Consentimientos Válidos</h4>
                  <div className="text-3xl font-bold text-blue-600">
                    {consents.filter(c => c.isGranted).length}/{consents.length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Consentimientos activos</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Solicitudes Pendientes</h4>
                  <div className="text-3xl font-bold text-orange-600">
                    {dataRequests.filter(r => r.status === 'pending' || r.status === 'processing').length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Requieren procesamiento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consentimientos recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span>Consentimientos Recientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {consents.slice(0, 3).map((consent) => (
                  <div key={consent.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge className={cn("text-xs", getConsentTypeColor(consent.consentType))}>
                        {consent.consentType === 'necessary' ? 'Necesario' :
                         consent.consentType === 'analytics' ? 'Analíticas' :
                         consent.consentType === 'marketing' ? 'Marketing' :
                         consent.consentType === 'preferences' ? 'Preferencias' : 'Terceros'}
                      </Badge>
                      <div>
                        <div className="font-medium">{consent.description}</div>
                        <div className="text-sm text-gray-600">
                          {consent.isGranted ? 'Concedido' : 'Rechazado'} • v{consent.version}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {consent.grantedAt ? formatDate(consent.grantedAt) : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'consents' && (
        <div className="space-y-4">
          {consents.map((consent) => (
            <Card key={consent.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={cn("w-5 h-5", consent.isGranted ? "text-green-600" : "text-red-600")} />
                    <div>
                      <h3 className="font-semibold">{consent.description}</h3>
                      <p className="text-sm text-gray-600">
                        Tipo: {consent.consentType} • Versión: {consent.version}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", getConsentTypeColor(consent.consentType))}>
                      {consent.consentType === 'necessary' ? 'Necesario' :
                       consent.consentType === 'analytics' ? 'Analíticas' :
                       consent.consentType === 'marketing' ? 'Marketing' :
                       consent.consentType === 'preferences' ? 'Preferencias' : 'Terceros'}
                    </Badge>
                    <Badge variant={consent.isGranted ? "default" : "secondary"} className="text-xs">
                      {consent.isGranted ? 'Concedido' : 'Rechazado'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Estado:</span>
                    <div className="font-medium">{consent.isGranted ? 'Activo' : 'Inactivo'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Concedido:</span>
                    <div className="font-medium">
                      {consent.grantedAt ? formatDate(consent.grantedAt) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Requerido:</span>
                    <div className="font-medium">{consent.isRequired ? 'Sí' : 'No'}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    ID: {consent.id}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Ver detalles del consentimiento"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Detalles
                    </Button>
                    {!consent.isRequired && (
                      <Button 
                        size="sm"
                        variant={consent.isGranted ? "outline" : "default"}
                        tabIndex={0}
                        aria-label={consent.isGranted ? "Revocar consentimiento" : "Conceder consentimiento"}
                      >
                        {consent.isGranted ? <X className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                        {consent.isGranted ? 'Revocar' : 'Conceder'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {dataRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getRequestTypeIcon(request.requestType)}
                    <div>
                      <h3 className="font-semibold">{request.description}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(request.submittedAt)} • {request.dataTypes.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", getRequestStatusColor(request.status))}>
                      {request.status === 'pending' ? 'Pendiente' :
                       request.status === 'processing' ? 'Procesando' :
                       request.status === 'completed' ? 'Completado' : 'Rechazado'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {request.requestType === 'access' ? 'Acceso' :
                       request.requestType === 'rectification' ? 'Rectificación' :
                       request.requestType === 'erasure' ? 'Eliminación' :
                       request.requestType === 'portability' ? 'Portabilidad' :
                       request.requestType === 'restriction' ? 'Restricción' : 'Oposición'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <div className="font-medium capitalize">{request.requestType}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Datos:</span>
                    <div className="font-medium">{request.dataTypes.length} categorías</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Estimado:</span>
                    <div className="font-medium">
                      {request.estimatedCompletion ? formatDate(request.estimatedCompletion) : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    ID: {request.id}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedRequest(request)}
                      tabIndex={0}
                      aria-label="Ver detalles de la solicitud"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Detalles
                    </Button>
                    {request.status === 'completed' && (
                      <Button 
                        size="sm"
                        tabIndex={0}
                        aria-label="Descargar datos"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Descargar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'settings' && privacySettings && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Privacidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Retención de datos */}
                <div>
                  <h4 className="font-medium mb-4">Retención de Datos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Analíticas (días)</label>
                      <input 
                        type="number" 
                        defaultValue={privacySettings.dataRetention.analytics}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Marketing (días)</label>
                      <input 
                        type="number" 
                        defaultValue={privacySettings.dataRetention.marketing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Datos de Usuario (días)</label>
                      <input 
                        type="number" 
                        defaultValue={privacySettings.dataRetention.userData}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Logs (días)</label>
                      <input 
                        type="number" 
                        defaultValue={privacySettings.dataRetention.logs}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Compartir datos */}
                <div>
                  <h4 className="font-medium mb-4">Compartir Datos</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={privacySettings.dataSharing.analytics}
                        className="mr-2"
                      />
                      <span>Compartir datos para análisis</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={privacySettings.dataSharing.marketing}
                        className="mr-2"
                      />
                      <span>Compartir datos para marketing</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={privacySettings.dataSharing.research}
                        className="mr-2"
                      />
                      <span>Compartir datos para investigación</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={privacySettings.dataSharing.thirdParty}
                        className="mr-2"
                      />
                      <span>Compartir con terceros</span>
                    </label>
                  </div>
                </div>

                {/* Notificaciones */}
                <div>
                  <h4 className="font-medium mb-4">Notificaciones</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={privacySettings.notifications.dataBreach}
                        className="mr-2"
                      />
                      <span>Alertas de violación de datos</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={privacySettings.notifications.policyChanges}
                        className="mr-2"
                      />
                      <span>Cambios en políticas de privacidad</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={privacySettings.notifications.consentUpdates}
                        className="mr-2"
                      />
                      <span>Actualizaciones de consentimiento</span>
                    </label>
                  </div>
                </div>

                <Button className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-4">
          {dataCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={category.isCollected ? "default" : "secondary"} className="text-xs">
                      {category.isCollected ? 'Recopilado' : 'No recopilado'}
                    </Badge>
                    <Badge variant={category.isShared ? "default" : "secondary"} className="text-xs">
                      {category.isShared ? 'Compartido' : 'No compartido'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Retención:</span>
                    <div className="font-medium">{formatRetentionPeriod(category.retentionPeriod)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Base Legal:</span>
                    <div className="font-medium">{category.legalBasis}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Ejemplos:</span>
                    <div className="font-medium">{category.examples.length} tipos</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-sm text-gray-600">Ejemplos de datos:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {category.examples.map((example, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    ID: {category.id}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Ver detalles de la categoría"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Detalles
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Exportar datos de la categoría"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalles de solicitud */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalles de la Solicitud</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedRequest(null)}
                  tabIndex={0}
                  aria-label="Cerrar detalles"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Información General</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>ID:</strong> {selectedRequest.id}</div>
                      <div><strong>Tipo:</strong> {selectedRequest.requestType}</div>
                      <div><strong>Estado:</strong> {selectedRequest.status}</div>
                      <div><strong>Usuario:</strong> {selectedRequest.userId}</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Información Temporal</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>Solicitado:</strong> {formatDate(selectedRequest.submittedAt)}</div>
                      {selectedRequest.completedAt && (
                        <div><strong>Completado:</strong> {formatDate(selectedRequest.completedAt)}</div>
                      )}
                      {selectedRequest.estimatedCompletion && (
                        <div><strong>Estimado:</strong> {formatDate(selectedRequest.estimatedCompletion)}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Descripción</h5>
                  <p className="text-sm text-gray-600">{selectedRequest.description}</p>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Tipos de Datos</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedRequest.dataTypes.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {selectedRequest.notes && (
                  <div>
                    <h5 className="font-medium mb-2">Notas</h5>
                    <p className="text-sm text-gray-600">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3 mr-1" />
                    Exportar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="w-3 h-3 mr-1" />
                    Compartir
                  </Button>
                  {selectedRequest.status === 'pending' && (
                    <Button size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Procesar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
