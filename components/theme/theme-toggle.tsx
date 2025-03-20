'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from './theme-provider';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { setTheme, isDarkTheme, mounted } = useTheme();

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
        className={`flex w-full justify-start px-2 rounded-lg ${className}`}
      >
        {isDarkTheme ? (
          <Moon className="mr-2 h-4 w-4 text-primary" />
        ) : (
          <Sun className="mr-2 h-4 w-4 text-primary" />
        )}
        <span>{isDarkTheme ? '切换到亮色模式' : '切换到暗色模式'}</span>
      </Button>
    );
  }

  return (
    <div className="relative inline-flex">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
        className={`rounded-full h-8 w-8 ${className}`}
        title={isDarkTheme ? '切换到亮色模式' : '切换到暗色模式'}
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          <Sun className="absolute h-4 w-4 text-primary rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 text-primary rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
        </div>
        <span className="sr-only">切换主题</span>
      </Button>
    </div>
  );
} 