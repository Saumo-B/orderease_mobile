
'use client';

import { useEffect } from 'react';

const THEME_SETTINGS_KEY = 'themeSettings';
const DYNAMIC_STYLE_ID = 'dynamic-theme-styles';

const applyTheme = () => {
  try {
    // We are enforcing the premium Green/Black theme, so we ignore stored dynamic colors.
    // However, we ensure the 'dark' class is applied.
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');

    // Remove any previously injected dynamic styles
    const styleTag = document.getElementById(DYNAMIC_STYLE_ID);
    if (styleTag) {
      styleTag.remove();
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
