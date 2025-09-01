'use client';

import React from 'react';

interface InclusiveAvatarProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'colorful' | 'minimal';
}

export function InclusiveAvatar({ 
  size = 32, 
  className = '', 
  variant = 'default' 
}: InclusiveAvatarProps) {
  const getColors = () => {
    switch (variant) {
      case 'colorful':
        return {
          skin: '#FFD700',
          skinStroke: '#E6B800',
          hair: '#8B4513',
          eyes: '#2F4F4F',
          body: '#4169E1',
          arms: '#FFD700',
          heart: '#FF69B4'
        };
      case 'minimal':
        return {
          skin: '#F4A460',
          skinStroke: '#D2691E',
          hair: '#654321',
          eyes: '#1F2937',
          body: '#3B82F6',
          arms: '#F4A460',
          heart: '#EF4444'
        };
      default:
        return {
          skin: '#FFD700',
          skinStroke: '#E6B800',
          hair: '#8B4513',
          eyes: '#2F4F4F',
          body: '#4169E1',
          arms: '#FFD700',
          heart: '#FF69B4'
        };
    }
  };

  const colors = getColors();
  const scale = size / 32;

  return (
    <div className={`inline-block ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Cabeza del niño */}
        <circle cx="16" cy="12" r="8" fill={colors.skin} stroke={colors.skinStroke} strokeWidth="1"/>
        
        {/* Cabello */}
        <path d="M8 8 Q16 4 24 8 Q22 12 20 10 Q18 8 16 10 Q14 8 12 10 Q10 12 8 8" fill={colors.hair}/>
        
        {/* Ojos */}
        <circle cx="14" cy="10" r="1.5" fill={colors.eyes}/>
        <circle cx="18" cy="10" r="1.5" fill={colors.eyes}/>
        <circle cx="14.5" cy="9.5" r="0.5" fill="#FFFFFF"/>
        <circle cx="18.5" cy="9.5" r="0.5" fill="#FFFFFF"/>
        
        {/* Sonrisa */}
        <path d="M13 14 Q16 17 19 14" stroke={colors.eyes} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        
        {/* Cuerpo */}
        <rect x="12" y="20" width="8" height="10" rx="4" fill={colors.body}/>
        
        {/* Brazos */}
        <rect x="8" y="22" width="3" height="6" rx="1.5" fill={colors.arms}/>
        <rect x="21" y="22" width="3" height="6" rx="1.5" fill={colors.arms}/>
        
        {/* Manos */}
        <circle cx="9.5" cy="28" r="1.5" fill={colors.arms}/>
        <circle cx="22.5" cy="28" r="1.5" fill={colors.arms}/>
        
        {/* Elemento de inclusividad - corazón pequeño */}
        <path d="M20 6 Q20.5 5.5 21 6 Q21.5 6.5 21 7 Q20.5 7.5 20 7 Q19.5 6.5 20 6" fill={colors.heart}/>
        
        {/* Elemento adicional de inclusividad - símbolo de accesibilidad */}
        <circle cx="26" cy="6" r="2" fill="#10B981" opacity="0.8"/>
        <path d="M25 6 L27 6 M26 5 L26 7" stroke="#FFFFFF" strokeWidth="0.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

// Variantes adicionales para diferentes contextos
export function InclusiveAvatarWithBadge({ 
  size = 32, 
  className = '', 
  badgeText = '✓',
  badgeColor = '#10B981'
}: InclusiveAvatarProps & { badgeText?: string; badgeColor?: string }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <InclusiveAvatar size={size} />
      <div 
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: badgeColor }}
      >
        {badgeText}
      </div>
    </div>
  );
}

// Avatar con animación
export function AnimatedInclusiveAvatar({ 
  size = 32, 
  className = '',
  isAnimated = true 
}: InclusiveAvatarProps & { isAnimated?: boolean }) {
  return (
    <div className={`inline-block ${isAnimated ? 'animate-pulse' : ''} ${className}`}>
      <InclusiveAvatar size={size} />
    </div>
  );
}
