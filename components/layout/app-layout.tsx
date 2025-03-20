'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const [mounted, setMounted] = useState(false);

  // 处理窗口尺寸变化
  useEffect(() => {
    // 在移动设备上自动关闭侧边栏
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    setMounted(true);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, setSidebarOpen]);

  // 在移动设备上点击内容区域时关闭侧边栏
  const handleContentClick = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // 等待客户端挂载，避免水合错误
  if (!mounted) return null;

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      {/* 主内容区域 - 始终平铺整个页面 */}
      <div 
        className="w-full h-full overflow-auto"
        onClick={sidebarOpen ? handleContentClick : undefined}
      >
        {children}
      </div>

      {/* 侧边栏 - 作为弹出层 */}
      {sidebarOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-10 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* 侧边栏内容 */}
          <div
            className="fixed inset-y-0 left-0 z-20 w-64 bg-card shadow-lg"
          >
            {sidebar}
          </div>
        </>
      )}
    </div>
  );
} 