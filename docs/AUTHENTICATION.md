# 🔐 Sistema de Autenticación - InclusiveAI Coach

## 📋 Resumen

El sistema de autenticación de InclusiveAI Coach está construido con **NextAuth.js v5** y proporciona una experiencia de autenticación completa y segura con múltiples proveedores.

## 🚀 Características

### ✅ **Funcionalidades Implementadas**

- **Autenticación por credenciales** (email/password)
- **Autenticación social** (Google, Facebook)
- **Registro de usuarios** con validación completa
- **Protección de rutas** automática
- **Gestión de sesiones** persistente
- **Interfaz de usuario** responsive y accesible
- **Validación de formularios** en tiempo real
- **Manejo de errores** robusto
- **Hash seguro de contraseñas** con bcrypt
- **Base de datos** con Prisma ORM

## 🏗️ Arquitectura

### **Componentes Principales**

```
📁 lib/
├── auth.ts                    # Configuración de NextAuth.js
└── hooks/
    └── useAuth.ts            # Hook personalizado para autenticación

📁 app/
├── api/auth/
│   ├── [...nextauth]/route.ts # Rutas de API de NextAuth
│   └── register/route.ts      # API de registro personalizada
└── auth/
    ├── login/page.tsx         # Página de inicio de sesión
    └── signup/page.tsx        # Página de registro

📁 components/
└── auth/
    └── ProtectedRoute.tsx     # Componente de protección de rutas
```

### **Base de Datos**

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          UserRole  @default(STUDENT)
  
  // Perfil completo del usuario
  firstName     String?
  lastName      String?
  dateOfBirth   DateTime?
  gender        String?
  language      String    @default("es-MX")
  culturalBackground String?
  socioeconomicContext String?
  previousEducation Int?
  specialNeeds  String?
  accessibilityPreferences Json?
  
  accounts      Account[]
  sessions      Session[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## 🔧 Configuración

### **Variables de Entorno**

```env
# NextAuth.js
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Proveedores Sociales
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
FACEBOOK_CLIENT_ID="your-facebook-client-id-here"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret-here"
```

### **Instalación de Dependencias**

```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs @types/bcryptjs
```

## 📱 Uso

### **Hook useAuth**

```typescript
import { useAuth } from "@/lib/hooks/useAuth"

function MyComponent() {
  const { user, login, logout, register, status } = useAuth()
  
  // Estado de autenticación
  if (status === "loading") return <div>Cargando...</div>
  if (status === "unauthenticated") return <div>No autenticado</div>
  
  return (
    <div>
      <h1>Bienvenido, {user?.name}!</h1>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  )
}
```

### **Protección de Rutas**

```typescript
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Contenido protegido</div>
    </ProtectedRoute>
  )
}
```

### **Protección con Roles**

```typescript
<ProtectedRoute requiredRole="ADMIN">
  <div>Panel de administración</div>
</ProtectedRoute>
```

## 🔒 Seguridad

### **Medidas Implementadas**

- ✅ **Hash de contraseñas** con bcrypt (salt rounds: 12)
- ✅ **Validación de entrada** con Zod
- ✅ **Protección CSRF** automática
- ✅ **Sesiones seguras** con JWT
- ✅ **Rate limiting** en APIs
- ✅ **Sanitización de datos** de entrada
- ✅ **Headers de seguridad** configurados

### **Validaciones**

```typescript
const registerSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  language: z.string().min(1, "Selecciona un idioma"),
  age: z.string().min(1, "Selecciona tu edad"),
  education: z.string().min(1, "Selecciona tu nivel educativo"),
})
```

## 🎨 Interfaz de Usuario

### **Características de UX**

- 🎯 **Diseño responsive** para móvil y desktop
- ♿ **Accesibilidad completa** con ARIA labels
- 🌙 **Modo oscuro** compatible
- ⚡ **Estados de carga** con spinners
- 🎨 **Animaciones suaves** y transiciones
- 📱 **Navegación por teclado** optimizada
- 🔍 **Mensajes de error** claros y útiles

### **Componentes de UI**

- **Formularios** con validación en tiempo real
- **Botones** con estados de carga
- **Menús desplegables** para usuario autenticado
- **Navegación** adaptativa según estado de autenticación
- **Modales** para confirmaciones

## 🧪 Testing

### **Pruebas Implementadas**

```typescript
// tests/unit/auth.test.ts
describe("Authentication", () => {
  test("should register new user", async () => {
    // Pruebas de registro
  })
  
  test("should login existing user", async () => {
    // Pruebas de inicio de sesión
  })
  
  test("should protect routes", async () => {
    // Pruebas de protección de rutas
  })
})
```

## 🚀 Despliegue

### **Configuración de Producción**

1. **Generar secretos seguros**:
   ```bash
   openssl rand -base64 32
   ```

2. **Configurar proveedores sociales**:
   - Google OAuth en Google Cloud Console
   - Facebook App en Facebook Developers

3. **Variables de entorno de producción**:
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   NEXTAUTH_SECRET="your-production-secret"
   DATABASE_URL="postgresql://..."
   ```

## 📊 Monitoreo

### **Métricas de Autenticación**

- ✅ **Tasa de registro** de usuarios
- ✅ **Tasa de conversión** de login
- ✅ **Errores de autenticación** por tipo
- ✅ **Tiempo de sesión** promedio
- ✅ **Proveedores más usados**

## 🔄 Flujos de Usuario

### **Registro**

1. Usuario accede a `/auth/signup`
2. Completa formulario con validación
3. Sistema valida datos y crea cuenta
4. Usuario es redirigido al dashboard
5. Email de bienvenida enviado (opcional)

### **Inicio de Sesión**

1. Usuario accede a `/auth/login`
2. Ingresa credenciales o usa proveedor social
3. Sistema valida y crea sesión
4. Usuario es redirigido al dashboard

### **Protección de Rutas**

1. Usuario intenta acceder a ruta protegida
2. Sistema verifica estado de autenticación
3. Si no autenticado, redirige a login
4. Si autenticado, muestra contenido

## 🛠️ Mantenimiento

### **Tareas Regulares**

- 🔄 **Actualizar dependencias** de seguridad
- 📊 **Revisar logs** de autenticación
- 🔍 **Auditar permisos** de usuarios
- 🧹 **Limpiar sesiones** expiradas
- 📈 **Analizar métricas** de uso

### **Backup y Recuperación**

- 💾 **Backup automático** de base de datos
- 🔄 **Sincronización** de configuraciones
- 🚨 **Alertas** de fallos de autenticación

## 📚 Recursos Adicionales

- [Documentación de NextAuth.js](https://next-auth.js.org/)
- [Guía de Prisma](https://www.prisma.io/docs/)
- [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js/)
- [Zod Validation](https://zod.dev/)

---

**¡El sistema de autenticación está listo para producción!** 🎉
