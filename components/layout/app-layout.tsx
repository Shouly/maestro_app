'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '@/lib/config';
import { User } from 'lucide-react';

interface AppLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const [mounted, setMounted] = useState(false);

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
    };
  }, [sidebarOpen, setSidebarOpen]);

  // 切换侧边栏状态
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 等待客户端挂载，避免水合错误
  if (!mounted) return null;

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      {/* 主内容区域 - 始终平铺整个页面 */}
      <div className="w-full h-full">
        {children}
      </div>

      {/* 固定的头像按钮 - 当侧边栏关闭时显示 */}
      {!sidebarOpen && (
        <button
          className="fixed left-4 bottom-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
          onClick={toggleSidebar}
          aria-label="打开侧边栏"
        >
          <User size={18} />
        </button>
      )}

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
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setSidebarOpen(false)}
            />

            {/* 侧边栏 */}
            <motion.div
              className="fixed inset-y-0 left-0 z-20 w-64 bg-card shadow-lg"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.2 
              }}
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