'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function Home() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [greeting, setGreeting] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 获取时间生成问候语
    const hours = new Date().getHours();
    let greetingText = '';
    
    if (hours < 12) {
      greetingText = '早上好';
    } else if (hours < 18) {
      greetingText = '下午好';
    } else {
      greetingText = '晚上好';
    }
    
    setGreeting(greetingText);
  }, []);

  // 处理注销
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Maestro 主页</CardTitle>
          <CardDescription>
            {greeting}，欢迎回来！
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">用户信息</h3>
            <p className="text-sm">
              {user ? `已登录：${user.name || '用户'}` : '暂无用户信息'}
            </p>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">应用状态</h3>
            <p className="text-sm">
              登录状态：<span className="text-green-500 font-medium">已登录</span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">刷新</Button>
          <Button variant="destructive" onClick={handleLogout}>注销</Button>
        </CardFooter>
      </Card>
    </main>
  );
} 