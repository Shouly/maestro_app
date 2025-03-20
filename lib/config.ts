/**
 * 应用配置
 * 包含应用的各种配置参数
 */

/**
 * 环境变量配置
 * 优先使用环境变量，如果不存在则使用默认值
 */
const getEnvVariable = (key: string, defaultValue: string): string => {
  // 如果是服务器端渲染，返回默认值，因为process.env此时可能不可用
  if (typeof window === 'undefined') return defaultValue;

  // 尝试从全局环境变量获取值
  const value = (window as any).__ENV__?.[key] || defaultValue;
  return value;
};

/**
 * 认证相关配置
 */
export const AUTH_CONFIG = {
  // 登录页面URL
  LOGIN_URL: getEnvVariable('LOGIN_URL', 'https://example.com/login'),
  
  // 令牌有效期（毫秒），默认30分钟
  TOKEN_EXPIRY: 30 * 60 * 1000,
  
  // API基础URL
  API_BASE_URL: getEnvVariable('API_BASE_URL', 'https://api.example.com'),
  
  // 验证令牌的API端点
  VERIFY_TOKEN_ENDPOINT: '/auth/verify-token',
};

/**
 * 应用全局配置
 */
export const APP_CONFIG = {
  // 应用名称
  APP_NAME: 'Maestro',
  
  // 应用版本
  APP_VERSION: '0.1.0',
  
  // 开发模式
  DEV_MODE: process.env.NODE_ENV === 'development',
};

/**
 * 本地存储键
 */
export const STORAGE_KEYS = {
  AUTH: 'maestro-auth-storage',
  APP: 'maestro-app-storage',
  THEME: 'maestro-theme',
  CHAT: 'maestro-chat-storage',
}; 