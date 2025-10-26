
'use client';

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
  LogOut,
  Menu,
  Settings,
  Table,
  User,
  Search,
  Users,
  Building,
  Code,
} from 'lucide-react';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const allMenuItems = [
  { icon: Search, label: 'Orders', href: '/kitchen', id: 'orders' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/kitchen/dashboard', id: 'dashboard' },
  { icon: BarChart, label: 'Sales Report', href: '/kitchen/sales-reports', id: 'salesReport' },
  { icon: Boxes, label: 'Inventory', href: '/kitchen/inventory', id: 'inventory' },
  { icon: BookOpen, label: 'Menu', href: '/kitchen/menu-management', id: 'menu' },
  { icon: Users, label: 'Roles', href: '/kitchen/roles', id: 'roles' },
  { icon: Building, label: 'Outlets', href: '/kitchen/branches', id: 'branches' },
];

const baseBottomMenuItems = [
  { icon: User, label: 'User Profile', href: '/kitchen/profile' },
  { icon: LogOut, label: 'Logout', href: '#' },
];

const FEATURE_FLAGS_KEY = 'featureFlags';

export function KitchenSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [menuItems, setMenuItems] = useState(allMenuItems);
  const [bottomMenuItems, setBottomMenuItems] = useState(baseBottomMenuItems);
  
  const [initialPath, setInitialPath] = useState(pathname);
  
  useEffect(() => {
    if (isOpen && pathname !== initialPath) {
      setIsOpen(false);
    }
    setInitialPath(pathname);
  }, [pathname, isOpen, initialPath]);

  useEffect(() => {
    try {
      const storedFlags = localStorage.getItem(FEATURE_FLAGS_KEY);
      if (storedFlags) {
        const flags = JSON.parse(storedFlags);
        const visibleItems = allMenuItems.filter(item => {
            const flag = flags[item.id];
            if (typeof flag === 'boolean') {
                return flag;
            }
            if (typeof flag === 'object' && flag !== null) {
                return flag.type === true;
            }
            return true; // Default to show if flag is not defined
        });
        setMenuItems(visibleItems);
      } else {
        setMenuItems(allMenuItems); // Or hide all by default if no flags are found
      }

      const userProfile = localStorage.getItem('userProfile');
      const role = userProfile ? JSON.parse(userProfile).role : '';

      const dynamicItems = [];
      if (role === 'dev') {
        dynamicItems.push({ icon: Code, label: 'Developer Options', href: '/kitchen/developer-options' });
      } else {
        dynamicItems.push({ icon: Settings, label: 'Settings', href: '/kitchen/settings' });
      }
      setBottomMenuItems([...dynamicItems, ...baseBottomMenuItems]);

    } catch (error) {
      console.error("Failed to read feature flags or user profile", error);
      setMenuItems(allMenuItems);
      setBottomMenuItems([{ icon: Settings, label: 'Settings', href: '/kitchen/settings' }, ...baseBottomMenuItems]);
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setInitialPath(pathname);
    }
    setIsOpen(open);
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('staticUserProfile');
    localStorage.removeItem(FEATURE_FLAGS_KEY);
    router.push('/');
    setIsOpen(false);
  };

  const handleBottomMenuClick = (item: typeof baseBottomMenuItems[0]) => {
      if (item.label === 'Logout') {
        handleLogout();
      } else if (item.href !== '#') {
        router.push(item.href);
        setIsOpen(false);
      }
      // For settings or other '#' links, do nothing for now.
  }


  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="bg-primary/20 text-primary p-2 rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-card w-[270px] p-4 flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className="text-primary font-headline text-2xl text-center">
            Main Menu
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col flex-grow">
          <nav className="flex flex-col">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  asChild
                  className={cn(
                    'justify-start text-base text-foreground/80',
                    isActive && 'bg-primary/20 text-primary'
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="mr-4 h-5 w-5" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
          <div className="mt-auto">
            <Separator className="my-4 bg-border/50" />
            <nav className="flex flex-col">
              {bottomMenuItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={cn(
                    "justify-start text-base text-foreground/80",
                     pathname === item.href && 'bg-primary/20 text-primary'
                  )}
                  onClick={() => handleBottomMenuClick(item)}
                >
                  <item.icon className="mr-4 h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
