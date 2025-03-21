'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { ChatInput } from './chat-input';

export function WelcomeView() {
  const user = useAuthStore(state => state.user);
  const userName = user?.name || '您';

  return (
    <div className="flex flex-col items-center justify-center h-full pb-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-2xl">✨</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-3">您好，{userName}</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          欢迎使用Maestro智能助手，有什么可以帮助您的？
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-2xl px-4"
      >
        <ChatInput isCentered={true} />
      </motion.div>
    </div>
  );
} 