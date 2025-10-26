
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, AlertTriangle, BarChart, BookOpen, Boxes, Building, LayoutDashboard, Search, Users, Moon, Sun } from 'lucide-react';
import { axiosInstance } from '@/lib/axios-instance';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const FEATURE_FLAGS_KEY = 'featureFlags';
const THEME_SETTINGS_KEY = 'themeSettings';

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

// Function to safely get initial theme from localStorage
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    try {
      const storedSettings = localStorage.getItem(THEME_SETTINGS_KEY);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        if (settings && (settings.set === 'light' || settings.set === 'dark')) {
          return settings.set;
        }
      }
    } catch (e) {
      console.error("Failed to parse theme settings from localStorage", e);
    }
  }
  return 'light'; // Default to 'light' if nothing is found or on the server
};


export default function DeveloperOptionsPage() {
  const [accessControl, setAccessControl] = useState<AccessControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({});
  const [isThemeCollapsibleOpen, setIsThemeCollapsibleOpen] = useState(false);
  const [isLightThemeCollapsibleOpen, setIsLightThemeCollapsibleOpen] = useState(false);
  
  // Theme states with new default values
  const [theme, setTheme] = useState(getInitialTheme);
  const [darkBackgroundColor, setDarkBackgroundColor] = useState('#000000');
  const [darkForegroundColor, setDarkForegroundColor] = useState('#ffffff');
  const [darkCardColor, setDarkCardColor] = useState('#141414');
  const [darkBorderColor, setDarkBorderColor] = useState('#212121');
  const [darkPrimaryColor, setDarkPrimaryColor] = useState('#00ccff');
  const [darkMutedForegroundColor, setDarkMutedForegroundColor] = useState('#c9c9c9');

  const [lightBackgroundColor, setLightBackgroundColor] = useState('#ffffff');
  const [lightForegroundColor, setLightForegroundColor] = useState('#000000');
  const [lightCardColor, setLightCardColor] = useState('#f5f5f5');
  const [lightBorderColor, setLightBorderColor] = useState('#f0f0f0');
  const [lightPrimaryColor, setLightPrimaryColor] = useState('#00ccff');
  const [lightMutedForegroundColor, setLightMutedForegroundColor] = useState('#636363');

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
  };

  useEffect(() => {
    // This effect runs once on mount to load settings from localStorage
    try {
        const storedSettings = localStorage.getItem(THEME_SETTINGS_KEY);
        if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            if (settings) {
                if (settings.dark) {
                    setDarkBackgroundColor(settings.dark.background || '#000000');
                    setDarkForegroundColor(settings.dark.foreground || '#ffffff');
                    setDarkCardColor(settings.dark.card || '#141414');
                    setDarkBorderColor(settings.dark.border || '#212121');
                    setDarkPrimaryColor(settings.dark.primary || '#00ccff');
                    setDarkMutedForegroundColor(settings.dark.mutedForeground || '#c9c9c9');
                }
                if (settings.light) {
                    setLightBackgroundColor(settings.light.background || '#ffffff');
                    setLightForegroundColor(settings.light.foreground || '#000000');
                    setLightCardColor(settings.light.card || '#f5f5f5');
                    setLightBorderColor(settings.light.border || '#f0f0f0');
                    setLightPrimaryColor(settings.light.primary || '#00ccff');
                    setLightMutedForegroundColor(settings.light.mutedForeground || '#636363');
                }
            }
        }
    } catch (e) {
        console.error("Failed to load theme settings from localStorage", e);
    }
  }, []);
  
  useEffect(() => {
    // Effect for saving theme selection (light/dark)
    const storedSettings = localStorage.getItem(THEME_SETTINGS_KEY);
    const settings = storedSettings ? JSON.parse(storedSettings) : {};
    if (settings.set !== theme) {
      settings.set = theme;
      localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(settings));
      window.dispatchEvent(new Event('themeChanged'));
    }
  }, [theme]);
  
  useEffect(() => {
    // Effect for saving color values
    const saveColorSettings = setTimeout(() => {
        const storedSettings = localStorage.getItem(THEME_SETTINGS_KEY);
        const settings = storedSettings ? JSON.parse(storedSettings) : {};

        const updatedThemeSettings = {
            ...settings,
            dark: {
                background: darkBackgroundColor,
                foreground: darkForegroundColor,
                card: darkCardColor,
                border: darkBorderColor,
                primary: darkPrimaryColor,
                mutedForeground: darkMutedForegroundColor,
            },
            light: {
                background: lightBackgroundColor,
                foreground: lightForegroundColor,
                card: lightCardColor,
                border: lightBorderColor,
                primary: lightPrimaryColor,
                mutedForeground: lightMutedForegroundColor,
            },
        };

        localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(updatedThemeSettings));
        window.dispatchEvent(new Event('themeChanged'));
    }, 500); // Debounce to avoid excessive writes

    return () => clearTimeout(saveColorSettings);
  }, [
      darkBackgroundColor, darkForegroundColor, darkCardColor, darkBorderColor, darkPrimaryColor, darkMutedForegroundColor,
      lightBackgroundColor, lightForegroundColor, lightCardColor, lightBorderColor, lightPrimaryColor, lightMutedForegroundColor
  ]);


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

    const newAccessControl = JSON.parse(JSON.stringify(accessControl));

    if (subKey) {
      (newAccessControl[key] as { type: boolean; branchSelector: boolean })[subKey] = value;
    } else {
      newAccessControl[key] = value;
    }
    
    setAccessControl(newAccessControl);

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
      fetchFlags();
    } finally {
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
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            <span className="text-base font-medium text-foreground transition-colors">
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
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
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
        <h1 className="text-2xl font-bold text-foreground">Feature Flags</h1>
        <p className="text-muted-foreground">
          Toggle modules on or off across the application.
        </p>
      </div>
      <div className="space-y-4">
        {featureOrder.filter(key => key in accessControl).map((key) => {
          const value = accessControl[key];
          const Icon = featureIcons[key] || Users;
          if (typeof value === 'boolean') {
            return (
              <Card key={key} className="bg-card/70 border-border">
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
                <Card className="bg-card/70 border-border space-y-2">
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
                     <Card className="bg-background/80 border-border">
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
        <h1 className="text-2xl font-bold text-foreground">Themes</h1>
        <p className="text-muted-foreground">
          Switch between dark and light mode.
        </p>
      </div>
      <div className="space-y-4">
        <Collapsible
          open={isThemeCollapsibleOpen}
          onOpenChange={setIsThemeCollapsibleOpen}
        >
          <Card className="bg-card/70 border-border space-y-2">
            <CollapsibleTrigger asChild>
                <div className="cursor-pointer">
                    <div className="px-4 py-2 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                        <Moon className="h-5 w-5 text-primary" />
                        <span className="text-base font-medium text-foreground transition-colors">
                            Dark
                        </span>
                        </div>
                        <div className="flex items-center gap-4">
                        <Switch
                            checked={theme === 'dark'}
                            onCheckedChange={() => handleThemeChange('dark')}
                            onClick={(e) => e.stopPropagation()}
                        />
                        </div>
                    </div>
                </div>
            </CollapsibleTrigger>
             <CollapsibleContent className="space-y-4 px-4 pb-4">
                <Card className="bg-background/80 border-border p-4 grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={darkBackgroundColor}
                        onChange={(e) => setDarkBackgroundColor(e.target.value)}
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{darkBackgroundColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={darkForegroundColor}
                        onChange={(e) => setDarkForegroundColor(e.target.value)}
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{darkForegroundColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={darkCardColor}
                        onChange={(e) => setDarkCardColor(e.target.value)}
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{darkCardColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={darkBorderColor}
                        onChange={(e) => setDarkBorderColor(e.target.value)}
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{darkBorderColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={darkPrimaryColor}
                        onChange={(e) => setDarkPrimaryColor(e.target.value)}
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{darkPrimaryColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={darkMutedForegroundColor}
                        onChange={(e) => setDarkMutedForegroundColor(e.target.value)}
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{darkMutedForegroundColor}</span>
                  </div>
                </Card>
             </CollapsibleContent>
          </Card>
        </Collapsible>
        <Collapsible
          open={isLightThemeCollapsibleOpen}
          onOpenChange={setIsLightThemeCollapsibleOpen}
        >
          <Card className="bg-card/70 border-border space-y-2">
            <CollapsibleTrigger asChild>
              <div className="cursor-pointer">
                <div className="px-4 py-2 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <Sun className="h-5 w-5 text-primary" />
                    <span className="text-base font-medium text-foreground transition-colors">
                      Light
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                     <Switch
                        checked={theme === 'light'}
                        onCheckedChange={() => handleThemeChange('light')}
                        onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 px-4 pb-4">
                <Card className="bg-background/80 border-border p-4 grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={lightBackgroundColor}
                        onChange={(e) => setLightBackgroundColor(e.target.value)}
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{lightBackgroundColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={lightForegroundColor}
                        onChange={(e) => setLightForegroundColor(e.target.value)}
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{lightForegroundColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={lightCardColor}
                        onChange={(e) => setLightCardColor(e.target.value)}
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{lightCardColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={lightBorderColor}
                        onChange={(e) => setLightBorderColor(e.target.value)}
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{lightBorderColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={lightPrimaryColor}
                        onChange={(e) => setLightPrimaryColor(e.target.value)}
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{lightPrimaryColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={lightMutedForegroundColor}
                        onChange={(e) => setLightMutedForegroundColor(e.target.value)}
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{lightMutedForegroundColor}</span>
                  </div>
                </Card>
             </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
}

    