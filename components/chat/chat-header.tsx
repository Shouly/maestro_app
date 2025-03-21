'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { ChevronDown, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function ChatHeader() {
  const { activeConversationId, getActiveConversation, updateConversationTitle, deleteConversation } = useChatStore();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
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

  // 打开重命名对话框
  const openRenameDialog = () => {
    setIsRenameDialogOpen(true);
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
    setIsRenameDialogOpen(false);
  };

  // 取消编辑
  const cancelRenaming = () => {
    if (activeConversation) {
      setTitle(activeConversation.title);
    }
    setIsRenameDialogOpen(false);
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelRenaming();
    }
  };

  // 删除当前对话
  const handleDeleteConversation = () => {
    if (activeConversationId) {
      deleteConversation(activeConversationId);
    }
  };

  // 如果没有活跃对话，显示空状态
  if (!activeConversation) {
    return <span className="text-sm text-muted-foreground">无对话</span>;
  }

  return (
    <div className="flex items-center">
      <div className="flex items-center gap-1.5">
        <span className="text-base font-light truncate max-w-[200px] md:max-w-[300px]">
          {activeConversation.title}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full focus:ring-0">
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem onClick={openRenameDialog} className="gap-2 cursor-pointer">
              <Edit size={14} className="text-primary" />
              <span>重命名</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeleteConversation} 
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 size={14} />
              <span>删除对话</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 重命名对话框 */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重命名对话</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入对话名称"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={cancelRenaming}>
                取消
              </Button>
            </DialogClose>
            <Button type="button" onClick={saveTitle}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 