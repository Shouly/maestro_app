'use client';

import React from 'react';
import { useAuthStore } from '@/lib/auth';
import { useChatStore } from '@/lib/chat-store';
import { Plus, Trash2, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useRouter } from 'next/navigation';

export function ChatSidebar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { 
    conversations, 
    activeConversationId, 
    createConversation, 
    setActiveConversation,
    deleteConversation 
  } = useChatStore();

  // 处理注销
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // 创建新对话
  const handleNewChat = () => {
    createConversation();
  };

  // 选择对话
  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
  };

  // 删除对话
  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  return (
    <div className="flex h-full flex-col py-2">
      {/* 顶部按钮 */}
      <div className="px-3 py-2">
        <Button 
          onClick={handleNewChat} 
          className="w-full justify-start gap-2"
        >
          <Plus size={16} />
          新对话
        </Button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-auto px-3 py-2">
        <h2 className="mb-2 px-1 text-xs font-medium text-muted-foreground">
          对话历史
        </h2>
        <div className="space-y-1">
          {conversations.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              暂无对话记录
            </p>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className={`w-full truncate rounded-md px-3 py-2 text-left text-sm ${
                  activeConversationId === conversation.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{conversation.title}</span>
                  <Trash2
                    size={14}
                    className="opacity-0 hover:text-destructive group-hover:opacity-100"
                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                  />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 底部用户信息区域 */}
      <div className="mt-auto border-t px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User size={16} />
            </div>
            <div className="truncate">
              <p className="text-sm font-medium">{user?.name || '用户'}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || '未登录'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <Button variant="ghost" size="icon" title="设置">
              <Settings size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="注销"
              onClick={handleLogout}
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 