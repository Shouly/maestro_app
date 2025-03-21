'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { ChatInput } from './chat-input';

export function WelcomeView() {
  const user = useAuthStore(state => state.user);
  const userName = user?.name || '您';
  
  // 根据当前时间获取问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '早上好';
    } else if (hour >= 12 && hour < 18) {
      return '下午好';
    } else {
      return '晚上好';
    }
  };

  return (
    <div className="flex flex-col items-center h-full pt-[8%]">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-light tracking-tight text-foreground/90">{getGreeting()}，{userName}</h1>
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
  );
} 