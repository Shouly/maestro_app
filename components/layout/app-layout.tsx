'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '@/lib/config';
import { User } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  const { sidebarOpen, setSidebarOpen, isFirstVisit, setFirstVisit } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef(false);
  const preventCloseRef = useRef(false);
  const pathname = usePathname();

  // 首次挂载时强制关闭侧边栏
  useEffect(() => {
    if (isFirstVisit) {
      setSidebarOpen(false);
      setFirstVisit(false);
    }
  }, [isFirstVisit, setSidebarOpen, setFirstVisit]);
  
  // 页面路径变化时关闭侧边栏
  useEffect(() => {
    // 页面加载或路径变化时，确保侧边栏关闭
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

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
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [sidebarOpen, setSidebarOpen]);

  // 为组件添加防止关闭的方法
  useEffect(() => {
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.preventClose) {
        preventCloseRef.current = customEvent.detail.preventClose;
      }
    };

    // 注册自定义事件，允许子组件控制侧边栏关闭行为
    window.addEventListener('sidebar-control', handleCustomEvent);
    
    return () => {
      window.removeEventListener('sidebar-control', handleCustomEvent);
    };
  }, []);

  // 切换侧边栏状态，添加状态锁防止动画期间重复触发
  const toggleSidebar = (open: boolean) => {
    if (isTransitioningRef.current) return;
    
    if (open !== sidebarOpen) {
      isTransitioningRef.current = true;
      setSidebarOpen(open);
      
      // 动画结束后解锁状态
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 250); // 略高于动画时间
    }
  };

  // 处理鼠标进入左侧区域
  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (sidebarOpen) return; // 如果已经打开，不执行任何操作
    
    // 延迟打开侧边栏，避免用户无意识触发
    hoverTimerRef.current = setTimeout(() => {
      toggleSidebar(true);
      hoverTimerRef.current = null;
    }, 150);
  };

  // 处理鼠标离开侧边栏区域
  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (!sidebarOpen) return; // 如果已经关闭，不执行任何操作
    
    // 检查是否应该阻止关闭
    if (preventCloseRef.current) {
      preventCloseRef.current = false;
      return;
    }
    
    // 延迟关闭侧边栏，避免用户频繁移动鼠标导致的抖动
    hoverTimerRef.current = setTimeout(() => {
      // 再次检查是否应该阻止关闭
      if (!preventCloseRef.current) {
        toggleSidebar(false);
      }
      hoverTimerRef.current = null;
    }, 300);
  };

  // 等待客户端挂载，避免水合错误
  if (!mounted) return null;

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      {/* 主内容区域 - 始终平铺整个页面 */}
      <div className="w-full h-full">
        {children}
      </div>

      {/* 左侧触发区域 - 用于鼠标悬停，只在侧边栏关闭时激活 */}
      {!sidebarOpen && (
        <div 
          className="fixed left-0 top-0 h-full w-8 z-50"
          onMouseEnter={handleMouseEnter}
          aria-hidden="true"
        />
      )}

      {/* 固定的头像按钮 - 当侧边栏关闭时显示 */}
      {!sidebarOpen && (
        <button
          className="fixed left-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
          onClick={() => toggleSidebar(true)}
          aria-label="打开侧边栏"
        >
          <User size={20} />
        </button>
      )}

      {/* 使用Framer Motion实现侧边栏动画 */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* 遮罩层 */}
            <motion.div
              className="fixed inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => toggleSidebar(false)}
            />

            {/* 侧边栏 */}
            <motion.div
              className="fixed left-0 z-50 w-72 bg-card/70 my-2 rounded-r-lg border-r border-t border-b border-border"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ 
                type: "spring", 
                stiffness: 250,
                damping: 25,
                mass: 1,
                duration: 0.2  
              }}
              style={{ 
                height: 'calc(100% - 1rem)',
                bottom: '0.25rem',
                backdropFilter: 'blur(8px)'
              }}
              onMouseEnter={() => {
                if (hoverTimerRef.current) {
                  clearTimeout(hoverTimerRef.current);
                  hoverTimerRef.current = null;
                }
              }}
              onMouseLeave={handleMouseLeave}
            >
              {/* 侧边栏标题 - 与header标题保持一致 */}
              <div className="h-14 flex items-center px-4 pb-1">
                <h1 className="text-xl font-semibold font-display">{APP_CONFIG.APP_NAME}</h1>
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