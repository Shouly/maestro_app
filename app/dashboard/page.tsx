'use client';

import { Button } from "@/app/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto w-full"
      >
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
        </div>
        
        <div className="space-y-8">
          <h1 className="text-3xl font-bold">仪表盘</h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300">
            这是一个使用Next.js v15、Tailwind CSS、shadcn/ui和Framer Motion构建的示例页面。
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button>默认按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="outline">轮廓按钮</Button>
            <Button variant="destructive">危险按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
            <Button variant="link">链接按钮</Button>
          </div>
          
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">卡片组件</h2>
            <p className="mb-4">这是一个基于shadcn/ui设计系统的卡片组件示例。</p>
            <Button variant="outline">了解更多</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 