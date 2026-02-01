
'use client';

import { KitchenHeader } from '@/components/KitchenHeader';
import { KitchenSidebar } from '@/components/KitchenSidebar';
import { BranchSwitcher } from '@/components/BranchSwitcher';
import { usePathname } from 'next/navigation';
import { KitchenBottomNav } from '@/components/KitchenBottomNav';
import { cn } from '@/lib/utils';
import { useOrder } from '@/context/OrderContext';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { branchLoading } = useOrder();
  const [showLoader, setShowLoader] = useState(true);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    if (!branchLoading) {
      setShowLoader(false);
    }
  }, [branchLoading]);

  const showHeader =
    pathname !== '/kitchen/login' && pathname !== '/kitchen/register';

  /* Hooks must be before conditional returns */
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);

    // Initial check
    handleChange(mediaQuery);

    // Listener
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (showLoader) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading kitchen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {showHeader && (
        <KitchenSidebar
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      <motion.div
        className="flex-grow flex flex-col min-h-screen w-full"
        initial={false}
        animate={{
          paddingLeft: showHeader && !isMobile ? (isSidebarCollapsed ? 80 : 240) : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {showHeader && <div className="md:hidden"><KitchenHeader /></div>}
        {showHeader && <div className="hidden md:block sticky top-0 bg-background/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between z-30">
          <h1 className="text-2xl font-bold font-headline text-gradient">
            {pathname === '/kitchen' && 'Live Orders'}
            {pathname === '/kitchen/dashboard' && 'Dashboard Overview'}
            {pathname === '/kitchen/sales-reports' && 'Sales Reports'}
            {pathname === '/kitchen/inventory' && 'Inventory Management'}
            {pathname === '/kitchen/menu-management' && 'Menu Management'}
            {pathname === '/kitchen/roles' && 'Role Management'}
            {pathname === '/kitchen/branches' && 'Outlet Management'}
            {pathname === '/kitchen/profile' && 'Profile'}
            {pathname === '/kitchen/settings' && 'Settings'}
            {pathname === '/kitchen/developer-options' && 'Developer Options'}
            {/* Fallback */}
            {!['/kitchen', '/kitchen/dashboard', '/kitchen/sales-reports', '/kitchen/inventory', '/kitchen/menu-management', '/kitchen/roles', '/kitchen/branches', '/kitchen/profile', '/kitchen/settings', '/kitchen/developer-options'].includes(pathname) && 'Kitchen Dashboard'}
          </h1>
          <BranchSwitcher />
        </div>}

        <main className={cn('pb-24 md:pb-8 flex-grow overflow-x-hidden no-scrollbar', showHeader && "px-4 py-8 md:px-8")}>
          {children}
        </main>
      </motion.div>

      {showHeader && <div className="md:hidden"><KitchenBottomNav /></div>}
    </div>
  );
}
