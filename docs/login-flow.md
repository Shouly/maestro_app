# Maestro 登录流程文档

## 功能概述

Maestro应用的登录流程实现了以下功能：

1. 应用启动时自动检查用户的登录状态
2. 未登录用户将被重定向到登录页面
3. 登录页面可以打开外部浏览器进行登录
4. 登录成功后自动跳转到应用主页
5. 已登录用户可以查看个人信息并进行注销操作

## 技术实现

### 1. 认证状态管理

使用 Zustand 实现了一个持久化的认证状态存储，位于 `lib/auth.ts`：

```typescript
// 定义认证状态的接口
interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: any | null;
  lastChecked: number;
  login: (token: string, user: any) => void;
  logout: () => void;
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
```

### 2. 环境配置

集中管理应用配置，位于 `lib/config.ts`：

```typescript
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
```

### 3. 登录状态检查

实现了登录状态检查功能，位于 `lib/auth.ts`：

```typescript
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
```

### 4. 浏览器打开功能

使用 Tauri 的 Shell 插件实现了在默认浏览器中打开登录页面：

```typescript
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
```

### 5. 认证检查组件

创建了 `AuthCheck` 组件用于在应用启动时检查登录状态，位于 `components/auth/auth-check.tsx`：

```tsx
export function AuthCheck({ children }: AuthCheckProps) {
  const [isChecking, setIsChecking] = useState(true);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 检查登录状态，如果未登录会自动打开登录页面
        const loggedIn = await handleAppStartup();
        setIsChecking(false);
        
        // 根据登录状态和当前路径进行路由重定向
        if (!loggedIn && pathname !== '/login') {
          // 如果未登录且不在登录页面，重定向到登录页面
          router.push('/login');
        } else if (loggedIn && pathname === '/login') {
          // 如果已登录且在登录页面，重定向到首页
          router.push('/');
        }
      } catch (error) {
        console.error('认证检查失败:', error);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // ... 其余渲染逻辑
}
```

## 流程图

```
┌─────────────┐     否      ┌─────────────┐
│  应用启动   │─────────────▶│ 登录页面    │
└─────┬───────┘             └──────┬──────┘
      │                            │
      ▼                            │
┌─────────────┐                    │
│ 检查登录状态 │                    │
└─────┬───────┘                    │
      │                            │
      ▼                            ▼
┌─────────────┐     是     ┌─────────────┐
│ 是否已登录? │◀───────────│ 打开浏览器   │
└─────┬───────┘            │ 进行登录    │
      │                    └─────────────┘
      │ 是
      ▼
┌─────────────┐
│   主页面    │
└─────────────┘
```

## 使用说明

1. **应用启动**：
   - 应用启动时会自动检查用户的登录状态
   - 如果未登录，将重定向到登录页面

2. **登录流程**：
   - 在登录页面上，点击"打开登录页面"按钮在外部浏览器中进行登录
   - 登录成功后，返回应用，应用会自动检测登录状态并跳转到主页

3. **注销操作**：
   - 在主页上，点击"注销"按钮可以退出登录状态
   - 注销后会自动跳转到登录页面

## 技术依赖

- **Next.js**: 用于前端路由和页面渲染
- **Zustand**: 用于状态管理
- **Tauri**: 用于桌面应用功能，包括打开浏览器
- **shadcn/ui**: 用于UI组件

## 安全配置

在 Tauri 2.0 中，需要以下配置来启用浏览器打开功能：

1. `src-tauri/tauri.conf.json` 中的插件配置：
```json
"plugins": {
  "shell": {
    "open": true
  }
}
```

2. `src-tauri/capabilities/default.json` 中的权限配置：
```json
"permissions": [
  "core:default",
  "opener:default",
  "shell:allow-open"
]
```

## 后续改进

1. **实际API集成**：
   - 替换模拟的API调用为实际的后端API调用
   - 实现真实的令牌验证逻辑

2. **会话续期**：
   - 添加令牌刷新功能，以支持长时间使用
   - 实现会话自动续期

3. **安全增强**：
   - 添加二次验证功能
   - 增加更详细的登录错误处理 