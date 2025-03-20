'use client';

import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { ChatSidebar } from '@/components/chat/sidebar';
import { ChatContainer } from '@/components/chat/chat-container';
import { AuthCheck } from '@/components/auth/auth-check';
import { useChatStore } from '@/lib/chat-store';

export default function Home() {
  const { createConversation } = useChatStore();
  
  useEffect(() => {
    // 如果没有活跃对话，创建一个新对话
    const activeConversation = useChatStore.getState().getActiveConversation();
    if (!activeConversation) {
      createConversation();
    }
  }, [createConversation]);

  return (
    <AuthCheck>
      <AppLayout sidebar={<ChatSidebar />}>
        <ChatContainer />
      </AppLayout>
    </AuthCheck>
  );
} 