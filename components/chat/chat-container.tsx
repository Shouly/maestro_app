'use client';

import { useState } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { MessageList } from './message-list';
import { WelcomeView } from './welcome-view';
import { ChatSettingsPanel } from './chat-settings-panel';

export function ChatContainer() {
  // 获取当前活动对话
  const activeConversation = useChatStore(state => state.getActiveConversation());
  // 设置面板状态
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  // 检查当前对话是否有消息
  const hasMessages = !!activeConversation?.messages?.length;
  
  // 是否显示header（仅在有对话且有消息时显示）
  const showHeader = !!activeConversation && hasMessages;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 顶部统一标题栏 */}
      {showHeader && (
        <ChatHeader 
          onOpenSettings={() => setIsSettingsPanelOpen(true)}
          isSettingsPanelOpen={isSettingsPanelOpen}
          onCloseSettings={() => setIsSettingsPanelOpen(false)}
        />
      )}
      
      {/* 主内容区与设置面板的容器 */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* 主内容区域 */}
        <div
          className="flex flex-col min-w-0 h-full w-full transition-all duration-300 ease-in-out"
          style={{ 
            paddingRight: isSettingsPanelOpen ? 'calc(var(--panel-width, 360px) + 1.5rem)' : '0'
          }}
        >
          {/* 根据对话状态显示不同的内容 */}
          {hasMessages ? (
            <>
              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto pb-28">
                <div className="max-w-3xl mx-auto w-full">
                  <MessageList />
                </div>
              </div>

              {/* 底部输入框 */}
              <div className="fixed bottom-0 left-0 w-full transition-all duration-300 ease-in-out"
                style={{ 
                  paddingRight: isSettingsPanelOpen ? 'calc(var(--panel-width, 360px) + 1.5rem)' : '0'
                }}
              >
                <div className="max-w-3xl mx-auto w-full px-4 md:px-8">
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
        
        {/* 设置面板 - 仅在有消息时显示 */}
        {hasMessages && (
          <ChatSettingsPanel 
            isOpen={isSettingsPanelOpen} 
            onClose={() => setIsSettingsPanelOpen(false)} 
          />
        )}
      </div>
    </div>
  );
} 