
'use client';

import { Switch } from '@/components/ui/switch';
import {
  BarChart,
  BookOpen,
  Boxes,
  LayoutDashboard,
  Search,
  Users,
  Building,
  Code,
  Moon,
  Sun,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const menuItems = [
  { 
    icon: Search, 
    label: 'Orders', 
    id: 'orders',
    subItems: [
        { id: 'orders.branch_selector', label: 'Branch Selector' },
    ]
  },
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    id: 'dashboard',
    subItems: [
        { id: 'dashboard.branch_selector', label: 'Branch Selector' },
    ]
  },
  { 
    icon: BarChart, 
    label: 'Sales Report', 
    id: 'sales-report',
     subItems: []
  },
  { 
    icon: Boxes, 
    label: 'Inventory', 
    id: 'inventory',
    subItems: [
        { id: 'inventory.branch_selector', label: 'Branch Selector' },
    ]
  },
  { 
    icon: BookOpen, 
    label: 'Menu', 
    id: 'menu',
    subItems: [
        { id: 'menu.branch_selector', label: 'Branch Selector' },
    ]
  },
  { 
    icon: Users, 
    label: 'Roles', 
    id: 'roles',
    subItems: []
  },
  { 
    icon: Building, 
    label: 'Outlets', 
    id: 'outlets',
    subItems: []
  },
];

const FEATURE_FLAGS_KEY = 'featureFlags';

export default function DeveloperOptionsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    try {
      const storedFlags = localStorage.getItem(FEATURE_FLAGS_KEY);
      if (storedFlags) {
        setToggles(JSON.parse(storedFlags));
      } else {
        // Initialize all to true if not found in storage
        const initialFlags = menuItems.reduce((acc, item) => {
          acc[item.id] = true;
          if (item.subItems) {
            item.subItems.forEach(subItem => {
                acc[subItem.id] = true;
            });
          }
          return acc;
        }, {} as Record<string, boolean>);
        setToggles(initialFlags);
        localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(initialFlags));
      }
    } catch (error) {
      console.error("Failed to read or initialize feature flags", error);
    } finally {
        setIsClient(true);
    }
  }, []);

  const handleToggle = (id: string) => {
    setToggles(prevToggles => {
      const newToggles = { ...prevToggles, [id]: !prevToggles[id] };
      try {
        localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(newToggles));
      } catch (error) {
        console.error("Failed to save feature flags", error);
      }
      return newToggles;
    });
  };

  if (!isClient) {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72 mt-2" />
            </div>
            <div className="space-y-4">
                {menuItems.map(item => (
                    <Skeleton key={item.id} className="h-12 w-full" />
                ))}
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
        <p className="text-muted-foreground">
          Toggle modules on or off in the Main Menu.
        </p>
      </div>
      <div className="space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isParentToggledOn = toggles[item.id] ?? true;
          
          return (
             <Collapsible key={item.id} className="w-full">
              <Card className="bg-card/70 border-white/10 shadow-lg">
                <div className="px-4 py-2 flex items-center justify-between group">
                    <CollapsibleTrigger className="flex items-center gap-4 flex-grow cursor-pointer" disabled={item.subItems.length === 0}>
                        <Icon className="h-5 w-5 text-cyan-300" />
                        <span className="text-base font-medium text-white transition-colors">
                        {item.label}
                        </span>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-4">
                        <Switch
                            checked={isParentToggledOn}
                            onCheckedChange={() => handleToggle(item.id)}
                        />
                    </div>
                </div>
                {item.subItems.length > 0 && (
                    <CollapsibleContent>
                        <div className="border-t border-white/10 px-4 py-3 space-y-3">
                            {item.subItems.map(subItem => (
                                <div key={subItem.id} className="pl-10 flex items-center justify-between">
                                    <span className={cn("text-sm text-white/80", !isParentToggledOn && "text-white/40")}>{subItem.label}</span>
                                    <Switch
                                        className="transform scale-75"
                                        checked={toggles[subItem.id] ?? true}
                                        onCheckedChange={() => handleToggle(subItem.id)}
                                        disabled={!isParentToggledOn}
                                    />
                                </div>
                            ))}
                        </div>
                    </CollapsibleContent>
                )}
              </Card>
            </Collapsible>
          );
        })}
      </div>

      <div className="space-y-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Themes</h1>
            <p className="text-muted-foreground">
              Switch between dark and light mode.
            </p>
        </div>
        <div className="space-y-4">
             <Card className="bg-card/70 border-white/10 shadow-lg">
                <div className="px-4 py-2 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <Moon className="h-5 w-5 text-cyan-300" />
                        <span className="text-base font-medium text-white transition-colors">
                        Dark
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Switch
                            checked={true}
                        />
                    </div>
                </div>
              </Card>
               <Card className="bg-card/70 border-white/10 shadow-lg">
                <div className="px-4 py-2 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <Sun className="h-5 w-5 text-cyan-300" />
                        <span className="text-base font-medium text-white transition-colors">
                        Light
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Switch
                            checked={false}
                        />
                    </div>
                </div>
              </Card>
        </div>
      </div>
    </div>
  );
}
