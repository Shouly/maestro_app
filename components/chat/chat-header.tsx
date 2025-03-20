'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { Menu, Share, MoreHorizontal, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { APP_CONFIG } from '@/lib/config';

export function ChatHeader() {
  const { toggleSidebar, sidebarOpen } = useAppStore();
  const { activeConversationId, getActiveConversation, updateConversationTitle } = useChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const activeConversation = getActiveConversation();

  // 当活动对话变化时，更新标题
  useEffect(() => {
    if (activeConversation) {
      setTitle(activeConversation.title);
    } else {
      setTitle('新对话');
    }
  }, [activeConversation]);

  // 开始编辑
  const startEditing = () => {
    setIsEditing(true);
    // 使用setTimeout确保DOM更新后再聚焦
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  // 保存标题
  const saveTitle = () => {
    if (activeConversationId && title.trim()) {
      updateConversationTitle(activeConversationId, title.trim());
    }
    setIsEditing(false);
  };

  // 取消编辑
  const cancelEditing = () => {
    if (activeConversation) {
      setTitle(activeConversation.title);
    }
    setIsEditing(false);
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          title={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* 应用名称显示 - 在所有屏幕尺寸上显示 */}
        <h1 className="text-lg font-medium">{APP_CONFIG.APP_NAME}</h1>
        
        {/* 对话标题编辑区域 */}
        <div className="hidden md:flex h-full items-center border-l pl-4 ml-1">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 w-64 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button size="icon" variant="ghost" onClick={saveTitle} title="保存">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={cancelEditing} title="取消">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium truncate max-w-[200px] md:max-w-[400px]">
                {activeConversation?.title || '新对话'}
              </h2>
              <Button variant="ghost" size="icon" onClick={startEditing} title="编辑标题">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="分享">
          <Share className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" title="更多选项">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
} 