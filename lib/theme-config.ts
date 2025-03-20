import { STORAGE_KEYS } from './config';

// 主题类型
export type Theme = 'light' | 'dark' | 'system';

// 主题工具函数
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * 获取基于#126dff的主题颜色
 * @returns 主色调HSL值
 */
export const getThemeColor = (): string => {
  return '#126dff';
};

/**
 * 生成CSS变量
 * 用于初始化主题设置
 */
export const initTheme = (): void => {
  if (typeof document === 'undefined') return;
  
  // 设置CSS变量
  document.documentElement.style.setProperty('--primary-hue', '217');
  document.documentElement.style.setProperty('--primary-saturation', '100%');
}; 