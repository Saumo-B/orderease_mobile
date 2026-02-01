'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Search,
  LayoutDashboard,
  BarChart,
  Boxes,
  BookOpen,
  Users,
  Building,
  User,
  LogOut,
  Code,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const mainNavItems = [
  { icon: Search, label: 'Orders', href: '/kitchen', id: 'orders' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/kitchen/dashboard', id: 'dashboard' },
  { icon: BarChart, label: 'Sales Report', href: '/kitchen/sales-reports', id: 'salesReport' },
  { icon: Boxes, label: 'Inventory', href: '/kitchen/inventory', id: 'inventory' },
  { icon: BookOpen, label: 'Menu', href: '/kitchen/menu-management', id: 'menu' },
  { icon: Users, label: 'Roles', href: '/kitchen/roles', id: 'roles' },
  { icon: Building, label: 'Outlets', href: '/kitchen/branches', id: 'branches' },
];

const secondaryNavItems = [
  { icon: User, label: 'Profile', href: '/kitchen/profile', id: 'profile' },
  { icon: Settings, label: 'Settings', href: '/kitchen/settings', id: 'settings' },
];

const FEATURE_FLAGS_KEY = 'featureFlags';

import { useOrder } from '@/context/OrderContext';

interface KitchenSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function KitchenSidebar({ collapsed, onToggleCollapse }: KitchenSidebarProps) {
  const pathname = usePathname();
  const [visibleItems, setVisibleItems] = useState(mainNavItems);
  const [developerMode, setDeveloperMode] = useState(false);
  const { setIsPageLoading } = useOrder();

  const handleNavClick = (href: string) => {
    // We rely on the context to handle loading states on route change or data fetch
    // if (pathname !== href) {
    //   setIsPageLoading(true);
    // }
  };

  useEffect(() => {
    try {
      const storedFlags = localStorage.getItem(FEATURE_FLAGS_KEY);
      const flags = storedFlags ? JSON.parse(storedFlags) : {};

      const filtered = mainNavItems.filter(item => {
        const flag = flags[item.id];
        if (typeof flag === 'boolean') return flag;
        if (typeof flag === 'object' && flag !== null) return flag.type === true;
        return true;
      });
      setVisibleItems(filtered);

      const userProfile = localStorage.getItem('userProfile');
      if (userProfile && JSON.parse(userProfile).role === 'dev') {
        setDeveloperMode(true);
      }

    } catch (e) {
      console.error("Sidebar flag logic error", e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('staticUserProfile');
    localStorage.removeItem(FEATURE_FLAGS_KEY);
    window.location.href = '/';
  };

  return (
    <motion.div
      initial={{ width: collapsed ? 80 : 240 }}
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 bg-card border-r border-white/5 shadow-2xl"
    >
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-xl text-gradient tracking-tight"
          >
            OrderEase
          </motion.span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="ml-auto text-muted-foreground hover:text-primary transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-grow py-6 flex flex-col gap-2 overflow-y-auto no-scrollbar px-3">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="w-full" onClick={() => handleNavClick(item.href)}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-12 rounded-xl transition-all duration-200",
                  isActive ? "bg-primary/10 text-primary font-semibold shadow-sm" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon size={22} className={cn(isActive && "text-primary")} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/5 flex flex-col gap-2">
        {secondaryNavItems.map(item => (
          <Link key={item.href} href={item.href} className="w-full" onClick={() => handleNavClick(item.href)}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-10 rounded-lg",
                pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon size={18} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Button>
          </Link>
        ))}
        {developerMode && (
          <Link href="/kitchen/developer-options" className="w-full">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-10 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-400/10",
                collapsed && "justify-center px-0"
              )}
            >
              <Code size={18} />
              {!collapsed && <span className="text-sm">Dev Tools</span>}
            </Button>
          </Link>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 h-10 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 mt-2",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </Button>
      </div>
    </motion.div>
  );
}
