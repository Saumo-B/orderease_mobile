
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90vw] sm:max-w-md pointer-events-none">
      <div className="pointer-events-auto">
        <div className="flex items-center justify-between px-2 py-2 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl shadow-black/50">
          <div className="flex w-full justify-between items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
            {visibleMainNavItems.slice(0, 4).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center min-w-[60px] h-14 rounded-full transition-all duration-300 relative group',
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                >
                  <item.icon className={cn("h-5 w-5 mb-0.5 transition-transform duration-300", isActive && "scale-110")} />
                  {isActive && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary"></span>}
                </Link>
              );
            })}
            {/* Dynamic items if space permits or prioritize important ones */}

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'flex flex-col items-center justify-center min-w-[60px] h-14 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300',
                    isSheetOpen && 'bg-white/10 text-foreground'
                  )}
                  suppressHydrationWarning
                >
                  <div className="grid grid-cols-2 gap-0.5 p-1">
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="glass-card w-full max-w-4xl mx-auto rounded-t-3xl border-t border-white/10 flex flex-col p-0 max-h-[60vh] pb-8 bg-zinc-950/90 backdrop-blur-xl">
                <SheetHeader className="p-6 pb-2 border-b border-white/5">
                  <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-4" />
                  <SheetTitle className="text-foreground font-headline text-xl text-center tracking-wide">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col flex-grow p-6 overflow-y-auto">
                  <nav className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {/* Render ALL items in the sheet for easy access */}
                    {[...visibleMainNavItems, ...sheetMenuItems].filter((v, i, a) => a.findIndex(t => (t.label === v.label)) === i).map((item) => {
                      // Filter unique items if duplicates exist between main and sheet
                      const isActive = pathname === item.href;
                      // Skip if it's already in the main dock (first 4) to avoid redundancy? 
                      // Actually, duplication is fine for "All Apps" feel. 
                      // Let's filter out the ones already visible on dock if we want cleaner look.
                      // For now, I'll show everything.
                      return (
                        <Button
                          key={item.label}
                          variant="ghost"
                          onClick={() => handleSheetItemClick(item.href)}
                          className={cn(
                            'flex flex-col items-center justify-center aspect-square rounded-3xl border border-white/5 bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:border-primary/30',
                            isActive ? 'bg-primary/20 text-primary border-primary/50 ring-1 ring-primary/20' : 'text-muted-foreground'
                          )}
                        >
                          <item.icon className="h-8 w-8 mb-2 opacity-80" />
                          <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
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
