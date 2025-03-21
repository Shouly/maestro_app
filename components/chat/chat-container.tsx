'use client';

import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/chat-store';
import { APP_CONFIG } from '@/lib/config';
import { Settings2, Star } from 'lucide-react';
import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { MessageList } from './message-list';
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
          <h1 className="text-xl font-semibold font-display shrink-0 ">{APP_CONFIG.APP_NAME}</h1>
          {activeConversation && (
            <>
              <div className="h-5 w-px bg-border/50 mx-1"></div>
              <ChatHeader />
            </>
          )}
        </div>

        {/* 右侧操作按钮 */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" title="收藏" className="h-8 w-8 rounded-full">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="设置" className="h-8 w-8 rounded-full">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* 根据对话状态显示不同的内容 */}
      {hasMessages ? (
        <>
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto pb-28">
            <MessageList />
          </div>

          {/* 底部输入框 - 与消息区域宽度和边距一致 */}
          <div className="fixed bottom-0 left-0 right-0 w-full">
            <div className="max-w-4xl mx-auto w-full px-4 md:px-12 lg:px-16">
              <ChatInput />
            </div>
          </div>
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