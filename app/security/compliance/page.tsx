'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
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
  Code,
  UserCheck,
  UserX,
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
  Share,
  Database,
  Globe,
  Lock,
  Unlock,
  Key,
  Copy,
  Activity,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'draft';
  complianceScore: number;
  lastAudit: Date;
  nextAudit: Date;
  requirements: ComplianceRequirement[];
}

interface ComplianceRequirement {
  id: string;
  frameworkId: string;
  code: string;
  title: string;
  description: string;
  category: 'security' | 'privacy' | 'data' | 'access' | 'audit';
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  priority: 'low' | 'medium' | 'high' | 'critical';
  evidence: string[];
  lastChecked: Date;
  nextCheck: Date;
}

interface ComplianceAudit {
  id: string;
  frameworkId: string;
  title: string;
  description: string;
  auditor: string;
  startDate: Date;
  endDate?: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  findings: AuditFinding[];
  overallScore: number;
}

interface AuditFinding {
  id: string;
  auditId: string;
  requirementId: string;
  type: 'finding' | 'observation' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  dueDate?: Date;
  resolution?: string;
}

interface CompliancePolicy {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'privacy' | 'data' | 'access' | 'general';
  version: string;
  status: 'active' | 'draft' | 'archived';
  effectiveDate: Date;
  reviewDate: Date;
  content: string;
  attachments: string[];
}

export default function CompliancePage() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [audits, setAudits] = useState<ComplianceAudit[]>([]);
  const [policies, setPolicies] = useState<CompliancePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'frameworks' | 'audits' | 'policies' | 'reports'>('overview');
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<ComplianceAudit | null>(null);

  // Datos de ejemplo
  const mockFrameworks: ComplianceFramework[] = [
    {
      id: 'gdpr',
      name: 'GDPR (General Data Protection Regulation)',
      description: 'Reglamento General de Protección de Datos de la UE',
      version: '2018',
      status: 'active',
      complianceScore: 94,
      lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextAudit: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      requirements: []
    },
    {
      id: 'iso27001',
      name: 'ISO 27001 - Information Security Management',
      description: 'Sistema de Gestión de Seguridad de la Información',
      version: '2013',
      status: 'active',
      complianceScore: 87,
      lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      nextAudit: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      requirements: []
    },
    {
      id: 'sox',
      name: 'SOX (Sarbanes-Oxley Act)',
      description: 'Ley Sarbanes-Oxley para control financiero',
      version: '2002',
      status: 'active',
      complianceScore: 91,
      lastAudit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      nextAudit: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
      requirements: []
    }
  ];

  const mockAudits: ComplianceAudit[] = [
    {
      id: 'audit_1',
      frameworkId: 'gdpr',
      title: 'Auditoría GDPR Q1 2024',
      description: 'Auditoría trimestral de cumplimiento GDPR',
      auditor: 'Auditoría Interna',
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'completed',
      findings: [],
      overallScore: 94
    },
    {
      id: 'audit_2',
      frameworkId: 'iso27001',
      title: 'Auditoría ISO 27001 2024',
      description: 'Auditoría anual de certificación ISO 27001',
      auditor: 'Certificación Externa',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'planned',
      findings: [],
      overallScore: 0
    }
  ];

  const mockPolicies: CompliancePolicy[] = [
    {
      id: 'policy_1',
      name: 'Política de Seguridad de la Información',
      description: 'Política general de seguridad de la información',
      category: 'security',
      version: '2.1',
      status: 'active',
      effectiveDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      content: 'Contenido de la política...',
      attachments: ['security-policy.pdf', 'annex-a.pdf']
    },
    {
      id: 'policy_2',
      name: 'Política de Privacidad de Datos',
      description: 'Política de protección de datos personales',
      category: 'privacy',
      version: '1.5',
      status: 'active',
      effectiveDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      reviewDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      content: 'Contenido de la política...',
      attachments: ['privacy-policy.pdf']
    }
  ];

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFrameworks(mockFrameworks);
      setAudits(mockAudits);
      setPolicies(mockPolicies);
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'archived': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAuditStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'planned': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'privacy': return <Lock className="w-4 h-4" />;
      case 'data': return <Database className="w-4 h-4" />;
      case 'access': return <Key className="w-4 h-4" />;
      case 'audit': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getComplianceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excelente', color: 'text-green-600' };
    if (score >= 80) return { level: 'Bueno', color: 'text-blue-600' };
    if (score >= 70) return { level: 'Aceptable', color: 'text-yellow-600' };
    return { level: 'Necesita Mejora', color: 'text-red-600' };
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
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cumplimiento</h1>
              <p className="text-gray-600">Gestión de marcos de cumplimiento y auditorías</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadComplianceData()}
              variant="outline"
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Actualizar datos de cumplimiento"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
            <Button 
              className="flex items-center space-x-2"
              tabIndex={0}
              aria-label="Nueva auditoría"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Auditoría</span>
            </Button>
          </div>
        </div>

        {/* Métricas de cumplimiento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Cumplimiento Promedio</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {Math.round(frameworks.reduce((acc, f) => acc + f.complianceScore, 0) / frameworks.length)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {getComplianceLevel(Math.round(frameworks.reduce((acc, f) => acc + f.complianceScore, 0) / frameworks.length)).level}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Marcos Activos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {frameworks.filter(f => f.status === 'active').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                de {frameworks.length} total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Auditorías Pendientes</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {audits.filter(a => a.status === 'planned' || a.status === 'in_progress').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Requieren atención
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Políticas Activas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {policies.filter(p => p.status === 'active').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Vigentes
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
              { id: 'frameworks', label: 'Marcos', icon: Shield },
              { id: 'audits', label: 'Auditorías', icon: FileText },
              { id: 'policies', label: 'Políticas', icon: Settings },
              { id: 'reports', label: 'Reportes', icon: Download }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm",
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
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
          {/* Estado general de cumplimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span>Estado General de Cumplimiento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Puntuación Promedio</h4>
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(frameworks.reduce((acc, f) => acc + f.complianceScore, 0) / frameworks.length)}%
                  </div>
                  <Progress value={Math.round(frameworks.reduce((acc, f) => acc + f.complianceScore, 0) / frameworks.length)} className="mt-2" />
                  <p className="text-sm text-gray-600 mt-1">
                    {getComplianceLevel(Math.round(frameworks.reduce((acc, f) => acc + f.complianceScore, 0) / frameworks.length)).level}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Próximas Auditorías</h4>
                  <div className="text-3xl font-bold text-orange-600">
                    {audits.filter(a => a.status === 'planned').length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Programadas</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Políticas por Revisar</h4>
                  <div className="text-3xl font-bold text-blue-600">
                    {policies.filter(p => new Date(p.reviewDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">En los próximos 30 días</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marcos de cumplimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Marcos de Cumplimiento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frameworks.map((framework) => {
                  const complianceLevel = getComplianceLevel(framework.complianceScore);
                  return (
                    <div key={framework.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{framework.name}</div>
                          <div className="text-sm text-gray-600">
                            v{framework.version} • {framework.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn("text-2xl font-bold", complianceLevel.color)}>
                          {framework.complianceScore}%
                        </div>
                        <div className="text-sm text-gray-600">{complianceLevel.level}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'frameworks' && (
        <div className="space-y-4">
          {frameworks.map((framework) => {
            const complianceLevel = getComplianceLevel(framework.complianceScore);
            return (
              <Card key={framework.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{framework.name}</h3>
                        <p className="text-sm text-gray-600">{framework.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={cn("text-xs", getStatusColor(framework.status))}>
                        {framework.status === 'active' ? 'Activo' :
                         framework.status === 'inactive' ? 'Inactivo' :
                         framework.status === 'draft' ? 'Borrador' : 'Archivado'}
                      </Badge>
                      <Badge className={cn("text-xs", complianceLevel.color.replace('text-', 'bg-').replace('-600', '-100'))}>
                        {framework.complianceScore}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Versión:</span>
                      <div className="font-medium">{framework.version}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Última Auditoría:</span>
                      <div className="font-medium">{formatDate(framework.lastAudit)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Próxima Auditoría:</span>
                      <div className="font-medium">{formatDate(framework.nextAudit)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Nivel:</span>
                      <div className={cn("font-medium", complianceLevel.color)}>{complianceLevel.level}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      ID: {framework.id}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedFramework(framework)}
                        tabIndex={0}
                        aria-label="Ver detalles del marco"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Detalles
                      </Button>
                      <Button 
                        size="sm"
                        tabIndex={0}
                        aria-label="Generar reporte"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Reporte
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'audits' && (
        <div className="space-y-4">
          {audits.map((audit) => (
            <Card key={audit.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{audit.title}</h3>
                      <p className="text-sm text-gray-600">{audit.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", getAuditStatusColor(audit.status))}>
                      {audit.status === 'completed' ? 'Completada' :
                       audit.status === 'in_progress' ? 'En Progreso' :
                       audit.status === 'planned' ? 'Planificada' : 'Fallida'}
                    </Badge>
                    {audit.overallScore > 0 && (
                      <Badge className="text-xs bg-green-100 text-green-800">
                        {audit.overallScore}%
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Auditor:</span>
                    <div className="font-medium">{audit.auditor}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Fecha Inicio:</span>
                    <div className="font-medium">{formatDate(audit.startDate)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Fecha Fin:</span>
                    <div className="font-medium">
                      {audit.endDate ? formatDate(audit.endDate) : 'En curso'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Puntuación:</span>
                    <div className="font-medium">
                      {audit.overallScore > 0 ? `${audit.overallScore}%` : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    ID: {audit.id}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedAudit(audit)}
                      tabIndex={0}
                      aria-label="Ver detalles de la auditoría"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Detalles
                    </Button>
                    {audit.status === 'completed' && (
                      <Button 
                        size="sm"
                        tabIndex={0}
                        aria-label="Descargar reporte"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Reporte
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-4">
          {policies.map((policy) => (
            <Card key={policy.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{policy.name}</h3>
                      <p className="text-sm text-gray-600">{policy.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs", getStatusColor(policy.status))}>
                      {policy.status === 'active' ? 'Activa' :
                       policy.status === 'draft' ? 'Borrador' : 'Archivada'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      v{policy.version}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Categoría:</span>
                    <div className="font-medium capitalize">{policy.category}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Fecha Efectiva:</span>
                    <div className="font-medium">{formatDate(policy.effectiveDate)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Fecha Revisión:</span>
                    <div className="font-medium">{formatDate(policy.reviewDate)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Adjuntos:</span>
                    <div className="font-medium">{policy.attachments.length}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    ID: {policy.id}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      tabIndex={0}
                      aria-label="Ver política"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      size="sm"
                      tabIndex={0}
                      aria-label="Editar política"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generar Reportes de Cumplimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-4">Reportes Disponibles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <FileText className="w-6 h-6 mb-2" />
                      <span>Reporte de Cumplimiento General</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Shield className="w-6 h-6 mb-2" />
                      <span>Auditoría de Seguridad</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Lock className="w-6 h-6 mb-2" />
                      <span>Reporte de Privacidad</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <BarChart3 className="w-6 h-6 mb-2" />
                      <span>Métricas de Cumplimiento</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de detalles de marco */}
      {selectedFramework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalles del Marco</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedFramework(null)}
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
                      <div><strong>Nombre:</strong> {selectedFramework.name}</div>
                      <div><strong>Versión:</strong> {selectedFramework.version}</div>
                      <div><strong>Estado:</strong> {selectedFramework.status}</div>
                      <div><strong>Puntuación:</strong> {selectedFramework.complianceScore}%</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Fechas</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>Última Auditoría:</strong> {formatDate(selectedFramework.lastAudit)}</div>
                      <div><strong>Próxima Auditoría:</strong> {formatDate(selectedFramework.nextAudit)}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Descripción</h5>
                  <p className="text-sm text-gray-600">{selectedFramework.description}</p>
                </div>
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
                  <Button size="sm">
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de auditoría */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalles de la Auditoría</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAudit(null)}
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
                      <div><strong>Título:</strong> {selectedAudit.title}</div>
                      <div><strong>Auditor:</strong> {selectedAudit.auditor}</div>
                      <div><strong>Estado:</strong> {selectedAudit.status}</div>
                      <div><strong>Puntuación:</strong> {selectedAudit.overallScore}%</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Fechas</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>Inicio:</strong> {formatDate(selectedAudit.startDate)}</div>
                      <div><strong>Fin:</strong> {selectedAudit.endDate ? formatDate(selectedAudit.endDate) : 'En curso'}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Descripción</h5>
                  <p className="text-sm text-gray-600">{selectedAudit.description}</p>
                </div>
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
                  <Button size="sm">
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
