import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { open } from '@tauri-apps/plugin-shell';
import { AUTH_CONFIG, STORAGE_KEYS } from './config';

// 定义认证状态的接口
interface AuthState {
  // 用户是否已登录
  isLoggedIn: boolean;
  // 用户令牌
  token: string | null;
  // 用户信息
  user: any | null;
  // 上次检查登录状态的时间
  lastChecked: number;
  // 登录动作
  login: (token: string, user: any) => void;
  // 注销动作
  logout: () => void;
  // 设置最后检查时间
  setLastChecked: (time: number) => void;
}

// 创建认证状态存储
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      token: null,
      user: null,
      lastChecked: 0,
      login: (token, user) => set({ isLoggedIn: true, token, user }),
      logout: () => set({ isLoggedIn: false, token: null, user: null }),
      setLastChecked: (time) => set({ lastChecked: time }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
    }
  )
);

/**
 * 检查用户的登录状态
 * @returns Promise<boolean> 表示用户是否已登录
 */
export async function checkLoginStatus(): Promise<boolean> {
  const authStore = useAuthStore.getState();
  const now = Date.now();
  
  // 如果已经登录，并且最后检查时间在配置的过期时间内，则认为登录有效
  if (authStore.isLoggedIn && (now - authStore.lastChecked < AUTH_CONFIG.TOKEN_EXPIRY)) {
    return true;
  }
  
  try {
    // TODO: 调用API验证令牌
    // 示例: 
    // const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.VERIFY_TOKEN_ENDPOINT}`, {
    //   headers: { Authorization: `Bearer ${authStore.token}` }
    // });
    
    // 模拟API调用
    const isValid = !!authStore.token;
    
    // 更新最后检查时间
    authStore.setLastChecked(now);
    
    if (!isValid) {
      authStore.logout();
    }
    
    return isValid;
  } catch (error) {
    console.error('检查登录状态时出错:', error);
    return false;
  }
}

/**
 * 打开登录页面
 */
export async function openLoginPage(): Promise<void> {
  try {
    await open(AUTH_CONFIG.LOGIN_URL);
    console.log('已打开登录页面');
  } catch (error) {
    console.error('打开登录页面时出错:', error);
  }
}

/**
 * 处理应用启动时的登录流程
 * @returns Promise<boolean> 表示用户是否已登录
 */
export async function handleAppStartup(): Promise<boolean> {
  const isLoggedIn = await checkLoginStatus();
  
  if (!isLoggedIn) {
    await openLoginPage();
  }
  
  return isLoggedIn;
}

/**
 * 模拟登录功能（仅用于测试）
 * 在实际应用中，这里应该调用真实的登录API
 */
export async function testLogin(): Promise<boolean> {
  const authStore = useAuthStore.getState();
  
  // 模拟登录成功
  authStore.login('test-token-123456', {
    id: '1',
    name: '测试用户',
    email: 'test@example.com'
  });
  
  // 更新最后检查时间
  authStore.setLastChecked(Date.now());
  
  return true;
} 