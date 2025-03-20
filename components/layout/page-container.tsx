'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function PageContainer({
  children,
  className = '',
  fullWidth = false,
}: PageContainerProps) {
  return (
    <main className={`flex min-h-screen flex-col p-6 md:p-10 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`mx-auto w-full ${fullWidth ? '' : 'max-w-5xl'}`}
      >
        {children}
      </motion.div>
    </main>
  );
} 