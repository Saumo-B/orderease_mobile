
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  BookOpen,
  Boxes,
  LayoutDashboard,
  Plus,
  Search,
  Users,
  Building,
  User,
  LogOut,
  Code,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const mainNavItems = [
  { icon: Search, label: 'Orders', href: '/kitchen', id: 'orders' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/kitchen/dashboard', id: 'dashboard' },
  { icon: BarChart, label: 'Sales', href: '/kitchen/sales-reports', id: 'salesReport' },
  { icon: Boxes, label: 'Inventory', href: '/kitchen/inventory', id: 'inventory' },
  { icon: BookOpen, label: 'Menu', href: '/kitchen/menu-management', id: 'menu' },
  { icon: Users, label: 'Roles', href: '/kitchen/roles', id: 'roles' },
  { icon: Building, label: 'Outlets', href: '/kitchen/branches', id: 'branches' },
];

const baseSheetMenuItems = [
  { icon: User, label: 'Profile', href: '/kitchen/profile' },
  { icon: LogOut, label: 'Logout', href: '#' },
];

const FEATURE_FLAGS_KEY = 'featureFlags';

export function KitchenBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [visibleMainNavItems, setVisibleMainNavItems] = useState<typeof mainNavItems>([]);
  const [sheetMenuItems, setSheetMenuItems] = useState(baseSheetMenuItems);

  useEffect(() => {
    try {
      const storedFlags = localStorage.getItem(FEATURE_FLAGS_KEY);
      const flags = storedFlags ? JSON.parse(storedFlags) : {};
      
      const visibleItems = mainNavItems.filter(item => {
        const flag = flags[item.id];
        if (typeof flag === 'boolean') {
            return flag;
        }
        if (typeof flag === 'object' && flag !== null) {
            return flag.type === true;
        }
        return true; // Default to show
      });

      setVisibleMainNavItems(visibleItems);
      
      const userProfile = localStorage.getItem('userProfile');
      const role = userProfile ? JSON.parse(userProfile).role : '';
      
      const dynamicItems = [];
      if (role === 'dev') {
        dynamicItems.push({ icon: Code, label: 'Dev Options', href: '/kitchen/developer-options' });
      } else {
        dynamicItems.push({ icon: Settings, label: 'Settings', href: '/kitchen/settings' });
      }

      setSheetMenuItems([...dynamicItems, ...baseSheetMenuItems]);

    } catch (error) {
      console.error("Failed to read feature flags or user profile", error);
      setVisibleMainNavItems(mainNavItems);
      setSheetMenuItems([{ icon: Settings, label: 'Settings', href: '/kitchen/settings' }, ...baseSheetMenuItems]);
    }
  }, [isSheetOpen]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('staticUserProfile');
    localStorage.removeItem(FEATURE_FLAGS_KEY);
    router.push('/');
    setIsSheetOpen(false);
  };

  const handleSheetItemClick = (href: string) => {
    if (href === '#') {
        if (sheetMenuItems.find(item => item.href === '#' && item.label === 'Logout')) {
            handleLogout();
        }
    } else {
        router.push(href);
        setIsSheetOpen(false);
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 pointer-events-none">
      <div className="max-w-4xl mx-auto h-full pointer-events-auto">
        <div className="flex h-full items-center justify-center px-2 bg-background/80 backdrop-blur-sm border-t border-border overflow-x-auto no-scrollbar">
          {visibleMainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    asChild
                    className={cn(
                        'flex-1 flex flex-col items-center justify-center font-medium rounded-none h-full',
                        isActive ? 'text-primary' : 'text-foreground/80'
                    )}
                  >
                    <Link href={item.href} className="flex flex-col items-center justify-center">
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs mt-0">{item.label}</span>
                    </Link>
                  </Button>
              );
          })}
           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex-1 flex flex-col items-center justify-center font-medium rounded-none text-foreground/80 h-full"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-xs mt-1">More</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-card w-full max-w-4xl mx-auto rounded-t-2xl border-border flex flex-col p-0 max-h-[40vh]">
                  <SheetHeader className="p-4 pb-0">
                      <SheetTitle className="text-primary font-headline text-2xl text-center">More Options</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col flex-grow p-4">
                      <nav className="grid grid-cols-3 gap-4">
                          {sheetMenuItems.map((item) => {
                              const isActive = pathname === item.href;
                              return (
                              <Button
                                  key={item.label}
                                  variant="ghost"
                                  onClick={() => handleSheetItemClick(item.href)}
                                  className={cn(
                                      'flex flex-col items-center justify-center h-20 rounded-lg text-foreground/80 bg-card/70',
                                      isActive && 'bg-primary/20 text-primary'
                                  )}
                              >
                                  <item.icon className="h-6 w-6 mb-1" />
                                  <span className="text-xs">{item.label}</span>
                              </Button>
                              )
                          })}
                      </nav>
                  </div>
              </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
