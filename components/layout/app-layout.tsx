'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '@/lib/config';

interface AppLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  // 处理窗口尺寸变化
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    setMounted(true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      // 清除定时器
      if (hoverTimer) clearTimeout(hoverTimer);
    };
  }, [sidebarOpen, setSidebarOpen, hoverTimer]);

  // 处理鼠标进入左侧区域
  const handleMouseEnter = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    
    // 延迟打开侧边栏，避免用户无意识触发
    const timer = setTimeout(() => {
      setSidebarOpen(true);
    }, 200);
    setHoverTimer(timer);
  };

  // 处理鼠标离开侧边栏区域
  const handleMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    
    // 延迟关闭侧边栏，避免用户无意识触发
    const timer = setTimeout(() => {
      setSidebarOpen(false);
    }, 500);
    setHoverTimer(timer);
  };

  // 等待客户端挂载，避免水合错误
  if (!mounted) return null;

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      {/* 主内容区域 - 始终平铺整个页面 */}
      <div className="w-full h-full">
        {children}
      </div>

      {/* 左侧触发区域 - 用于鼠标悬停 */}
      <div 
        className="fixed left-0 top-0 h-full w-4 z-30"
        onMouseEnter={handleMouseEnter}
        aria-hidden="true"
      />

      {/* 使用Framer Motion实现侧边栏动画 */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* 遮罩层 */}
            <motion.div
              className="fixed inset-0 z-10 bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setSidebarOpen(false)}
            />

            {/* 侧边栏 */}
            <motion.div
              className="fixed inset-y-0 left-0 z-20 w-64 bg-card shadow-lg"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onMouseEnter={() => clearTimeout(hoverTimer as NodeJS.Timeout)}
              onMouseLeave={handleMouseLeave}
            >
              {/* 侧边栏标题 - 与header标题保持一致 */}
              <div className="h-14 flex items-center px-4 border-b">
                <h1 className="text-lg font-medium">{APP_CONFIG.APP_NAME}</h1>
              </div>
              
              {/* 侧边栏内容 */}
              <div className="h-[calc(100%-3.5rem)]">
                {sidebar}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 