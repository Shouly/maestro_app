'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { STORAGE_KEYS } from '@/lib/config';
import { initTheme } from '@/lib/theme-config';
import { useTheme as useNextTheme } from 'next-themes';

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
  const { theme, setTheme } = useNextTheme();
  
  const [mounted, setMounted] = React.useState(false);
  
  // 只在客户端处理主题检测
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // 计算是否为浅色或深色主题的值
  const isLightTheme = React.useMemo(() => {
    if (!mounted) return false;
    return theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [theme, mounted]);
  
  const isDarkTheme = React.useMemo(() => {
    if (!mounted) return false;
    return theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [theme, mounted]);

  return {
    theme: theme as 'light' | 'dark' | 'system' | undefined,
    setTheme,
    isLightTheme,
    isDarkTheme,
    mounted
  };
};