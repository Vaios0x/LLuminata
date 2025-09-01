export interface DemoUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher' | 'admin' | 'parent';
  profile: string;
  description: string;
  avatar?: string;
  culturalContext?: string;
  language?: string;
  preferences?: {
    accessibility: {
      fontSize: number;
      contrast: 'normal' | 'high';
      voiceEnabled: boolean;
    };
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export const demoUsers: DemoUser[] = [
  {
    id: 'demo-student-maya',
    email: 'estudiante.maya@demo.com',
    password: 'demo123',
    name: 'María López',
    role: 'student',
    profile: 'Estudiante Maya',
    description: 'Estudiante de 12 años aprendiendo matemáticas mayas y español',
    avatar: '👧',
    culturalContext: 'maya',
    language: 'es-MX',
    preferences: {
      accessibility: {
        fontSize: 16,
        contrast: 'normal',
        voiceEnabled: false
      },
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    }
  },
  {
    id: 'demo-student-nahuatl',
    email: 'estudiante.nahuatl@demo.com',
    password: 'demo123',
    name: 'Carlos Hernández',
    role: 'student',
    profile: 'Estudiante Náhuatl',
    description: 'Estudiante de 14 años aprendiendo náhuatl y ciencias',
    avatar: '👦',
    culturalContext: 'náhuatl',
    language: 'es-MX',
    preferences: {
      accessibility: {
        fontSize: 18,
        contrast: 'high',
        voiceEnabled: true
      },
      notifications: {
        email: true,
        push: true,
        sms: true
      }
    }
  },
  {
    id: 'demo-student-zapoteco',
    email: 'estudiante.zapoteco@demo.com',
    password: 'demo123',
    name: 'Ana Martínez',
    role: 'student',
    profile: 'Estudiante Zapoteco',
    description: 'Estudiante de 10 años aprendiendo zapoteco y arte',
    avatar: '👧',
    culturalContext: 'zapoteco',
    language: 'es-MX',
    preferences: {
      accessibility: {
        fontSize: 16,
        contrast: 'normal',
        voiceEnabled: false
      },
      notifications: {
        email: false,
        push: true,
        sms: false
      }
    }
  },
  {
    id: 'demo-teacher-bilingual',
    email: 'profesor.bilingue@demo.com',
    password: 'demo123',
    name: 'Prof. Elena Ramírez',
    role: 'teacher',
    profile: 'Profesor Bilingüe',
    description: 'Profesora bilingüe especializada en educación indígena',
    avatar: '👩‍🏫',
    culturalContext: 'general',
    language: 'es-MX',
    preferences: {
      accessibility: {
        fontSize: 16,
        contrast: 'normal',
        voiceEnabled: false
      },
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    }
  },
  {
    id: 'demo-teacher-indigenous',
    email: 'profesor.indigena@demo.com',
    password: 'demo123',
    name: 'Prof. Juan Morales',
    role: 'teacher',
    profile: 'Profesor Indígena',
    description: 'Profesor indígena experto en lenguas originarias',
    avatar: '👨‍🏫',
    culturalContext: 'maya',
    language: 'es-MX',
    preferences: {
      accessibility: {
        fontSize: 18,
        contrast: 'high',
        voiceEnabled: true
      },
      notifications: {
        email: true,
        push: true,
        sms: true
      }
    }
  },
  {
    id: 'demo-admin',
    email: 'admin@demo.com',
    password: 'demo123',
    name: 'Admin Sistema',
    role: 'admin',
    profile: 'Administrador',
    description: 'Administrador del sistema con acceso completo',
    avatar: '👨‍💼',
    culturalContext: 'general',
    language: 'es-MX',
    preferences: {
      accessibility: {
        fontSize: 16,
        contrast: 'normal',
        voiceEnabled: false
      },
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    }
  },
  {
    id: 'demo-parent',
    email: 'padre.familia@demo.com',
    password: 'demo123',
    name: 'Sra. Rosa García',
    role: 'parent',
    profile: 'Padre de Familia',
    description: 'Madre de familia siguiendo el progreso de sus hijos',
    avatar: '👩',
    culturalContext: 'general',
    language: 'es-MX',
    preferences: {
      accessibility: {
        fontSize: 16,
        contrast: 'normal',
        voiceEnabled: false
      },
      notifications: {
        email: true,
        push: false,
        sms: true
      }
    }
  }
];

export const getDemoUserByEmail = (email: string): DemoUser | undefined => {
  return demoUsers.find(user => user.email === email);
};

export const getDemoUsersByRole = (role: DemoUser['role']): DemoUser[] => {
  return demoUsers.filter(user => user.role === role);
};

export const getDemoUsersByCulturalContext = (context: string): DemoUser[] => {
  return demoUsers.filter(user => user.culturalContext === context);
};
