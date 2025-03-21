'use client';

import React from 'react';
import { ChatHeader } from './chat-header';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { APP_CONFIG } from '@/lib/config';
import { Share, Star, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/chat-store';
import { WelcomeView } from './welcome-view';

export function ChatContainer() {
  // 获取当前活动对话
  const activeConversation = useChatStore(state => state.getActiveConversation());
  
  // 检查当前对话是否有消息
  const hasMessages = !!activeConversation?.messages?.length;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* 单一统一的Header，包含系统名称、对话标题和操作按钮 */}
      <header className="h-14 flex items-center justify-between px-4 shrink-0">
        {/* 左侧：系统名称和对话标题 */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium font-display shrink-0">{APP_CONFIG.APP_NAME}</h1>
          {activeConversation && (
            <>
              <div className="h-5 w-px bg-border/50 mx-1"></div>
              <ChatHeader />
            </>
          )}
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
      
      {/* 根据对话状态显示不同的内容 */}
      {hasMessages ? (
        <>
          {/* 消息列表 */}
          <div className="flex-1 overflow-hidden">
            <MessageList />
          </div>
          
          {/* 底部输入框 - 移除边界线 */}
          <ChatInput />
        </>
      ) : (
        /* 欢迎视图，包含居中输入框 */
        <div className="flex-1 overflow-hidden">
          <WelcomeView />
        </div>
      )}
    </div>
  );
} 