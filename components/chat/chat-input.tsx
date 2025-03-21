'use client';

import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/chat-store';
import { motion } from 'framer-motion';
import {
  ArrowUp,
  Globe,
  Loader2,
  PaperclipIcon,
  Hammer,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// 模拟AI响应
const simulateResponse = async (userMessage: string): Promise<string> => {
  // 在实际应用中，这里会请求后端API获取AI响应
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        `您好！我是AI助手，很高兴能帮助您解答问题。关于"${userMessage.substring(0, 20)}${userMessage.length > 20 ? '...' : ''}"，我的回答是：这是一个AI生成的回复，在实际应用中，这里会连接到后端服务获取真实的AI回答。`,
        `感谢您的问题。我理解您想了解关于"${userMessage.substring(0, 20)}${userMessage.length > 20 ? '...' : ''}"的信息。这是一个模拟回复，在完整实现中将通过API获取大语言模型的回答。`,
        `您提到的"${userMessage.substring(0, 20)}${userMessage.length > 20 ? '...' : ''}"是一个很有趣的话题。这只是一个模拟响应，实际应用中会连接到AI服务获取更专业的回答。`,
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      resolve(randomResponse);
    }, 1000); // 延迟1秒模拟网络请求
  });
};

interface ChatInputProps {
  isCentered?: boolean;
}

export function ChatInput({ isCentered = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [message]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // 添加用户消息
    addMessage({
      role: 'user',
      content: message.trim(),
      timestamp: Date.now(),
    });

    // 清空输入框
    setMessage('');

    // 显示加载状态
    setIsLoading(true);

    try {
      // 获取AI响应
      const response = await simulateResponse(message.trim());

      // 添加AI响应
      addMessage({
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('获取AI响应时出错:', error);
      // 可以在这里添加错误处理逻辑
    } finally {
      setIsLoading(false);
    }
  };

  // 处理按键事件：Ctrl+Enter或Cmd+Enter发送消息
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 居中版本的输入框样式
  if (isCentered) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className={`w-full bg-[hsl(var(--input-background))] border border-border/80 rounded-lg transition-all duration-300 ${message ? 'shadow-sm border-primary/30' : 'hover:border-border'
          } focus-within:border-primary/50`}>
          <div className="relative">
            {/* 输入区域 */}
            <div className="px-0 pt-4 pb-12 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="有什么可以帮助您的？（Ctrl+Enter 发送）"
                className="w-full resize-none min-h-[56px] max-h-[220px] bg-transparent border-0 focus:outline-none focus:ring-0 p-0 pr-6 pl-7 text-lg font-light text-foreground/90 placeholder:text-foreground/40"
                disabled={isLoading}
              />

              {/* 发送按钮 */}
              <div className="absolute bottom-3 right-4">
                <Button
                  variant={message.trim() ? "default" : "ghost"}
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className={`rounded-sm h-9 w-9 p-0 ${!message.trim() ? 'opacity-60' : ''} bg-primary hover:bg-primary/90`}
                  title="发送消息"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowUp className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {/* 左下角功能图标 */}
              <div className="absolute bottom-3 left-4 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-sm hover:bg-primary/10 text-foreground/60 hover:text-primary"
                  title="附件"
                >
                  <PaperclipIcon className="h-[18px] w-[18px]" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-sm hover:bg-primary/10 text-foreground/60 hover:text-primary"
                  title="联网"
                >
                  <Globe className="h-[18px] w-[18px]" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-sm hover:bg-primary/10 text-foreground/60 hover:text-primary"
                  title="工具"
                >
                  <Hammer className="h-[18px] w-[18px]" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // 默认底部输入框 - Claude风格
  return (
    <div className={`w-full bg-[hsl(var(--input-background))] border-t border-border border-x rounded-t-xl transition-all duration-200 ${message ? 'shadow-md' : 'hover:shadow-sm'}`}>
      <div className="relative">
        {/* 输入区域 */}
        <div className="px-0 pt-2 pb-8 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="w-full resize-none min-h-[32px] max-h-[150px] bg-transparent border-0 focus:outline-none focus:ring-0 p-0 pr-5 pl-5 text-base font-light text-foreground/90 placeholder:text-foreground/40"
            disabled={isLoading}
          />

          {/* 发送按钮 */}
          <div className="absolute bottom-1 right-2">
            <Button
              variant={message.trim() ? "default" : "ghost"}
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className={`rounded-sm h-7 w-7 p-0 ${!message.trim() ? 'opacity-60' : ''} bg-primary hover:bg-primary/90`}
              title="发送消息"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* 左下角功能图标 */}
          <div className="absolute bottom-1 left-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm hover:bg-primary/10 text-foreground/60 hover:text-primary"
              title="附件"
            >
              <PaperclipIcon className="h-[14px] w-[14px]" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm hover:bg-primary/10 text-foreground/60 hover:text-primary"
              title="联网"
            >
              <Globe className="h-[14px] w-[14px]" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm hover:bg-primary/10 text-foreground/60 hover:text-primary"
              title="工具"
            >
              <Hammer className="h-[14px] w-[14px]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 