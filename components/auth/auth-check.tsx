'use client';

import { useEffect, useState } from 'react';
import { handleAppStartup, useAuthStore } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthCheckProps {
  children: React.ReactNode;
}

/**
 * 身份验证检查组件
 * 在应用启动时检查用户的登录状态，根据状态执行相应的动作
 */
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

  // 当正在检查登录状态时，显示加载状态
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">正在检查登录状态...</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录且不在登录页面，不渲染子组件
  if (!isLoggedIn && pathname !== '/login') {
    return null;
  }

  // 登录状态已确认，渲染子组件
  return <>{children}</>;
} 