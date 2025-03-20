'use client';

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Settings, Bell, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex min-h-screen flex-col p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto w-full"
      >
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索..."
                className="w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold">仪表盘</h1>
            <p className="text-lg text-muted-foreground mt-2">
              欢迎使用Maestro应用的管理界面
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>组件展示</CardTitle>
                  <CardDescription>shadcn/ui组件库</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">这是一个基于Tailwind CSS构建的卡片组件，支持各种自定义样式。</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">按钮</Button>
                    <Button size="sm" variant="secondary">次要</Button>
                    <Button size="sm" variant="outline">轮廓</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Framer Motion</CardTitle>
                  <CardDescription>动画效果</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">整合了Framer Motion实现丰富的动画效果，提升用户体验。</p>
                  <Button variant="outline">了解更多</Button>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Tauri</CardTitle>
                  <CardDescription>跨平台能力</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Tauri提供轻量级、安全且高性能的跨平台桌面应用开发能力。</p>
                  <Button variant="outline">了解更多</Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>输入示例</CardTitle>
                <CardDescription>试试输入组件的各种样式</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    用户名
                  </label>
                  <Input id="name" placeholder="输入用户名" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    邮箱
                  </label>
                  <Input id="email" type="email" placeholder="输入邮箱地址" />
                </div>
                <div className="flex justify-end">
                  <Button>保存</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 