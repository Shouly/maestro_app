'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore, testLogin } from '@/lib/auth';
import { AUTH_CONFIG } from '@/lib/config';

export default function LoginPage() {
  const [isWaiting, setIsWaiting] = useState(true);
  const [message, setMessage] = useState('等待登录...');
  const router = useRouter();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  // 在初始加载时检查登录状态
  useEffect(() => {
    if (isLoggedIn) {
      // 如果已登录，直接跳转到主页
      router.push('/');
      return;
    }

    // 设置等待状态
    setIsWaiting(true);
    setMessage('准备打开登录页面...');

    // 使用超时模拟等待外部登录完成
    const checkInterval = setInterval(() => {
      const auth = useAuthStore.getState();
      if (auth.isLoggedIn) {
        clearInterval(checkInterval);
        setMessage('登录成功！正在跳转...');
        router.push('/');
      } else {
        setMessage('等待登录完成...');
      }
    }, 2000);

    // 5秒后关闭等待状态，允许用户手动触发
    setTimeout(() => {
      setIsWaiting(false);
      setMessage('请在浏览器中完成登录，然后返回应用');
    }, 5000);

    // 清理副作用
    return () => {
      clearInterval(checkInterval);
    };
  }, [isLoggedIn, router]);

  // 手动打开登录页面
  const handleOpenLoginPage = async () => {
    setMessage('打开登录页面...');
    try {
      window.open(AUTH_CONFIG.LOGIN_URL, '_blank');
      setMessage('请在浏览器中完成登录，然后返回应用');
    } catch (error) {
      console.error('打开登录页面失败:', error);
      setMessage('打开登录页面失败，请手动访问登录页面');
    }
  };

  // 测试登录（仅用于开发）
  const handleTestLogin = async () => {
    setMessage('正在测试登录...');
    try {
      await testLogin();
      setMessage('登录成功！正在跳转...');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      console.error('测试登录失败:', error);
      setMessage('测试登录失败，请重试');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">欢迎使用 Maestro</CardTitle>
          <CardDescription>
            请登录以继续使用应用
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="mb-4">{message}</p>
            {!isWaiting && (
              <div className="space-y-2">
                <Button 
                  onClick={handleOpenLoginPage}
                  className="w-full"
                >
                  打开登录页面
                </Button>
                <Button 
                  onClick={handleTestLogin}
                  variant="outline"
                  className="w-full"
                >
                  测试登录 (仅用于开发)
                </Button>
              </div>
            )}
            {isWaiting && (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 