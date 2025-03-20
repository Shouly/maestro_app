'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { Send, XCircle, Loader2, Mic, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export function ChatInput() {
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

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <Button variant="outline" size="icon" title="附加文件">
          <Plus className="h-4 w-4" />
        </Button>
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息，Ctrl+Enter 发送"
            className="h-10 max-h-[200px] min-h-[40px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isLoading}
          />
          {message && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-10 top-1/2 -translate-y-1/2"
              onClick={() => setMessage('')}
              title="清空"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          disabled={isLoading}
          title="语音输入"
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading}
          title="发送消息"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="mt-2 text-center text-xs text-muted-foreground">
        AI助手可能会产生不准确的信息。
      </div>
    </div>
  );
} 