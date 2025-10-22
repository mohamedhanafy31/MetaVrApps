'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface GridPatternProps {
  className?: string;
}

export function GridPattern({ className }: GridPatternProps) {
  // Use CSS media queries instead of JavaScript to avoid hydration mismatch
  return (
    <div className={`absolute inset-0 ${className}`}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Desktop grid */}
          <pattern
            id="grid-desktop"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.1"
            />
          </pattern>
          {/* Mobile grid */}
          <pattern
            id="grid-mobile"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
              opacity="0.05"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-desktop)" className="md:block hidden" />
        <rect width="100%" height="100%" fill="url(#grid-mobile)" className="md:hidden" />
      </svg>
    </div>
  );
}

interface NeonAccentProps {
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export function NeonAccent({ className, intensity = 'medium' }: NeonAccentProps) {
  const intensityClasses = {
    low: 'shadow-glow-sm',
    medium: 'shadow-glow-md',
    high: 'shadow-glow-lg'
  };

  return (
    <div
      className={`absolute inset-0 rounded-lg border border-blue-500/20 ${intensityClasses[intensity]} ${className}`}
      style={{
        animation: 'pulse-glow 2s ease-in-out infinite'
      }}
    />
  );
}

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HolographicCard({ children, className }: HolographicCardProps) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10"
        style={{
          background: 'linear-gradient(45deg, rgba(0, 102, 255, 0.1), rgba(147, 51, 234, 0.1), rgba(6, 182, 212, 0.1))',
          animation: 'shimmer 3s ease-in-out infinite'
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FloatingCard({ children, className, delay = 0 }: FloatingCardProps) {
  return (
    <motion.div
      className={className}
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
}

interface GlowButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function GlowButton({ children, className, onClick, variant = 'primary' }: GlowButtonProps) {
  const baseClasses = "relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out";
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-glow-md hover:shadow-glow-lg",
    secondary: "border border-blue-500/50 text-blue-500 hover:bg-blue-500/10 hover:shadow-glow-md"
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  );
}

interface ParticleBackgroundProps {
  className?: string;
  particleCount?: number;
  intensity?: 'low' | 'medium' | 'high';
}

export function ParticleBackground({ className, particleCount = 20, intensity = 'medium' }: ParticleBackgroundProps) {
  // Use CSS classes instead of JavaScript to avoid hydration mismatch
  const intensityMultiplier = {
    low: 0.3,
    medium: 0.6,
    high: 1.0
  };
  
  const baseParticleCount = Math.floor(particleCount * intensityMultiplier[intensity]);
  
  const particleColors = [
    'bg-blue-500/20',
    'bg-purple-500/15',
    'bg-cyan-500/18',
    'bg-blue-400/15'
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Desktop particles */}
      <div className="md:block hidden">
        {Array.from({ length: baseParticleCount }).map((_, i) => (
          <motion.div
            key={`desktop-${i}`}
            className={`absolute w-1 h-1 ${particleColors[i % particleColors.length]} rounded-full`}
            style={{
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
            initial={{
              x: Math.random() * 1200,
              y: 800 + 10,
              opacity: 0,
              scale: Math.random() * 0.3 + 0.7
            }}
            animate={{
              y: -10,
              opacity: [0, 0.8, 0],
              scale: [Math.random() * 0.3 + 0.7, Math.random() * 0.3 + 0.7, Math.random() * 0.3 + 0.7]
            }}
            transition={{
              duration: Math.random() * 8 + 8,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      {/* Mobile particles (reduced count) */}
      <div className="md:hidden">
        {Array.from({ length: Math.floor(baseParticleCount * 0.3) }).map((_, i) => (
          <motion.div
            key={`mobile-${i}`}
            className={`absolute w-0.5 h-0.5 ${particleColors[i % particleColors.length]} rounded-full`}
            style={{
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              transform: 'translate3d(0,0,0)',
              WebkitTransform: 'translate3d(0,0,0)'
            }}
            initial={{
              x: Math.random() * 1200,
              y: 800 + 10,
              opacity: 0,
              scale: Math.random() * 0.3 + 0.7
            }}
            animate={{
              y: -10,
              opacity: [0, 0.8, 0],
              scale: [Math.random() * 0.3 + 0.7, Math.random() * 0.3 + 0.7, Math.random() * 0.3 + 0.7]
            }}
            transition={{
              duration: Math.random() * 12 + 12,
              repeat: Infinity,
              delay: Math.random() * 12,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface NeonBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: 'blue' | 'purple' | 'cyan' | 'green';
}

export function NeonBorder({ children, className, color = 'blue' }: NeonBorderProps) {
  const colorClasses = {
    blue: 'border-blue-500/50 shadow-glow-md',
    purple: 'border-purple-500/50 shadow-glow-purple',
    cyan: 'border-cyan-500/50 shadow-glow-cyan',
    green: 'border-green-500/50 shadow-glow-green'
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`absolute inset-0 rounded-lg border ${colorClasses[color]} animate-pulse-glow`} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface AdvancedHolographicCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  variant?: 'default' | 'premium' | 'elite';
}

export function AdvancedHolographicCard({ 
  children, 
  className, 
  intensity = 'medium',
  variant = 'default'
}: AdvancedHolographicCardProps) {
  // Use CSS classes instead of JavaScript to avoid hydration mismatch
  const intensityClasses = {
    low: 'opacity-20 md:opacity-30',
    medium: 'opacity-30 md:opacity-50',
    high: 'opacity-40 md:opacity-70'
  };

  const variantClasses = {
    default: 'from-blue-500/5 via-purple-500/5 to-cyan-500/5 md:from-blue-500/10 md:via-purple-500/10 md:to-cyan-500/10',
    premium: 'from-blue-500/8 via-purple-500/8 to-cyan-500/8 md:from-blue-500/15 md:via-purple-500/15 md:to-cyan-500/15',
    elite: 'from-blue-500/10 via-purple-500/10 to-cyan-500/10 md:from-blue-500/20 md:via-purple-500/20 md:to-cyan-500/20'
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Animated gradient background - reduced on mobile */}
      <div
        className={`absolute inset-0 rounded-lg bg-gradient-to-r ${variantClasses[variant]} ${intensityClasses[intensity]}`}
        style={{
          background: `linear-gradient(45deg, 
            rgba(0, 102, 255, ${variant === 'elite' ? '0.1' : variant === 'premium' ? '0.08' : '0.05'}), 
            rgba(123, 47, 255, ${variant === 'elite' ? '0.1' : variant === 'premium' ? '0.08' : '0.05'}), 
            rgba(0, 212, 255, ${variant === 'elite' ? '0.1' : variant === 'premium' ? '0.08' : '0.05'}))`,
          animation: 'shimmer 3s ease-in-out infinite'
        }}
      />
      
      {/* Holographic border effect - reduced on mobile */}
      <div className="absolute inset-0 rounded-lg border border-blue-500/10 group-hover:border-blue-500/20 md:border-blue-500/20 md:group-hover:border-blue-500/40 transition-all duration-300" />
      
      {/* Glow effect on hover - disabled on mobile */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/5 to-purple-500/5 hidden md:block" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface DataVisualizationProps {
  className?: string;
  data?: number[];
  color?: 'blue' | 'purple' | 'cyan' | 'green';
}

export function DataVisualization({ className, data = [65, 45, 80, 30, 90], color = 'blue' }: DataVisualizationProps) {
  // Use CSS classes instead of JavaScript to avoid hydration mismatch
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    cyan: 'from-cyan-500 to-blue-500',
    green: 'from-green-500 to-emerald-500'
  };

  return (
    <div className={`relative ${className}`}>
      <svg className="w-full h-20" viewBox="0 0 200 80">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* Animated line - simplified on mobile */}
        <motion.path
          d={`M 0,${80 - data[0]} ${data.map((value, index) => `L ${(index + 1) * 40},${80 - value}`).join(' ')}`}
          fill="none"
          stroke={`url(#gradient-${color})`}
          strokeWidth="1.5"
          className={`text-${color}-500 md:stroke-[2]`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ 
            duration: 1.5,
            ease: "easeInOut" 
          }}
        />
        
        {/* Data points - reduced animation on mobile */}
        {data.map((value, index) => (
          <motion.circle
            key={index}
            cx={(index + 1) * 40}
            cy={80 - value}
            r="2"
            className={`fill-current text-${color}-500 md:r-[3]`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: index * 0.05,
              duration: 0.2 
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export default { 
  GridPattern, 
  NeonAccent, 
  HolographicCard, 
  FloatingCard, 
  GlowButton, 
  ParticleBackground, 
  NeonBorder,
  AdvancedHolographicCard,
  DataVisualization
};
