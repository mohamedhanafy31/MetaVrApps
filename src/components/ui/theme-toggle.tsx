'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      const timeoutId = setTimeout(() => {
        setTheme(savedTheme);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    const timeoutId = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const cycleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className={className}>
        <Sun className="w-4 h-4" />
        {showLabel && <span className="ml-2">Theme</span>}
      </Button>
    );
  }

  const Icon = theme === 'light' ? Sun : Moon;
  const label = theme === 'light' ? 'Light' : 'Dark';

  return (
    <motion.div 
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={cycleTheme}
        className="relative overflow-hidden dark-mode-transition"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            <Icon className="w-4 h-4" />
            {showLabel && <span className="ml-2">{label}</span>}
          </motion.div>
        </AnimatePresence>
        
        {/* Glow effect for dark mode */}
        {theme === 'dark' && (
          <motion.div
            className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-purple-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </Button>
    </motion.div>
  );
}

export default ThemeToggle;