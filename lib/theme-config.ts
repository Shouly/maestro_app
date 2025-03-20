// 主题类型
export type Theme = 'light' | 'dark';

// 主题工具函数
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * 获取主题颜色
 * @returns 主色调颜色值
 */
export const getThemeColor = (): string => {
  return '#d97757';
};

/**
 * 生成CSS变量
 * 用于初始化主题设置
 */
export const initTheme = (): void => {
  if (typeof document === 'undefined') return;

  // 设置CSS变量 - 基于#d97757（HSL: 20, 65%, 60%）
  document.documentElement.style.setProperty('--primary-hue', '20');
  document.documentElement.style.setProperty('--primary-saturation', '65%');
};