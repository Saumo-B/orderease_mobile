'use client';

import { Button } from '@/components/ui/button';
import { CreateOrderDialog } from '@/components/CreateOrderDialog';
import { useState, useEffect } from 'react';
import { KitchenSidebar } from '@/components/KitchenSidebar';
import { Plus, Search, LayoutDashboard, BarChart, Boxes, BookOpen, User, Building, Users, Check, ChevronsUpDown, Code, Settings } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { usePathname } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import type { Branch } from '@/lib/types';
import { axiosInstance } from '@/lib/axios-instance';
import { cn } from '@/lib/utils';

const FEATURE_FLAGS_KEY = 'featureFlags';

export function KitchenHeader() {
  const {
    fetchKitchenOrders,
    setIsAddMenuItemDialogOpen,
    setIsAddIngredientDialogOpen,
    setIsAddStaffDialogOpen,
    setIsAddBranchDialogOpen,
  } = useOrder();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  const [currentBranch, setCurrentBranch] = useState<{ id: string; name: string } | null>(null);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [isBranchSwitcherOpen, setIsBranchSwitcherOpen] = useState(false);
  
  const [showBranchSelector, setShowBranchSelector] = useState(true);

  const isProfilePage = pathname === '/kitchen/profile';
  const isDevOptionsPage = pathname === '/kitchen/developer-options';
  const isSettingsPage = pathname === '/kitchen/settings';


  useEffect(() => {
    setIsClient(true);
    
    // Feature flag for branch selector
    try {
        const storedFlags = localStorage.getItem(FEATURE_FLAGS_KEY);
        if (storedFlags) {
            const flags = JSON.parse(storedFlags);
            const isDashboard = pathname === '/kitchen/dashboard';
            const flagKey = isDashboard ? 'dashboard.branch_selector' : 'orders.branch_selector';
            setShowBranchSelector(flags[flagKey] ?? true);
        }
    } catch (e) {
        console.error("Failed to read feature flags", e);
    }


    async function fetchBranchesAndSetCurrent() {
        if (isProfilePage) {
            // On profile page, we don't need to fetch all branches or show the switcher.
            // We just need the display name from the static profile.
            try {
                 const storedProfile = localStorage.getItem('staticUserProfile');
                 if (storedProfile) {
                    const profile = JSON.parse(storedProfile);
                    if (profile && profile.branchid && profile.branchName) {
                        setCurrentBranch({ id: profile.branchid, name: profile.branchName });
                    }
                 }
            } catch(e) {
                console.error("Failed to parse user profile", e);
            }
            return;
        }

        try {
            const response = await axiosInstance.get('/api/branch');
             if (response.data && Array.isArray(response.data)) {
                const formattedBranches: Branch[] = response.data.map((item: any) => ({
                  id: item._id,
                  name: item.name,
                  pin: item.PIN,
                  phone: item.phone,
                  address: item.address,
                }));
                setAllBranches(formattedBranches);

                 const storedProfile = localStorage.getItem('userProfile');
                if (storedProfile) {
                    const profile = JSON.parse(storedProfile);
                    if (profile && profile.branchid && profile.branchName) {
                        setCurrentBranch({ id: profile.branchid, name: profile.branchName });
                    } else if (formattedBranches.length > 0) {
                        // If no branch is set, default to the first one
                        handleBranchSelect(formattedBranches[0]);
                    }
                } else if (formattedBranches.length > 0) {
                    handleBranchSelect(formattedBranches[0]);
                }
             }
        } catch (e) {
            console.error("Failed to fetch branches or parse user profile", e);
        }
    }
    
    fetchBranchesAndSetCurrent();
  }, [isProfilePage, pathname]);

  const handleBranchSelect = (branch: Branch) => {
    try {
        const storedProfile = localStorage.getItem('userProfile');
        const profile = storedProfile ? JSON.parse(storedProfile) : {};
        
        const newProfile = {
            ...profile,
            branchid: branch.id,
            branchName: branch.name,
        };

        // Only update the dynamic userProfile, not the static one
        localStorage.setItem('userProfile', JSON.stringify(newProfile));
        setCurrentBranch({ id: branch.id, name: branch.name });
        setIsBranchSwitcherOpen(false);

        // Reload the page to ensure all data is refetched for the new branch
        window.location.reload();

    } catch(e) {
        console.error("Failed to update branch selection", e);
    }
  };


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
        title: 'User Profile',
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


  
  const HeaderContent = () => {
     const { icon, title } = getPageInfo();
     return (
        <>
            <div className="flex items-center gap-2">
                <div className="hidden md:block">
                  <KitchenSidebar />
                </div>
                 <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      className="bg-cyan-500/20 text-cyan-300 p-2 rounded-lg pointer-events-none"
                    >
                      {icon}
                    </Button>
                    <h1 className="text-xl font-bold font-headline text-white">
                    {title}
                    </h1>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 {currentBranch && !isProfilePage && !isDevOptionsPage && !isSettingsPage && showBranchSelector && (
                    <Popover open={isBranchSwitcherOpen} onOpenChange={setIsBranchSwitcherOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isBranchSwitcherOpen}
                            className="w-[180px] justify-center items-center text-base font-medium text-white h-10 px-4 bg-card/70 border-white/10"
                            >
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-cyan-300"></div>
                                  <span className="truncate">Branch: {currentBranch.name}</span>
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
                                    onSelect={() => handleBranchSelect(branch)}
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
                )}
            </div>
        </>
     )
  }


  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
      <div className="p-4 flex justify-between items-center min-h-[80px]">
        {isClient ? <HeaderContent /> : (
            <div className="w-full flex justify-between">
                <div className="h-10 w-1/3 bg-muted/50 animate-pulse rounded-md"></div>
                <div className="h-10 w-1/4 bg-muted/50 animate-pulse rounded-md"></div>
            </div>
        )}
      </div>
    </header>
  );
}
