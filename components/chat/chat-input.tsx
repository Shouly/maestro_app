'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { 
  XCircle, 
  Loader2, 
  Sparkles, 
  PaperclipIcon, 
  Globe, 
  Wrench,
  ArrowUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
        200
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
        <div className="relative w-full">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="有什么可以帮助您的？（Ctrl+Enter 发送）"
            className="h-16 max-h-[200px] min-h-[64px] w-full resize-none rounded-xl border-2 border-input bg-[hsl(var(--input-background))] px-5 py-4 text-base shadow-md transition-all duration-200 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring hover:border-primary/50"
            disabled={isLoading}
          />
          {message && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-16 top-1/2 -translate-y-1/2 rounded-full opacity-70 hover:opacity-100 transition-opacity"
              onClick={() => setMessage('')}
              title="清空"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          )}
          
          <Button
            variant="default"
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-10 px-4 transition-all duration-300"
            title="发送消息"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            {isLoading ? '思考中...' : '发送'}
          </Button>
        </div>
      </motion.div>
    );
  }

  // 默认底部输入框 - Claude风格
  return (
    <div className={`w-full bg-[hsl(var(--input-background))] border-t border-border border-x rounded-t-xl transition-all duration-200 ${message ? 'shadow-md' : 'hover:shadow-sm'}`}>
      <div className="relative">
        {/* 输入区域 */}
        <div className="px-0 pt-2 pb-10 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="w-full resize-none min-h-[40px] max-h-[180px] bg-transparent border-0 focus:outline-none focus:ring-0 p-0 pr-5 pl-5 text-base font-light text-foreground/90 placeholder:text-foreground/40"
            disabled={isLoading}
          />
          
          {/* 发送按钮 */}
          <div className="absolute bottom-2 right-2">
            <Button
              variant={message.trim() ? "default" : "ghost"}
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className={`rounded-sm h-8 w-8 p-0 ${!message.trim() ? 'opacity-60' : ''} bg-primary hover:bg-primary/90`}
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
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-sm hover:bg-primary/10 text-foreground/60 hover:text-primary"
              title="附件"
            >
              <PaperclipIcon className="h-[16px] w-[16px]" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-sm hover:bg-primary/10 text-foreground/60 hover:text-primary"
              title="联网"
            >
              <Globe className="h-[16px] w-[16px]" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-sm hover:bg-primary/10 text-foreground/60 hover:text-primary"
              title="工具"
            >
              <Wrench className="h-[16px] w-[16px]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 