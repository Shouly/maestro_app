'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useChatStore } from '@/lib/chat-store';
import { 
  Trash2, 
  LogOut, 
  User, 
  Settings, 
  ChevronUp, 
  Languages, 
  LifeBuoy, 
  Cloud,
  Sparkles,
  MessageSquare
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
import { useAppStore } from '@/lib/store';

export function ChatSidebar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { setSidebarOpen } = useAppStore();
  
  const { 
    conversations, 
    activeConversationId, 
    createConversation, 
    setActiveConversation,
    deleteConversation 
  } = useChatStore();

  // 当下拉菜单状态变化时，通知侧边栏组件
  useEffect(() => {
    // 发送自定义事件通知侧边栏组件，防止其关闭
    const notifySidebar = () => {
      window.dispatchEvent(
        new CustomEvent('sidebar-control', {
          detail: { preventClose: dropdownOpen }
        })
      );
    };

    notifySidebar();
    
    return () => {
      // 组件卸载时，确保不再阻止侧边栏关闭
      window.dispatchEvent(
        new CustomEvent('sidebar-control', {
          detail: { preventClose: false }
        })
      );
    };
  }, [dropdownOpen]);

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

  // 处理下拉菜单状态变化
  const handleDropdownOpenChange = (open: boolean) => {
    setDropdownOpen(open);
    
    // 确保下拉菜单打开时侧边栏保持打开状态
    if (open) {
      setSidebarOpen(true);
    }
  };

  return (
    <div className="flex h-full flex-col py-3">
      {/* 顶部按钮 */}
      <div className="px-4 py-2">
        <Button 
          onClick={handleNewChat} 
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 shadow-canva-button transition-all duration-200 hover:shadow-md hover:translate-y-[-1px]"
          size="sm"
          variant="canva"
        >
          <Sparkles size={14} className="animate-pulse" />
          新对话
        </Button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <h2 className="mb-3 px-1 text-xs font-semibold text-gradient tracking-wide uppercase">
          对话历史
        </h2>
        <div className="space-y-1.5">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground pt-8 pb-4">
              <MessageSquare className="h-10 w-10 mb-3 text-muted opacity-50" />
              <p>暂无对话记录</p>
              <p className="text-xs mt-1 max-w-[200px]">点击上方"新对话"按钮开始聊天</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative flex items-center w-full rounded-xl transition-all duration-150 animate-scale ${
                  activeConversationId === conversation.id
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'hover:bg-accent/50 hover:shadow-sm'
                }`}
              >
                <button
                  onClick={() => handleSelectConversation(conversation.id)}
                  className="truncate px-3 py-2.5 text-left text-sm w-full"
                >
                  <span className="truncate block">{conversation.title}</span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 mr-0.5 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full"
                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                  title="删除对话"
                >
                  <Trash2 size={14} className="text-muted-foreground hover:text-destructive transition-colors" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 底部用户信息区域 */}
      <div className="mt-auto px-4 py-3">
        <div className="divider-subtle mx-1"></div>
        <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 hover:bg-accent/50 transition-all duration-150 hover:shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <User size={18} />
              </div>
              <div className="flex-1 truncate text-left">
                <p className="text-sm font-medium font-display">{user?.name || '用户'}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email || '未登录'}
                </p>
              </div>
              <ChevronUp 
                size={14} 
                className={`text-muted-foreground transition-transform duration-300 ${
                  dropdownOpen ? 'rotate-180' : 'rotate-0'
                }`} 
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-56 rounded-xl shadow-canva-card p-1 animate-fade-in"
            // 确保下拉菜单显示时不关闭侧边栏
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <DropdownMenuLabel className="font-display">我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSettings} className="rounded-lg cursor-pointer gap-2 py-1.5">
              <Settings size={16} className="text-primary" />
              <span>设置</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer gap-2 py-1.5">
              <Languages size={16} className="text-primary" />
              <span>语言</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer gap-2 py-1.5">
              <ThemeToggle />
              <span>主题</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer gap-2 py-1.5">
              <Cloud size={16} className="text-primary" />
              <span>同步设置</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg cursor-pointer gap-2 py-1.5">
              <LifeBuoy size={16} className="text-primary" />
              <span>帮助与支持</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="rounded-lg cursor-pointer gap-2 text-destructive focus:text-destructive py-1.5"
            >
              <LogOut size={16} />
              <span>注销</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 