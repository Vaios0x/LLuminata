'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para controles de privacidad
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
    newFeatures: boolean;
  };
  lastUpdated: Date;
}

interface PrivacyMetrics {
  totalUsers: number;
  activeConsents: number;
  pendingRequests: number;
  completedRequests: number;
  dataBreaches: number;
  policyUpdates: number;
  averageResponseTime: number;
  complianceScore: number;
}

interface PrivacyControlsProps {
  userId: string;
  isAdmin?: boolean;
  onConsentUpdated?: (consent: PrivacyConsent) => void;
  onRequestSubmitted?: (request: DataRequest) => void;
  onSettingsUpdated?: (settings: PrivacySettings) => void;
  onExportData?: (data: any) => void;
  className?: string;
}

// Datos de ejemplo
const SAMPLE_CONSENTS: PrivacyConsent[] = [
  {
    id: 'consent_1',
    userId: 'user_123',
    consentType: 'analytics',
    isGranted: true,
    grantedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    version: '1.0',
    description: 'Recopilación de datos analíticos para mejorar el servicio',
    isRequired: false
  },
  {
    id: 'consent_2',
    userId: 'user_123',
    consentType: 'marketing',
    isGranted: false,
    revokedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    version: '1.0',
    description: 'Envío de comunicaciones comerciales',
    isRequired: false
  },
  {
    id: 'consent_3',
    userId: 'user_123',
    consentType: 'necessary',
    isGranted: true,
    grantedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    version: '1.0',
    description: 'Datos necesarios para el funcionamiento del servicio',
    isRequired: true
  }
];

const SAMPLE_REQUESTS: DataRequest[] = [
  {
    id: 'request_1',
    userId: 'user_123',
    requestType: 'access',
    status: 'completed',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    description: 'Solicitud de acceso a datos personales',
    dataTypes: ['profile', 'activity', 'preferences']
  },
  {
    id: 'request_2',
    userId: 'user_456',
    requestType: 'erasure',
    status: 'processing',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    estimatedCompletion: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    description: 'Solicitud de eliminación de datos personales',
    dataTypes: ['all'],
    notes: 'Procesando eliminación de todos los datos del usuario'
  }
];

const SAMPLE_SETTINGS: PrivacySettings = {
  id: 'settings_1',
  userId: 'user_123',
  dataRetention: {
    analytics: 365,
    marketing: 90,
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
    newFeatures: false
  },
  lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
};

export function PrivacyControls({
  userId,
  isAdmin = false,
  onConsentUpdated,
  onRequestSubmitted,
  onSettingsUpdated,
  onExportData,
  className
}: PrivacyControlsProps) {
  const [consents, setConsents] = useState<PrivacyConsent[]>(SAMPLE_CONSENTS);
  const [requests, setRequests] = useState<DataRequest[]>(SAMPLE_REQUESTS);
  const [settings, setSettings] = useState<PrivacySettings>(SAMPLE_SETTINGS);
  const [metrics, setMetrics] = useState<PrivacyMetrics>({
    totalUsers: 15420,
    activeConsents: 12350,
    pendingRequests: 45,
    completedRequests: 892,
    dataBreaches: 0,
    policyUpdates: 3,
    averageResponseTime: 2.5,
    complianceScore: 98
  });
  const [selectedConsent, setSelectedConsent] = useState<PrivacyConsent | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'consents' | 'requests' | 'settings' | 'metrics'>('consents');

  // Actualizar métricas
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      activeConsents: consents.filter(c => c.isGranted).length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      completedRequests: requests.filter(r => r.status === 'completed').length
    }));
  }, [consents, requests]);

  // Actualizar consentimiento
  const updateConsent = useCallback((consentId: string, isGranted: boolean) => {
    setConsents(prev => prev.map(consent => {
      if (consent.id === consentId) {
        const updatedConsent: PrivacyConsent = {
          ...consent,
          isGranted,
          grantedAt: isGranted ? new Date() : undefined,
          revokedAt: !isGranted ? new Date() : undefined
        };
        
        if (onConsentUpdated) {
          onConsentUpdated(updatedConsent);
        }
        
        return updatedConsent;
      }
      return consent;
    }));
  }, [onConsentUpdated]);

  // Enviar solicitud de datos
  const submitDataRequest = useCallback((requestType: DataRequest['requestType'], description: string, dataTypes: string[]) => {
    const newRequest: DataRequest = {
      id: `request_${Date.now()}`,
      userId,
      requestType,
      status: 'pending',
      submittedAt: new Date(),
      description,
      dataTypes
    };

    setRequests(prev => [newRequest, ...prev]);
    
    if (onRequestSubmitted) {
      onRequestSubmitted(newRequest);
    }
  }, [userId, onRequestSubmitted]);

  // Actualizar configuración
  const updateSettings = useCallback((updates: Partial<PrivacySettings>) => {
    const updatedSettings: PrivacySettings = {
      ...settings,
      ...updates,
      lastUpdated: new Date()
    };

    setSettings(updatedSettings);
    
    if (onSettingsUpdated) {
      onSettingsUpdated(updatedSettings);
    }
  }, [settings, onSettingsUpdated]);

  // Exportar datos personales
  const exportPersonalData = useCallback(() => {
    const personalData = {
      userId,
      timestamp: new Date(),
      consents: consents.filter(c => c.userId === userId),
      settings: settings,
      requests: requests.filter(r => r.userId === userId)
    };

    if (onExportData) {
      onExportData(personalData);
    } else {
      // Descarga directa
      const blob = new Blob([JSON.stringify(personalData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal-data-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [userId, consents, settings, requests, onExportData]);

  // Obtener color por estado de solicitud
  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'processing': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'pending': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Obtener icono por tipo de solicitud
  const getRequestIcon = (requestType: string) => {
    switch (requestType) {
      case 'access': return <Eye className="w-4 h-4" />;
      case 'erasure': return <Trash2 className="w-4 h-4" />;
      case 'portability': return <Download className="w-4 h-4" />;
      case 'rectification': return <Edit className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Card className={cn("w-full max-w-7xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Controles de Privacidad y GDPR
            </CardTitle>
            <CardDescription>
              Gestión de consentimientos, derechos de usuario y configuración de privacidad
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportPersonalData}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Datos
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Panel de Métricas */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas de Privacidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usuarios Totales</span>
                    <span className="font-medium">{metrics.totalUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Consentimientos Activos</span>
                    <span className="font-medium text-green-600">{metrics.activeConsents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Solicitudes Pendientes</span>
                    <span className="font-medium text-orange-600">{metrics.pendingRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Solicitudes Completadas</span>
                    <span className="font-medium text-blue-600">{metrics.completedRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tiempo Promedio Respuesta</span>
                    <span className="font-medium">{metrics.averageResponseTime} días</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Puntuación de Cumplimiento</span>
                    <span className="font-medium text-green-600">{metrics.complianceScore}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Derechos GDPR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => submitDataRequest('access', 'Solicitud de acceso a datos personales', ['profile', 'activity'])}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Acceso a Datos
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => submitDataRequest('portability', 'Solicitud de portabilidad de datos', ['all'])}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Portabilidad
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => submitDataRequest('rectification', 'Solicitud de rectificación de datos', ['profile'])}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Rectificación
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={() => submitDataRequest('erasure', 'Solicitud de eliminación de datos', ['all'])}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminación
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs de navegación */}
            <div className="flex space-x-1 border-b">
              <button
                onClick={() => setActiveTab('consents')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                  activeTab === 'consents' 
                    ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700" 
                    : "text-gray-600 hover:text-gray-800"
                )}
                tabIndex={0}
                aria-label="Ver consentimientos"
              >
                Consentimientos
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                  activeTab === 'requests' 
                    ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700" 
                    : "text-gray-600 hover:text-gray-800"
                )}
                tabIndex={0}
                aria-label="Ver solicitudes"
              >
                Solicitudes
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                  activeTab === 'settings' 
                    ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700" 
                    : "text-gray-600 hover:text-gray-800"
                )}
                tabIndex={0}
                aria-label="Ver configuración"
              >
                Configuración
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                    activeTab === 'metrics' 
                      ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700" 
                      : "text-gray-600 hover:text-gray-800"
                  )}
                  tabIndex={0}
                  aria-label="Ver métricas"
                >
                  Métricas
                </button>
              )}
            </div>

            {/* Contenido de las tabs */}
            {activeTab === 'consents' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Consentimientos de Privacidad</h3>
                <div className="space-y-4">
                  {consents.map((consent) => (
                    <Card key={consent.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{consent.consentType.replace('_', ' ').toUpperCase()}</h4>
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", consent.isGranted ? "text-green-600" : "text-red-600")}
                              >
                                {consent.isGranted ? 'Concedido' : 'Rechazado'}
                              </Badge>
                              {consent.isRequired && (
                                <Badge variant="outline" className="text-xs text-gray-600">
                                  Requerido
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{consent.description}</p>
                            <div className="text-xs text-muted-foreground">
                              {consent.isGranted ? (
                                <span>Concedido el {consent.grantedAt?.toLocaleDateString()}</span>
                              ) : (
                                <span>Rechazado el {consent.revokedAt?.toLocaleDateString()}</span>
                              )}
                              {consent.expiresAt && (
                                <span> • Expira el {consent.expiresAt.toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          
                          {!consent.isRequired && (
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateConsent(consent.id, !consent.isGranted)}
                                className={consent.isGranted ? "text-red-600" : "text-green-600"}
                              >
                                {consent.isGranted ? (
                                  <>
                                    <X className="w-4 h-4 mr-1" />
                                    Revocar
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Conceder
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Solicitudes de Datos</h3>
                <div className="space-y-4">
                  {requests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No hay solicitudes de datos</p>
                    </div>
                  ) : (
                    requests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              {getRequestIcon(request.requestType)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{request.requestType.toUpperCase()}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getRequestStatusColor(request.status))}
                                >
                                  {request.status}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Solicitado: {request.submittedAt.toLocaleDateString()}</span>
                                {request.completedAt && (
                                  <span>Completado: {request.completedAt.toLocaleDateString()}</span>
                                )}
                                {request.estimatedCompletion && (
                                  <span>Estimado: {request.estimatedCompletion.toLocaleDateString()}</span>
                                )}
                                <span>Tipos: {request.dataTypes.join(', ')}</span>
                              </div>
                              
                              {request.notes && (
                                <p className="text-xs text-muted-foreground mt-2 italic">{request.notes}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Configuración de Privacidad</h3>
                
                {/* Retención de Datos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Retención de Datos</CardTitle>
                    <CardDescription>
                      Configura cuánto tiempo se conservan tus datos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Datos Analíticos</label>
                        <select
                          value={settings.dataRetention.analytics}
                          onChange={(e) => updateSettings({
                            dataRetention: { ...settings.dataRetention, analytics: parseInt(e.target.value) }
                          })}
                          className="w-full p-2 border rounded-md text-sm"
                          tabIndex={0}
                          aria-label="Retención de datos analíticos"
                        >
                          <option value={30}>30 días</option>
                          <option value={90}>90 días</option>
                          <option value={180}>6 meses</option>
                          <option value={365}>1 año</option>
                          <option value={730}>2 años</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Datos de Marketing</label>
                        <select
                          value={settings.dataRetention.marketing}
                          onChange={(e) => updateSettings({
                            dataRetention: { ...settings.dataRetention, marketing: parseInt(e.target.value) }
                          })}
                          className="w-full p-2 border rounded-md text-sm"
                          tabIndex={0}
                          aria-label="Retención de datos de marketing"
                        >
                          <option value={30}>30 días</option>
                          <option value={90}>90 días</option>
                          <option value={180}>6 meses</option>
                          <option value={365}>1 año</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Datos de Usuario</label>
                        <select
                          value={settings.dataRetention.userData}
                          onChange={(e) => updateSettings({
                            dataRetention: { ...settings.dataRetention, userData: parseInt(e.target.value) }
                          })}
                          className="w-full p-2 border rounded-md text-sm"
                          tabIndex={0}
                          aria-label="Retención de datos de usuario"
                        >
                          <option value={2555}>7 años</option>
                          <option value={1825}>5 años</option>
                          <option value={1095}>3 años</option>
                          <option value={730}>2 años</option>
                          <option value={365}>1 año</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Logs del Sistema</label>
                        <select
                          value={settings.dataRetention.logs}
                          onChange={(e) => updateSettings({
                            dataRetention: { ...settings.dataRetention, logs: parseInt(e.target.value) }
                          })}
                          className="w-full p-2 border rounded-md text-sm"
                          tabIndex={0}
                          aria-label="Retención de logs del sistema"
                        >
                          <option value={7}>7 días</option>
                          <option value={30}>30 días</option>
                          <option value={90}>90 días</option>
                          <option value={180}>6 meses</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Compartir Datos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compartir Datos</CardTitle>
                    <CardDescription>
                      Controla con quién se comparten tus datos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Terceros</h4>
                          <p className="text-sm text-muted-foreground">Compartir datos con servicios externos</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.dataSharing.thirdParty}
                          onChange={(e) => updateSettings({
                            dataSharing: { ...settings.dataSharing, thirdParty: e.target.checked }
                          })}
                          className="rounded"
                          tabIndex={0}
                          aria-label="Compartir datos con terceros"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Analíticas</h4>
                          <p className="text-sm text-muted-foreground">Datos para análisis y mejora del servicio</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.dataSharing.analytics}
                          onChange={(e) => updateSettings({
                            dataSharing: { ...settings.dataSharing, analytics: e.target.checked }
                          })}
                          className="rounded"
                          tabIndex={0}
                          aria-label="Compartir datos para analíticas"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Marketing</h4>
                          <p className="text-sm text-muted-foreground">Datos para comunicaciones comerciales</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.dataSharing.marketing}
                          onChange={(e) => updateSettings({
                            dataSharing: { ...settings.dataSharing, marketing: e.target.checked }
                          })}
                          className="rounded"
                          tabIndex={0}
                          aria-label="Compartir datos para marketing"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Investigación</h4>
                          <p className="text-sm text-muted-foreground">Datos anonimizados para investigación</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.dataSharing.research}
                          onChange={(e) => updateSettings({
                            dataSharing: { ...settings.dataSharing, research: e.target.checked }
                          })}
                          className="rounded"
                          tabIndex={0}
                          aria-label="Compartir datos para investigación"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notificaciones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notificaciones</CardTitle>
                    <CardDescription>
                      Configura qué notificaciones recibir
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Violaciones de Datos</h4>
                          <p className="text-sm text-muted-foreground">Notificar sobre incidentes de seguridad</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.dataBreach}
                          onChange={(e) => updateSettings({
                            notifications: { ...settings.notifications, dataBreach: e.target.checked }
                          })}
                          className="rounded"
                          tabIndex={0}
                          aria-label="Notificaciones de violaciones de datos"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Cambios de Política</h4>
                          <p className="text-sm text-muted-foreground">Notificar sobre cambios en la política de privacidad</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.policyChanges}
                          onChange={(e) => updateSettings({
                            notifications: { ...settings.notifications, policyChanges: e.target.checked }
                          })}
                          className="rounded"
                          tabIndex={0}
                          aria-label="Notificaciones de cambios de política"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Nuevas Funciones</h4>
                          <p className="text-sm text-muted-foreground">Notificar sobre nuevas funcionalidades</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.newFeatures}
                          onChange={(e) => updateSettings({
                            notifications: { ...settings.notifications, newFeatures: e.target.checked }
                          })}
                          className="rounded"
                          tabIndex={0}
                          aria-label="Notificaciones de nuevas funciones"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'metrics' && isAdmin && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Métricas de Cumplimiento</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cumplimiento GDPR</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Puntuación General</span>
                          <span className="font-medium text-green-600">{metrics.complianceScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${metrics.complianceScore}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Basado en consentimientos, solicitudes y configuración
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Violaciones de Datos</span>
                          <span className="font-medium text-green-600">{metrics.dataBreaches}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Actualizaciones de Política</span>
                          <span className="font-medium">{metrics.policyUpdates}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Tiempo Promedio Respuesta</span>
                          <span className="font-medium">{metrics.averageResponseTime} días</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Última actualización: {settings.lastUpdated.toLocaleDateString()}</span>
          <span>•</span>
          <span>Puntuación de cumplimiento: {metrics.complianceScore}%</span>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportPersonalData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Datos Personales
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Componente adicional para icono de edición
const Edit = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
