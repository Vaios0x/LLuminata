'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InclusiveAvatar } from '@/components/ui/inclusive-avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Star,
  Award,
  BookOpen,
  Target,
  Activity,
  Download,
  Upload,
  RefreshCw,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Key,
  Bell,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Copy,
  ExternalLink,
  Link,
  Unlink,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Brain,
  Lightbulb,
  GraduationCap,
  Trophy,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Play,
  Pause,
  SkipForward,
  Rewind,
  Volume2,
  VolumeX,
  Info,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  avatar?: string;
  lastLogin: string;
  joinDate: string;
  lessonsCompleted: number;
  totalScore: number;
  averageScore: number;
  timeSpent: number;
  achievements: number;
  badges: number;
  region: string;
  device: string;
  preferences: {
    language: string;
    accessibility: {
      fontSize: string;
      contrast: string;
      screenReader: boolean;
    };
  };
}

interface UserManagementProps {
  className?: string;
  refreshInterval?: number;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  className = '',
  refreshInterval = 60000 // 1 minuto
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData.users);
        setFilteredUsers(usersData.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Datos de prueba
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'María González',
          email: 'maria@example.com',
          role: 'STUDENT',
          status: 'active',
          avatar: '/avatars/maria.jpg',
          lastLogin: '2024-01-20T10:30:00Z',
          joinDate: '2024-09-15',
          lessonsCompleted: 24,
          totalScore: 2150,
          averageScore: 89.6,
          timeSpent: 45.2,
          achievements: 8,
          badges: 3,
          region: 'América Latina',
          device: 'Móvil',
          preferences: {
            language: 'es',
            accessibility: {
              fontSize: 'medium',
              contrast: 'normal',
              screenReader: false
            }
          }
        },
        {
          id: '2',
          name: 'Carlos Ruiz',
          email: 'carlos@example.com',
          role: 'TEACHER',
          status: 'active',
          avatar: '/avatars/carlos.jpg',
          lastLogin: '2024-01-20T09:15:00Z',
          joinDate: '2024-08-20',
          lessonsCompleted: 0,
          totalScore: 0,
          averageScore: 0,
          timeSpent: 0,
          achievements: 0,
          badges: 0,
          region: 'Europa',
          device: 'Desktop',
          preferences: {
            language: 'en',
            accessibility: {
              fontSize: 'large',
              contrast: 'high',
              screenReader: true
            }
          }
        },
        {
          id: '3',
          name: 'Ana Martínez',
          email: 'ana@example.com',
          role: 'STUDENT',
          status: 'inactive',
          avatar: '/avatars/ana.jpg',
          lastLogin: '2024-01-15T14:20:00Z',
          joinDate: '2024-10-05',
          lessonsCompleted: 12,
          totalScore: 1080,
          averageScore: 90.0,
          timeSpent: 28.5,
          achievements: 5,
          badges: 2,
          region: 'Asia',
          device: 'Tablet',
          preferences: {
            language: 'es',
            accessibility: {
              fontSize: 'medium',
              contrast: 'normal',
              screenReader: false
            }
          }
        }
      ];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    const interval = setInterval(loadUsers, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  useEffect(() => {
    let filtered = users;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'suspended':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'TEACHER':
        return 'bg-blue-100 text-blue-800';
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch('/api/admin/users/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userIds: selectedUsers
        })
      });

      if (response.ok) {
        await loadUsers();
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            onClick={loadUsers}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Actualizar
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>

          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Agregar Usuario
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.status === 'active').length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'STUDENT').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((users.filter(u => u.role === 'STUDENT').length / users.length) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maestros</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'TEACHER').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((users.filter(u => u.role === 'TEACHER').length / users.length) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'ADMIN').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((users.filter(u => u.role === 'ADMIN').length / users.length) * 100)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="STUDENT">Estudiantes</SelectItem>
                <SelectItem value="TEACHER">Maestros</SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">
                Seleccionar todos ({selectedUsers.length})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones Masivas */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Acciones Masivas ({selectedUsers.length} usuarios seleccionados)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => handleBulkAction('activate')}
                variant="outline"
                size="sm"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Activar
              </Button>

              <Button
                onClick={() => handleBulkAction('deactivate')}
                variant="outline"
                size="sm"
              >
                <UserX className="w-4 h-4 mr-2" />
                Desactivar
              </Button>

              <Button
                onClick={() => handleBulkAction('suspend')}
                variant="outline"
                size="sm"
              >
                <Lock className="w-4 h-4 mr-2" />
                Suspender
              </Button>

              <Button
                onClick={() => handleBulkAction('delete')}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>
            Usuarios ({filteredUsers.length} de {users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleUserSelect(user.id)}
                  />
                  
                  <div className="h-10 w-10">
                    {user.avatar ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          <InclusiveAvatar size={40} variant="minimal" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <InclusiveAvatar size={40} variant="colorful" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1">{user.status}</span>
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.lessonsCompleted} lecciones</p>
                    <p className="text-xs text-gray-600">Puntuación: {user.averageScore}%</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDetails(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalles del Usuario */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                    <AvatarFallback className="text-lg">
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getRoleColor(selectedUser.role)}>
                        {selectedUser.role}
                      </Badge>
                      <Badge className={getStatusColor(selectedUser.status)}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Último login: {new Date(selectedUser.lastLogin).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Fecha de registro: {new Date(selectedUser.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Región: {selectedUser.region}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Dispositivo principal: {selectedUser.device}</span>
                  </div>
                </div>
              </div>

              {/* Estadísticas de Aprendizaje */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{selectedUser.lessonsCompleted}</div>
                  <p className="text-sm text-gray-600">Lecciones Completadas</p>
                </div>
                
                <div className="p-4 border rounded-lg text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{selectedUser.averageScore}%</div>
                  <p className="text-sm text-gray-600">Puntuación Promedio</p>
                </div>
                
                <div className="p-4 border rounded-lg text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">{selectedUser.timeSpent}h</div>
                  <p className="text-sm text-gray-600">Tiempo Total</p>
                </div>
                
                <div className="p-4 border rounded-lg text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{selectedUser.achievements}</div>
                  <p className="text-sm text-gray-600">Logros</p>
                </div>
              </div>

              {/* Preferencias */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Preferencias</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Idioma</p>
                    <p className="font-medium">{selectedUser.preferences.language === 'es' ? 'Español' : 'English'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tamaño de fuente</p>
                    <p className="font-medium">{selectedUser.preferences.accessibility.fontSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contraste</p>
                    <p className="font-medium">{selectedUser.preferences.accessibility.contrast}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lector de pantalla</p>
                    <p className="font-medium">{selectedUser.preferences.accessibility.screenReader ? 'Habilitado' : 'Deshabilitado'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
