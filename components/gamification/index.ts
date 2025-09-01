// Componentes de Gamificación Avanzada
export { default as CompetitionBoard } from './CompetitionBoard';
export { default as ClanSystem } from './ClanSystem';
export { default as EventCalendar } from './EventCalendar';
export { default as TradingSystem } from './TradingSystem';
export { default as PersonalizationHub } from './PersonalizationHub';

// Componentes existentes
export { GamificationDashboard } from './gamification-dashboard';
export { GamificationNotification, useGamificationNotifications, GamificationToast } from './gamification-notification';

// Tipos comunes
export interface GamificationBaseProps {
  userId: string;
  className?: string;
  refreshInterval?: number;
}

// Enums y constantes
export enum GamificationEventType {
  LESSON_COMPLETED = 'LESSON_COMPLETED',
  ASSESSMENT_PASSED = 'ASSESSMENT_PASSED',
  BADGE_EARNED = 'BADGE_EARNED',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  LEVEL_UP = 'LEVEL_UP',
  COMPETITION_WON = 'COMPETITION_WON',
  CULTURAL_ACTIVITY = 'CULTURAL_ACTIVITY',
  SOCIAL_INTERACTION = 'SOCIAL_INTERACTION',
  HELP_OTHERS = 'HELP_OTHERS',
  PERFECT_SCORE = 'PERFECT_SCORE',
  STREAK_MAINTAINED = 'STREAK_MAINTAINED',
  FIRST_TIME_ACTIVITY = 'FIRST_TIME_ACTIVITY'
}

export enum BadgeRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export enum CompetitionType {
  ACADEMIC = 'ACADEMIC',
  CULTURAL = 'CULTURAL',
  CREATIVE = 'CREATIVE',
  COLLABORATIVE = 'COLLABORATIVE',
  INDIVIDUAL = 'INDIVIDUAL'
}

export enum CompetitionStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

// Utilidades
export const getRarityColor = (rarity: BadgeRarity): string => {
  switch (rarity) {
    case BadgeRarity.COMMON: return 'bg-gray-100 text-gray-800';
    case BadgeRarity.UNCOMMON: return 'bg-green-100 text-green-800';
    case BadgeRarity.RARE: return 'bg-blue-100 text-blue-800';
    case BadgeRarity.EPIC: return 'bg-purple-100 text-purple-800';
    case BadgeRarity.LEGENDARY: return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getCompetitionTypeColor = (type: CompetitionType): string => {
  switch (type) {
    case CompetitionType.ACADEMIC: return 'bg-blue-100 text-blue-800';
    case CompetitionType.CULTURAL: return 'bg-purple-100 text-purple-800';
    case CompetitionType.CREATIVE: return 'bg-pink-100 text-pink-800';
    case CompetitionType.COLLABORATIVE: return 'bg-green-100 text-green-800';
    case CompetitionType.INDIVIDUAL: return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status: CompetitionStatus): string => {
  switch (status) {
    case CompetitionStatus.ACTIVE: return 'bg-green-100 text-green-800';
    case CompetitionStatus.UPCOMING: return 'bg-blue-100 text-blue-800';
    case CompetitionStatus.FINISHED: return 'bg-gray-100 text-gray-800';
    case CompetitionStatus.CANCELLED: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Hooks personalizados
export const useGamificationRefresh = (callback: () => void, interval: number = 30000) => {
  React.useEffect(() => {
    const timer = setInterval(callback, interval);
    return () => clearInterval(timer);
  }, [callback, interval]);
};

// Configuración por defecto
export const DEFAULT_GAMIFICATION_CONFIG = {
  refreshInterval: 30000,
  maxNotifications: 5,
  autoDismissDelay: 5000,
  leaderboardLimit: 10,
  tradeOfferExpiry: 24 * 60 * 60 * 1000, // 24 horas en ms
  competitionCheckInterval: 60000, // 1 minuto
  avatarPreviewSize: 128,
  themePreviewSize: 200
};
