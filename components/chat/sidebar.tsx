'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useChatStore } from '@/lib/chat-store';
import { 
  Plus, 
  Trash2, 
  LogOut, 
  User, 
  Settings, 
  ChevronUp, 
  Languages, 
  LifeBuoy, 
  Cloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useRouter } from 'next/navigation';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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

  // 打开设置页面
  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <div className="flex h-full flex-col py-2">
      {/* 顶部按钮 */}
      <div className="px-3 py-2">
        <Button 
          onClick={handleNewChat} 
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Plus size={16} />
          新对话
        </Button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-auto px-3 py-2">
        <h2 className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
          对话历史
        </h2>
        <div className="space-y-1">
          {conversations.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground pt-4">
              暂无对话记录
            </p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative flex items-center w-full rounded-md ${
                  activeConversationId === conversation.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <button
                  onClick={() => handleSelectConversation(conversation.id)}
                  className="truncate px-3 py-2 text-left text-sm w-full"
                >
                  <span className="truncate block">{conversation.title}</span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 mr-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                  title="删除对话"
                >
                  <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 底部用户信息区域 */}
      <div className="mt-auto border-t px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 hover:bg-accent/50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User size={16} />
              </div>
              <div className="flex-1 truncate text-left">
                <p className="text-sm font-medium">{user?.name || '用户'}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email || '未登录'}
                </p>
              </div>
              <ChevronUp size={14} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSettings}>
              <Settings size={16} className="mr-2" />
              <span>设置</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Languages size={16} className="mr-2" />
              <span>语言</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ThemeToggle showLabel={true} className="w-full" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Cloud size={16} className="mr-2" />
              <span>同步设置</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy size={16} className="mr-2" />
              <span>帮助与支持</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut size={16} className="mr-2" />
              <span>注销</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 