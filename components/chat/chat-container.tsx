'use client';

import React from 'react';
import { ChatHeader } from './chat-header';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { APP_CONFIG } from '@/lib/config';
import { Share, Star, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ChatContainer() {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* 单一统一的Header，包含系统名称、对话标题和操作按钮 */}
      <header className="h-14 flex items-center justify-between px-4 shrink-0">
        {/* 左侧系统名称 */}
        <div className="flex items-center">
          <h1 className="text-lg font-medium font-display">{APP_CONFIG.APP_NAME}</h1>
        </div>
        
        {/* 中间对话标题 */}
        <div className="flex-1 flex justify-center">
          <ChatHeader />
        </div>
        
        {/* 右侧操作按钮 */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl">
            分享
            <Share className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" title="收藏" className="h-8 w-8 rounded-full">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="更多选项" className="h-8 w-8 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      {/* 消息列表 */}
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>
      
      {/* 输入框 */}
      <ChatInput />
    </div>
  );
} 