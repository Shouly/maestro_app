'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { Edit, Check, X, MessageSquare } from 'lucide-react';
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
      {/* 对话标题编辑区域 - Canva风格 */}
      <div 
        className={`flex items-center rounded-xl px-3 py-1.5 transition-all duration-200 ${
          isEditing 
            ? 'bg-accent/90 shadow-sm' 
            : 'hover:bg-accent/40 cursor-pointer shadow-canva-sm'
        }`}
        onClick={!isEditing ? startEditing : undefined}
      >
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 w-64 bg-transparent border-none px-1 text-sm focus:outline-none"
              autoFocus
            />
            <div className="flex items-center">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={saveTitle} 
                title="保存" 
                className="h-7 w-7 rounded-full text-success hover:text-success hover:bg-success/10"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={cancelEditing} 
                title="取消" 
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-0.5">
            <MessageSquare className="h-4 w-4 text-primary/70" />
            <h2 className="text-sm font-medium truncate max-w-[200px] md:max-w-[300px] font-display">
              {activeConversation?.title || '新对话'}
            </h2>
            <Edit className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </div>
  );
} 