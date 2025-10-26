
'use client';

import { Button } from '@/components/ui/button';
import { Search, LayoutDashboard, BarChart, Boxes, BookOpen, User, Building, Users, Check, Code, Settings } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { usePathname } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import type { Branch } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const FEATURE_FLAGS_KEY = 'featureFlags';

const pageIdMap: { [path: string]: string } = {
  '/kitchen': 'orders',
  '/kitchen/dashboard': 'dashboard',
  '/kitchen/sales-reports': 'salesReport',
  '/kitchen/inventory': 'inventory',
  '/kitchen/menu-management': 'menu',
  '/kitchen/roles': 'roles',
  '/kitchen/branches': 'branches',
  '/kitchen/developer-options': 'devOptions',
  '/kitchen/settings': 'settings',
  '/kitchen/profile': 'profile'
};


export function KitchenHeader() {
  const { currentBranch, allBranches, handleBranchSelect } = useOrder();
  const pathname = usePathname();
  
  const [isBranchSwitcherOpen, setIsBranchSwitcherOpen] = useState(false);
  const [showBranchSelector, setShowBranchSelector] = useState(false);

  const isProfilePage = pathname === '/kitchen/profile';
  const isDevOptionsPage = pathname === '/kitchen/developer-options';
  const isSettingsPage = pathname === '/kitchen/settings';


  useEffect(() => {
    try {
        const storedFlags = localStorage.getItem(FEATURE_FLAGS_KEY);
        if (storedFlags) {
            const flags = JSON.parse(storedFlags);
            const pageId = pageIdMap[pathname];
            
            if (pageId && flags[pageId] && typeof flags[pageId] === 'object' && flags[pageId].branchSelector) {
                setShowBranchSelector(true);
            } else {
                setShowBranchSelector(false);
            }
        } else {
          setShowBranchSelector(false); 
        }
    } catch (e) {
        console.error("Failed to read feature flags", e);
        setShowBranchSelector(false);
    }
  }, [pathname]);

  const getPageInfo = () => {
    if (pathname === '/kitchen/dashboard') {
      return {
        icon: <LayoutDashboard className="h-5 w-5" />,
        title: 'Dashboard',
      };
    }
    if (pathname === '/kitchen/sales-reports') {
      return {
        icon: <BarChart className="h-5 w-5" />,
        title: 'Sales Report',
      };
    }
     if (pathname === '/kitchen/inventory') {
      return {
        icon: <Boxes className="h-5 w-5" />,
        title: 'Inventory',
      };
    }
    if (pathname === '/kitchen/menu-management') {
      return {
        icon: <BookOpen className="h-5 w-5" />,
        title: 'Menu',
      };
    }
     if (pathname === '/kitchen/profile') {
      return {
        icon: <User className="h-5 w-5" />,
        title: 'Profile',
      };
    }
    if (pathname === '/kitchen/roles') {
        return {
            icon: <Users className="h-5 w-5" />,
            title: 'Roles',
        };
    }
    if (pathname === '/kitchen/branches') {
        return {
            icon: <Building className="h-5 w-5" />,
            title: 'Outlets',
        };
    }
    if (pathname === '/kitchen/developer-options') {
      return {
        icon: <Code className="h-5 w-5" />,
        title: 'Developer Options',
      };
    }
    if (pathname === '/kitchen/settings') {
      return {
        icon: <Settings className="h-5 w-5" />,
        title: 'Settings',
      };
    }
    return {
      icon: <Search className="h-5 w-5" />,
      title: 'Orders',
    };
  };

  const onBranchSelect = (branch: Branch) => {
    handleBranchSelect(branch);
    setIsBranchSwitcherOpen(false);
  }

  const { icon, title } = getPageInfo();
  const staticProfile = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('staticUserProfile') || '{}') : {};
  const isAllAccess = staticProfile.branchName === 'All';

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
       <div className="max-w-4xl mx-auto">
          <div className="p-4 flex justify-between items-center min-h-[80px]">
            <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  className="bg-primary/20 text-primary p-2 rounded-lg pointer-events-none"
                >
                  {icon}
                </Button>
                <h1 className="text-xl font-bold font-headline text-foreground">
                {title}
                </h1>
            </div>
             <div className="flex items-center gap-3">
                 {currentBranch && !isProfilePage && !isDevOptionsPage && !isSettingsPage && showBranchSelector && (
                    isAllAccess ? (
                        <Popover open={isBranchSwitcherOpen} onOpenChange={setIsBranchSwitcherOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isBranchSwitcherOpen}
                                className="w-[150px] justify-center items-center text-base font-medium text-foreground h-10 px-4 bg-card border-border"
                                >
                                    <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                                    <span className="truncate">{currentBranch.name}</span>
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-card">
                                <Command>
                                <CommandInput placeholder="Search branch..." />
                                <CommandList>
                                <CommandEmpty>No branch found.</CommandEmpty>
                                <CommandGroup>
                                    {allBranches.map((branch) => (
                                    <CommandItem
                                        key={branch.id}
                                        value={branch.name}
                                        onSelect={() => onBranchSelect(branch)}
                                    >
                                        <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            currentBranch.id === branch.id ? "opacity-100" : "opacity-0"
                                        )}
                                        />
                                        {branch.name}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    ) : (
                         <Button
                            variant="outline"
                            className="w-[150px] justify-center items-center text-base font-medium text-foreground h-10 px-4 bg-card border-border cursor-default"
                            >
                                <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                                <span className="truncate">{currentBranch.name}</span>
                                </div>
                        </Button>
                    )
                )}
            </div>
          </div>
       </div>
    </header>
  );
}
