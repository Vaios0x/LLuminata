'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Database, 
  Shield, 
  Globe, 
  Server, 
  Bell, 
  Save, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SystemSettingsProps {
  className?: string;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ className = '' }) => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'LLuminata',
      siteDescription: 'Plataforma educativa inclusiva de IA',
      maintenanceMode: false,
      debugMode: false,
      timezone: 'America/Mexico_City'
    },
    database: {
      host: 'localhost',
      port: '5432',
      name: 'inclusive_ai_coach',
      maxConnections: 20,
      connectionTimeout: 30000
    },
    security: {
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      require2FA: false,
      passwordMinLength: 8,
      enableRateLimiting: true
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: '',
      smtpPass: '',
          fromEmail: 'noreply@lluminata.com',
    fromName: 'LLuminata'
    },
    monitoring: {
      enableLogging: true,
      logLevel: 'info',
      enableMetrics: true,
      alertThreshold: 80
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        // Mostrar notificación de éxito
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-gray-600 mt-1">Gestiona la configuración global del sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadSettings} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="database">Base de Datos</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoreo</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre del Sitio</label>
                  <Input
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Input
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Zona Horaria</label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value: string) => updateSetting('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Mexico_City">México (GMT-6)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokio (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked: boolean) => updateSetting('general', 'maintenanceMode', checked)}
                />
                <label className="text-sm">Modo Mantenimiento</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.general.debugMode}
                  onCheckedChange={(checked: boolean) => updateSetting('general', 'debugMode', checked)}
                />
                <label className="text-sm">Modo Debug</label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Configuración de Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Host</label>
                  <Input
                    value={settings.database.host}
                    onChange={(e) => updateSetting('database', 'host', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Puerto</label>
                  <Input
                    value={settings.database.port}
                    onChange={(e) => updateSetting('database', 'port', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nombre de BD</label>
                  <Input
                    value={settings.database.name}
                    onChange={(e) => updateSetting('database', 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Conexiones Máximas</label>
                  <Input
                    type="number"
                    value={settings.database.maxConnections}
                    onChange={(e) => updateSetting('database', 'maxConnections', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Configuración de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Timeout de Sesión (segundos)</label>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Intentos Máximos de Login</label>
                  <Input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Longitud Mínima de Contraseña</label>
                  <Input
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.security.require2FA}
                  onCheckedChange={(checked: boolean) => updateSetting('security', 'require2FA', checked)}
                />
                <label className="text-sm">Requerir 2FA</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.security.enableRateLimiting}
                  onCheckedChange={(checked: boolean) => updateSetting('security', 'enableRateLimiting', checked)}
                />
                <label className="text-sm">Habilitar Rate Limiting</label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Configuración de Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">SMTP Host</label>
                  <Input
                    value={settings.email.smtpHost}
                    onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SMTP Puerto</label>
                  <Input
                    value={settings.email.smtpPort}
                    onChange={(e) => updateSetting('email', 'smtpPort', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Usuario SMTP</label>
                  <Input
                    value={settings.email.smtpUser}
                    onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contraseña SMTP</label>
                  <Input
                    type="password"
                    value={settings.email.smtpPass}
                    onChange={(e) => updateSetting('email', 'smtpPass', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email Remitente</label>
                  <Input
                    value={settings.email.fromEmail}
                    onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nombre Remitente</label>
                  <Input
                    value={settings.email.fromName}
                    onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="w-5 h-5 mr-2" />
                Configuración de Monitoreo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nivel de Log</label>
                  <Select
                    value={settings.monitoring.logLevel}
                    onValueChange={(value: string) => updateSetting('monitoring', 'logLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Umbral de Alerta (%)</label>
                  <Input
                    type="number"
                    value={settings.monitoring.alertThreshold}
                    onChange={(e) => updateSetting('monitoring', 'alertThreshold', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.monitoring.enableLogging}
                  onCheckedChange={(checked: boolean) => updateSetting('monitoring', 'enableLogging', checked)}
                />
                <label className="text-sm">Habilitar Logging</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.monitoring.enableMetrics}
                  onCheckedChange={(checked: boolean) => updateSetting('monitoring', 'enableMetrics', checked)}
                />
                <label className="text-sm">Habilitar Métricas</label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
