'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Button } from '../ui/button';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, isDarkTheme, mounted } = useTheme();
  
  // 防止hydration不匹配
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className}
      >
        <span className="h-5 w-5" />
      </Button>
    );
  }

  if (showLabel) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
        className={`flex w-full justify-start px-2 ${className}`}
      >
        {isDarkTheme ? (
          <Moon className="mr-2 h-4 w-4" />
        ) : (
          <Sun className="mr-2 h-4 w-4" />
        )}
        <span>{isDarkTheme ? '切换到亮色模式' : '切换到暗色模式'}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
      className={className}
      title={isDarkTheme ? '切换到亮色模式' : '切换到暗色模式'}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">切换主题</span>
    </Button>
  );
} 