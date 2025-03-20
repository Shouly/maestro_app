'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ChatHeader() {
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
    <div className="flex items-center">
      {/* 对话标题编辑区域 - Claude风格 */}
      <div className="flex items-center border rounded-md px-2 py-1 bg-background/50 hover:bg-background/90 transition-colors duration-200">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 w-64 bg-transparent border-none px-1 text-sm focus:outline-none"
              autoFocus
            />
            <Button size="icon" variant="ghost" onClick={saveTitle} title="保存" className="h-6 w-6">
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={cancelEditing} title="取消" className="h-6 w-6">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 cursor-pointer" onClick={startEditing}>
              <h2 className="text-sm font-medium truncate max-w-[200px] md:max-w-[300px]">
                {activeConversation?.title || '新对话'}
              </h2>
              <Edit className="h-3.5 w-3.5 opacity-50" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 