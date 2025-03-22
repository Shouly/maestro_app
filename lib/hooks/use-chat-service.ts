/**
 * 聊天服务钩子
 * 用于获取并使用合适的聊天服务
 */

import { useState, useCallback } from 'react';
import { useChatStore, Message } from '@/lib/chat-store';
import { useProviderStore } from '@/lib/provider-store';
import { ChatServiceFactory } from '@/lib/services/chat/chat-service-factory';
import { ChatRequestOptions, ChatResponse, ChatStreamCallbacks } from '@/lib/services/chat/chat-service';

// 聊天响应状态
export type ChatResponseStatus = 'idle' | 'loading' | 'streaming' | 'success' | 'error';

/**
 * 聊天服务钩子
 * 提供与当前选定聊天服务交互的方法
 */
export function useChatService() {
  // 聊天状态
  const [status, setStatus] = useState<ChatResponseStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  
  // 获取服务工厂实例
  const chatServiceFactory = ChatServiceFactory.getInstance();
  
  // 获取当前会话的供应商和模型
  const activeConversation = useChatStore(state => state.getActiveConversation());
  const defaultProviderId = useProviderStore(state => state.defaultProviderId);
  
  // 获取当前活动会话的所用供应商ID
  const providerId = activeConversation?.providerId || defaultProviderId;
  
  // 获取当前供应商配置
  const providerConfig = useProviderStore(state => 
    providerId ? state.getProviderConfig(providerId) : undefined
  );
  
  /**
   * 发送消息
   * @param messages 消息历史
   * @param options 请求选项
   */
  const sendMessage = useCallback(async (
    messages: Message[],
    options?: ChatRequestOptions
  ): Promise<ChatResponse> => {
    // 如果没有提供商ID或其未配置，则抛出错误
    if (!providerId || !providerConfig) {
      throw new Error('未配置供应商或API密钥');
    }
    
    // 获取聊天服务
    const chatService = chatServiceFactory.getChatService(providerId);
    if (!chatService) {
      throw new Error(`不支持的供应商: ${providerId}`);
    }
    
    // 设置状态
    setStatus('loading');
    setError(null);
    
    try {
      // 调用服务发送消息
      const response = await chatService.sendMessage(messages, options);
      setStatus('success');
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [providerId, providerConfig, chatServiceFactory]);
  
  /**
   * 流式发送消息
   * @param messages 消息历史
   * @param callbacks 流回调
   * @param options 请求选项
   */
  const streamMessage = useCallback(async (
    messages: Message[],
    callbacks: ChatStreamCallbacks,
    options?: ChatRequestOptions
  ): Promise<void> => {
    // 如果没有提供商ID或其未配置，则抛出错误
    if (!providerId || !providerConfig) {
      throw new Error('未配置供应商或API密钥');
    }
    
    // 获取聊天服务
    const chatService = chatServiceFactory.getChatService(providerId);
    if (!chatService) {
      throw new Error(`不支持的供应商: ${providerId}`);
    }
    
    // 设置状态
    setStatus('streaming');
    setError(null);
    
    // 创建包装回调，添加状态管理
    const wrappedCallbacks: ChatStreamCallbacks = {
      onStart: () => {
        setStatus('streaming');
        callbacks.onStart?.();
      },
      onContent: (content) => {
        callbacks.onContent?.(content);
      },
      onToolCall: (toolCall) => {
        callbacks.onToolCall?.(toolCall);
      },
      onFinish: () => {
        setStatus('success');
        callbacks.onFinish?.();
      },
      onError: (err) => {
        setError(err);
        setStatus('error');
        callbacks.onError?.(err);
      }
    };
    
    try {
      // 调用服务流式发送消息
      await chatService.streamMessage(messages, wrappedCallbacks, options);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [providerId, providerConfig, chatServiceFactory]);
  
  /**
   * 测试供应商连接
   * @param apiKey API密钥
   * @param baseUrl 可选的API基础URL
   */
  const testConnection = useCallback(async (
    providerId: string,
    apiKey: string,
    baseUrl?: string
  ): Promise<boolean> => {
    // 获取聊天服务
    const chatService = chatServiceFactory.getChatService(providerId);
    if (!chatService) {
      return false;
    }
    
    try {
      return await chatService.testConnection(apiKey, baseUrl);
    } catch (err) {
      console.error('测试连接失败:', err);
      return false;
    }
  }, [chatServiceFactory]);
  
  return {
    status,
    error,
    sendMessage,
    streamMessage,
    testConnection,
    currentProviderId: providerId,
  };
} 