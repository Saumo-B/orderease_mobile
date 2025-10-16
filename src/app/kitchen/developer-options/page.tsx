
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, AlertTriangle, BarChart, BookOpen, Boxes, Building, LayoutDashboard, Search, Users, Moon, Sun } from 'lucide-react';
import { axiosInstance } from '@/lib/axios-instance';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const FEATURE_FLAGS_KEY = 'featureFlags';

interface AccessControl {
  [key: string]: boolean | { type: boolean; branchSelector: boolean };
}

const featureIcons: Record<string, React.ElementType> = {
  orders: Search,
  dashboard: LayoutDashboard,
  salesReport: BarChart,
  inventory: Boxes,
  menu: BookOpen,
  roles: Users,
  branches: Building,
};

// Define the desired order of features
const featureOrder: string[] = [
    'orders',
    'dashboard',
    'salesReport',
    'inventory',
    'menu',
    'roles',
    'branches',
];

// Helper function to format camelCase keys into readable labels
const formatLabel = (key: string) => {
    if (key === 'branches') return 'Outlets';
    if (key === 'salesReport') return 'Sales Report';
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
};


export default function DeveloperOptionsPage() {
  const [accessControl, setAccessControl] = useState<AccessControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({});

  const fetchFlags = useCallback(() => {
    setLoading(true);
    try {
      const storedFlags = localStorage.getItem(FEATURE_FLAGS_KEY);
      if (storedFlags) {
        setAccessControl(JSON.parse(storedFlags));
      } else {
        setError("Feature flags not found in local storage.");
      }
    } catch (e) {
      console.error("Failed to parse feature flags", e);
      setError("Could not load feature flags.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);
  
  const handleFlagChange = async (
    key: string,
    subKey: 'type' | 'branchSelector' | null,
    value: boolean
  ) => {
    if (!accessControl) return;

    setUpdating(true);

    // Create a deep copy to modify
    const newAccessControl = JSON.parse(JSON.stringify(accessControl));

    if (subKey) {
      (newAccessControl[key] as { type: boolean; branchSelector: boolean })[subKey] = value;
    } else {
      newAccessControl[key] = value;
    }
    
    // Optimistically update UI
    setAccessControl(newAccessControl);

    // Flatten the structure for the API request
    const payload: { [key: string]: boolean } = {};
    for (const flagKey in newAccessControl) {
      const flagValue = newAccessControl[flagKey];
      if (typeof flagValue === 'object' && flagValue !== null) {
        payload[flagKey] = flagValue.type;
        payload[`${flagKey}BranchSelector`] = flagValue.branchSelector;
      } else {
        payload[flagKey] = flagValue as boolean;
      }
    }
    
    try {
      const response = await axiosInstance.patch('/api/access/', payload);
      if (response.data && response.data.accessControl) {
        localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(response.data.accessControl));
        setAccessControl(response.data.accessControl);
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to update feature flags:', err);
      setError('Could not save changes. Please try again.');
      // Revert to original state on error
      fetchFlags();
    } finally {
      // The page will reload, so this is not strictly necessary
      // but good practice in case the reload fails.
      setUpdating(false);
    }
  };

  const FlagToggle = ({
    label,
    icon: Icon,
    checked,
    onCheckedChange,
    disabled = false,
  }: {
    label: string;
    icon?: React.ElementType;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <div className="px-4 py-2 flex items-center justify-between group">
        <div className="flex items-center gap-4">
            {Icon && <Icon className="h-5 w-5 text-cyan-300" />}
            <span className="text-base font-medium text-white transition-colors">
                {label}
            </span>
        </div>
        <div className="flex items-center gap-4">
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    </div>
  );

  if (loading || updating) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  if (!accessControl) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
        <p className="text-muted-foreground">
          Toggle modules on or off across the application.
        </p>
      </div>
      <div className="space-y-4">
        {featureOrder.filter(key => key in accessControl).map((key) => {
          const value = accessControl[key];
          const Icon = featureIcons[key] || Users; // Default to a generic icon
          if (typeof value === 'boolean') {
            return (
              <Card key={key} className="bg-card/70 border-white/10 shadow-lg">
                <FlagToggle
                  label={formatLabel(key)}
                  icon={Icon}
                  checked={value}
                  onCheckedChange={(checked) => handleFlagChange(key, null, checked)}
                  disabled={updating}
                />
              </Card>
            );
          }
          if (typeof value === 'object' && value !== null) {
            return (
              <Collapsible
                key={key}
                open={openCollapsibles[key] || false}
                onOpenChange={(isOpen) =>
                  setOpenCollapsibles((prev) => ({ ...prev, [key]: isOpen }))
                }
              >
                <Card className="bg-card/70 border-white/10 shadow-lg space-y-2">
                  <CollapsibleTrigger asChild>
                    <div className="cursor-pointer">
                        <FlagToggle
                            label={formatLabel(key)}
                            icon={Icon}
                            checked={value.type}
                            onCheckedChange={(checked) => handleFlagChange(key, 'type', checked)}
                            disabled={updating}
                        />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 px-4 pb-4">
                     <Card className="bg-background/80 border-white/10 shadow-inner">
                       <FlagToggle
                          label="Branch Selector"
                          checked={value.branchSelector}
                          onCheckedChange={(checked) => handleFlagChange(key, 'branchSelector', checked)}
                          disabled={updating || !value.type}
                        />
                     </Card>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          }
          return null;
        })}
      </div>
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
              <Switch checked={true} />
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
              <Switch checked={false} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
