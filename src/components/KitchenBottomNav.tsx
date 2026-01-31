
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
import { Button, buttonVariants } from '@/components/ui/button';
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
  const [visibleMainNavItems, setVisibleMainNavItems] = useState<typeof mainNavItems>(mainNavItems);
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
    <div className="fixed bottom-0 left-0 right-0 z-50 h-20 pointer-events-none">
      <div className="max-w-4xl mx-auto h-full pointer-events-auto">
        <div className="flex h-full items-center justify-center px-4 bg-card border-t border-white/5 rounded-t-3xl overflow-hidden shadow-2xl">
          <div className="flex w-full justify-between items-center gap-1 overflow-x-auto no-scrollbar py-2">
            {visibleMainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'flex-1 flex flex-col items-center justify-center font-medium rounded-2xl h-16 transition-all duration-300',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)] scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                >
                  <item.icon className={cn("h-6 w-6 transition-transform duration-300", isActive && "scale-110")} />
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </Link>
              );
            })}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex-1 flex flex-col items-center justify-center font-medium rounded-2xl h-16 text-muted-foreground hover:text-foreground hover:bg-white/5"
                  suppressHydrationWarning
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-[10px] font-semibold mt-1">More</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="glass-card w-full max-w-4xl mx-auto rounded-t-3xl border-t border-white/10 flex flex-col p-0 max-h-[50vh]">
                <SheetHeader className="p-6 pb-2">
                  <SheetTitle className="text-gradient font-headline text-2xl text-center">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col flex-grow p-6 pt-2">
                  <nav className="grid grid-cols-3 gap-4">
                    {sheetMenuItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Button
                          key={item.label}
                          variant="ghost"
                          onClick={() => handleSheetItemClick(item.href)}
                          className={cn(
                            'flex flex-col items-center justify-center h-24 rounded-2xl border border-white/5 transition-all duration-300 hover:scale-105 hover:bg-white/5 hover:border-primary/30',
                            isActive ? 'bg-primary/20 text-primary border-primary/50' : 'bg-background/40 text-muted-foreground'
                          )}
                        >
                          <item.icon className="h-8 w-8 mb-2 opacity-80" />
                          <span className="text-xs font-medium">{item.label}</span>
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
    </div>
  );
}
