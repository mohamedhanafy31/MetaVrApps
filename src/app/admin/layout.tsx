'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Users,
  Building2,
  TrendingUp,
  Bell,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  MoreHorizontal
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageTransition } from '@/components/motion/PageTransition';
import { GridPattern } from '@/components/ui/vr-effects';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { MobileCollapsibleNav } from '@/components/navigation/CollapsibleNav';
import { motion } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes on mobile
  const handleRouteChange = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Handle route changes and window resize
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleRouteChange();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Close sidebar on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't apply admin layout to login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: TrendingUp,
      current: pathname === '/admin/dashboard',
    },
    {
      name: 'Access Requests',
      href: '/admin/access-requests',
      icon: FileText,
      current: pathname === '/admin/access-requests',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: pathname.startsWith('/admin/users'),
    },
    {
      name: 'Applications',
      href: '/admin/applications',
      icon: Building2,
      current: pathname.startsWith('/admin/applications'),
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      current: pathname.startsWith('/admin/analytics'),
    },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden dark-mode-transition">
      {/* VR Grid Pattern */}
      <GridPattern className="text-blue-500/5 dark:text-blue-500/10" />

      {/* Animated background accents */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/30 dark:to-purple-500/30 blur-3xl"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, 20, -10, 0],
          rotate: [0, 15, -10, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/30 dark:to-blue-500/30 blur-3xl"
        animate={{
          x: [0, -20, 10, 0],
          y: [0, -15, 20, 0],
          rotate: [0, -10, 8, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Top Navigation */}
      <header className="border-b bg-background/80 dark:bg-background/90 backdrop-blur-sm sticky top-0 z-50 dark-mode-transition">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center space-x-3">
              <Image
                src="/MetaVrLogo.png"
                alt="MetaVR Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-lg font-semibold">MetaVR Dashboard</h1>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </div>
          </div>

              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Mobile: Collapsible action buttons */}
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Mobile: Dropdown menu for actions */}
                <div className="md:hidden">
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Always visible buttons */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    0
                  </Badge>
                </Button>
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile backdrop overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-background/70 dark:bg-background/80 backdrop-blur-md border-r border-blue-500/20 dark:border-blue-500/30 transform transition-all duration-300 ease-in-out md:translate-x-0 dark-mode-transition ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}>
          <div className="p-4 h-full overflow-y-auto">
            {/* Main Navigation */}
            <nav className="space-y-2 mb-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      // Close sidebar on mobile when navigating
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      item.current
                        ? 'bg-primary text-primary-foreground shadow-glow-sm'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground hover:shadow-sm'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Collapsible Sections */}
            <div className="md:hidden">
              <MobileCollapsibleNav />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-0 px-4 md:px-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
