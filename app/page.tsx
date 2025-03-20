'use client';

import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';

export default function Home() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function greet() {
    // 调用Tauri的Rust函数
    setGreetMsg(await invoke('greet', { name }));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 max-w-5xl w-full flex flex-col items-center justify-center"
      >
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

        <p className="mb-8 text-center max-w-lg">
          点击上方的 Next.js 和 Tauri 标志以了解更多。
          使用 Tailwind CSS 和 shadcn/ui 组件库以及 Framer Motion 构建。
        </p>

        <div className="flex gap-4 mb-8">
          <Link href="/dashboard">
            <Button>仪表盘</Button>
          </Link>
        </div>

        <div className="mb-8 w-full max-w-md">
          <form
            className="flex flex-col space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              greet();
            }}
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="输入你的名字..."
            />
            <Button type="submit">问候</Button>
          </form>
          {greetMsg && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md"
            >
              {greetMsg}
            </motion.p>
          )}
        </div>
      </motion.div>
    </main>
  );
} 