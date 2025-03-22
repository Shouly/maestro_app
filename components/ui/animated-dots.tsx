'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedDotsProps {
  className?: string;
  visible?: boolean;
}

/**
 * 动画点组件
 * 显示三个有动画效果的点，用于表示AI思考/加载状态
 */
export function AnimatedDots({ className = '', visible = true }: AnimatedDotsProps) {
  if (!visible) return null;
  
  return (
    <span className={`inline-flex items-center space-x-2 py-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ 
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'loop',
            delay: i * 0.35,
            ease: "easeInOut",
          }}
          className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60"
        />
      ))}
    </span>
  );
} 