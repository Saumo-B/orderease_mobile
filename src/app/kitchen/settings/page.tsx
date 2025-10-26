
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';

const THEME_SETTINGS_KEY = 'themeSettings';

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


export default function SettingsPage() {
  const [theme, setTheme] = useState(getInitialTheme);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
  };

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


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Themes</h1>
        <p className="text-muted-foreground">
          Switch between dark and light mode.
        </p>
      </div>
      <div className="space-y-4">
        <Card className="bg-card/70 border-border">
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
              />
            </div>
          </div>
        </Card>
        <Card className="bg-card/70 border-border">
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
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
