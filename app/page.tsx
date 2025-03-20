'use client';

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageContainer } from '@/components/layout/page-container';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');
  const { lastGreeting, setLastGreeting } = useAppStore();

  // 恢复上次的问候
  useEffect(() => {
    if (lastGreeting) {
      setGreetMsg(lastGreeting);
    }
  }, [lastGreeting]);

  async function greet() {
    try {
      // 调用Tauri的Rust函数
      const message = await invoke('greet', { name });
      setGreetMsg(message);
      setLastGreeting(message);
    } catch (error) {
      console.error('调用Rust函数出错:', error);
      setGreetMsg('发生错误，请查看控制台');
    }
  }

  return (
    <PageContainer>
      <div className="mb-4 flex justify-end">
        <ThemeToggle />
      </div>
      
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-center">
          欢迎使用 Tauri + Next.js v15
        </h1>

        <div className="flex justify-center gap-8 mb-8">
          <a href="https://nextjs.org" target="_blank" rel="noreferrer">
            <Image
              src="/next.svg"
              alt="Next.js Logo"
              width={180}
              height={37}
              className="dark:invert"
              priority
            />
          </a>
          <a href="https://tauri.app" target="_blank" rel="noreferrer">
            <Image
              src="/tauri.svg"
              alt="Tauri Logo"
              width={144}
              height={36}
              priority
            />
          </a>
        </div>

        <Card className="w-full max-w-lg mb-8">
          <CardHeader>
            <CardTitle>关于</CardTitle>
            <CardDescription>
              这是一个使用现代技术栈构建的桌面应用
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              点击上方的 Next.js 和 Tauri 标志以了解更多。
              使用 Tailwind CSS 和 shadcn/ui 组件库以及 Framer Motion 构建。
            </p>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button>仪表盘</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>问候示例</CardTitle>
            <CardDescription>
              尝试输入你的名字，体验Tauri与前端的交互
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                greet();
              }}
            >
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入你的名字..."
              />
              <Button type="submit">问候</Button>
            </form>
          </CardContent>
          {greetMsg && (
            <CardFooter>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-4 bg-muted rounded-md"
              >
                {greetMsg}
              </motion.p>
            </CardFooter>
          )}
        </Card>
      </div>
    </PageContainer>
  );
} 