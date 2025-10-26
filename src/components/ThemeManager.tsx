
'use client';

import { useEffect } from 'react';

const THEME_SETTINGS_KEY = 'themeSettings';
const DYNAMIC_STYLE_ID = 'dynamic-theme-styles';

// Helper function to convert hex to HSL string
const hexToHsl = (hex: string): string => {
    if (!hex || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0_9]{3})$/.test(hex)) {
        return '';
    }
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const applyTheme = () => {
    try {
        const storedSettings = localStorage.getItem(THEME_SETTINGS_KEY);
        const settings = storedSettings ? JSON.parse(storedSettings) : null;

        // Apply dark/light class
        const activeTheme = settings?.set || 'light';
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(activeTheme);

        // Inject CSS variables
        let styleTag = document.getElementById(DYNAMIC_STYLE_ID) as HTMLStyleElement;
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = DYNAMIC_STYLE_ID;
            document.head.appendChild(styleTag);
        }

        if (settings && settings.light && settings.dark) {
            const light = settings.light;
            const dark = settings.dark;

            const lightBackgroundHsl = hexToHsl(light.background);
            const lightForegroundHsl = hexToHsl(light.foreground);
            const lightCardHsl = hexToHsl(light.card);
            const lightBorderHsl = hexToHsl(light.border);
            const lightPrimaryHsl = hexToHsl(light.primary);
            const lightMutedForegroundHsl = hexToHsl(light.mutedForeground);

            const darkBackgroundHsl = hexToHsl(dark.background);
            const darkForegroundHsl = hexToHsl(dark.foreground);
            const darkCardHsl = hexToHsl(dark.card);
            const darkBorderHsl = hexToHsl(dark.border);
            const darkPrimaryHsl = hexToHsl(dark.primary);
            const darkMutedForegroundHsl = hexToHsl(dark.mutedForeground);

            styleTag.innerHTML = `
              :root {
                --background: ${lightBackgroundHsl};
                --foreground: ${lightForegroundHsl};
                --card: ${lightCardHsl};
                --border: ${lightBorderHsl};
                --input: ${lightBorderHsl};
                --primary: ${lightPrimaryHsl};
                --ring: ${lightPrimaryHsl};
                --muted-foreground: ${lightMutedForegroundHsl};
              }
              .dark {
                --background: ${darkBackgroundHsl};
                --foreground: ${darkForegroundHsl};
                --card: ${darkCardHsl};
                --border: ${darkBorderHsl};
                --input: ${darkBorderHsl};
                --primary: ${darkPrimaryHsl};
                --ring: ${darkPrimaryHsl};
                --muted-foreground: ${darkMutedForegroundHsl};
              }
            `;
        }
    } catch (e) {
        console.error("Failed to apply theme:", e);
    }
};

export function ThemeManager() {
  useEffect(() => {
    applyTheme();

    // Listen for changes from other tabs or from the dev options page
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === THEME_SETTINGS_KEY) {
        applyTheme();
      }
    };
    
    const handleThemeChangedEvent = () => {
        applyTheme();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChanged', handleThemeChangedEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChanged', handleThemeChangedEvent);
    };
  }, []);

  return null;
}
