import { ThemeProviderContext } from '@/hooks/use-theme';
import { type Theme } from '@/types/theme.types';
import { useEffect, useState } from 'react';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export const ThemeProvider = ({
  children,
  defaultTheme = 'system',
  storageKey = 'praxis-theme',
  ...props
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme !== 'system') {
        return;
      }
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};
