'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { STORAGE_KEYS } from '@/lib/config';
import { initTheme } from '@/lib/theme-config';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // 初始化主题
  React.useEffect(() => {
    initTheme();
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={STORAGE_KEYS.THEME}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export const useTheme = () => {
  const { theme, setTheme } = React.use<{
    theme: string | undefined;
    setTheme: (theme: string) => void;
  }>(require('next-themes'));

  return {
    theme: theme as 'light' | 'dark' | 'system' | undefined,
    setTheme,
    isLightTheme: theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches),
    isDarkTheme: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
  };
}; 