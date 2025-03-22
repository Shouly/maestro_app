'use client';

import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/chat-store';
import { motion } from 'framer-motion';
import {
  ArrowUp,
  Globe,
  PaperclipIcon,
  Hammer,
  Square,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useChatService } from '@/lib/hooks/use-chat-service';
import { useProviderStore } from '@/lib/provider-store';

interface ChatInputProps {
  isCentered?: boolean;
}

export function ChatInput({ isCentered = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { addMessage, updateConversation, chatStatus, abortChat } = useChatStore();
  const { streamMessage } = useChatService();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // 获取已配置的提供商列表
  const { configuredProviders, setDefaultProvider, setDefaultModel } = useProviderStore();
  
  // 判断是否在加载状态
  const isLoading = chatStatus === 'loading' || chatStatus === 'streaming';

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

  // 处理停止生成
  const handleStopGeneration = () => {
    abortChat();
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // 添加用户消息
    addMessage({
      role: 'user',
      content: message.trim(),
      timestamp: Date.now(),
    });

    // 获取当前对话历史
    const activeConversation = useChatStore.getState().getActiveConversation();
    if (!activeConversation) return;

    // 清空输入框
    setMessage('');
    
    try {
      // 检查是否在欢迎页面且当前没有设置默认提供商
      const defaultProviderId = useProviderStore.getState().defaultProviderId;
      const isFirstMessage = activeConversation.messages.length <= 1; // 只有当前这条用户消息
      const isWelcomePage = isCentered; // 使用isCentered参数判断是否是欢迎页面
      
      // 如果是欢迎页面的第一条消息，且没有默认提供商，则自动选择一个已配置的活跃提供商
      if (isWelcomePage && isFirstMessage && !defaultProviderId) {
        // 查找第一个已配置且活跃的提供商
        const firstActiveProvider = configuredProviders.find(provider => provider.isActive);
        
        if (firstActiveProvider) {
          // 设置默认提供商
          setDefaultProvider(firstActiveProvider.providerId);
          
          // 获取该提供商的第一个模型作为默认模型
          const provider = useProviderStore.getState().getPredefinedProvider(firstActiveProvider.providerId);
          if (provider && provider.models.length > 0) {
            setDefaultModel(provider.models[0].id);
          }
          
          // 更新当前会话使用这个提供商
          updateConversation(activeConversation.id, {
            providerId: firstActiveProvider.providerId,
            modelId: provider?.models[0]?.id // 使用该提供商的第一个模型
          });
          
          console.log('已自动选择提供商:', firstActiveProvider.providerId);
        } else {
          // 没有找到已配置的活跃提供商，添加友好的错误提示
          addMessage({
            role: 'assistant',
            content: '系统提示：您需要先配置并启用至少一个AI服务提供商才能使用对话功能。请点击左侧边栏底部的设置图标，然后在"服务提供商"选项卡中添加您的API密钥。',
            timestamp: Date.now(),
          });
          return; // 直接返回，不继续执行后续的AI响应请求
        }
      }

      // 流式生成响应，回调逻辑已在use-chat-service.ts中处理
      await streamMessage(
        activeConversation.messages,
        {
          onContent: (content) => {
            // 内容更新由store处理，这里仅添加特殊逻辑（如果需要）
          },
          onError: (error) => {
            console.error('获取AI响应时出错:', error);
          },
        },
        {
          modelId: activeConversation.modelId,
          systemPrompt: activeConversation.systemPrompt,
          temperature: activeConversation.temperature,
          maxTokens: activeConversation.maxTokens,
          maxTurns: activeConversation.maxTurns
        }
      );
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  // 处理按键事件：Ctrl+Enter或Cmd+Enter发送消息
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 按Shift+Enter添加换行
    if (e.key === 'Enter' && e.shiftKey) {
      return; // 默认行为是添加换行
    }
    
    // 按Enter直接发送消息
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      return;
    }
    
    // 保留原有的Ctrl+Enter或Cmd+Enter发送逻辑作为备选
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
        <div 
          className={`w-full bg-[hsl(var(--input-background))] border border-border/80 rounded-lg transition-all duration-300 
          ${message ? 'shadow-sm border-primary/30' : ''} 
          hover:border-primary/30 hover:shadow-sm focus-within:border-primary/50 focus-within:shadow-md`}
        >
          <div className="relative">
            {/* 输入区域 */}
            <div className="px-0 pt-4 pb-12 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="有什么可以帮助您的？（Enter 发送，Shift+Enter 换行）"
                className="w-full resize-none min-h-[56px] max-h-[220px] bg-transparent border-0 focus:outline-none focus:ring-0 p-0 pr-6 pl-7 text-lg font-light text-foreground/90 placeholder:text-foreground/40"
                disabled={isLoading}
              />

              {/* 发送/停止按钮 */}
              <div className="absolute bottom-3 right-4">
                {isLoading ? (
                  <Button
                    variant="destructive"
                    onClick={handleStopGeneration}
                    className="rounded-sm h-9 w-9 p-0"
                    title="停止生成"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant={message.trim() ? "default" : "ghost"}
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={`rounded-sm h-9 w-9 p-0 ${!message.trim() ? 'opacity-60' : ''} bg-primary hover:bg-primary/90`}
                    title="发送消息"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                )}
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
            placeholder="输入消息...（Enter 发送，Shift+Enter 换行）"
            className="w-full resize-none min-h-[32px] max-h-[150px] bg-transparent border-0 focus:outline-none focus:ring-0 p-0 pr-5 pl-5 text-base font-light text-foreground/90 placeholder:text-foreground/40"
            disabled={isLoading}
          />

          {/* 发送/停止按钮 */}
          <div className="absolute bottom-1 right-2">
            {isLoading ? (
              <Button
                variant="destructive"
                onClick={handleStopGeneration}
                className="rounded-sm h-7 w-7 p-0"
                title="停止生成"
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                variant={message.trim() ? "default" : "ghost"}
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`rounded-sm h-7 w-7 p-0 ${!message.trim() ? 'opacity-60' : ''} bg-primary hover:bg-primary/90`}
                title="发送消息"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* 左侧功能图标 */}
          <div className="absolute bottom-1 left-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-sm hover:bg-primary/10 text-foreground/60 hover:text-primary"
              title="附件"
            >
              <PaperclipIcon className="h-[14px] w-[14px]" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-sm hover:bg-primary/10 text-foreground/60 hover:text-primary"
              title="联网"
            >
              <Globe className="h-[14px] w-[14px]" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-sm hover:bg-primary/10 text-foreground/60 hover:text-primary"
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