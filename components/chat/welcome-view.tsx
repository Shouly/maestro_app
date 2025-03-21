'use client';

import { useAuthStore } from '@/lib/auth';
import { motion } from 'framer-motion';
import { CloudSunIcon, MoonIcon, SunIcon } from 'lucide-react';
import { ChatInput } from './chat-input';
import { APP_CONFIG } from '@/lib/config';

export function WelcomeView() {
  const user = useAuthStore(state => state.user);
  const userName = user?.name || '您';

  // 根据当前时间获取问候语和图标
  const getTimeInfo = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: '早上好',
        icon: <SunIcon className="h-12 w-12 text-primary" />,
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        greeting: '下午好',
        icon: <CloudSunIcon className="h-12 w-12 text-primary" />,
      };
    } else {
      return {
        greeting: '晚上好',
        icon: <MoonIcon className="h-12 w-12 text-primary" />,
      };
    }
  };

  const { greeting, icon } = getTimeInfo();

  return (
    <div className="flex flex-col h-full">
      {/* 左上角系统名称 */}
      <div className="h-14 flex items-center px-4 shrink-0 z-30 bg-background">
        <h1 className="text-xl font-semibold font-display">{APP_CONFIG.APP_NAME}</h1>
      </div>
      
      <div className="flex flex-col items-center flex-1 pt-[6%]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center h-12 w-12"
            >
              {icon}
            </motion.div>
            <h1 className="text-4xl font-light tracking-tight text-foreground/90">{greeting}，{userName}</h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-full max-w-[720px] mx-auto px-6 md:px-8"
        >
          <ChatInput isCentered={true} />
        </motion.div>
      </div>
    </div>
  );
} 