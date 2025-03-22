/**
 * 聊天服务钩子
 * 用于获取并使用合适的聊天服务
 */

import { useState, useCallback, useEffect } from 'react';
import { useChatStore, Message, ChatStatus } from '@/lib/chat-store';
import { useProviderStore } from '@/lib/provider-store';
import { ChatServiceFactory } from '@/lib/services/chat/chat-service-factory';
import { ChatRequestOptions, ChatResponse, ChatStreamCallbacks } from '@/lib/services/chat/chat-service';

/**
 * 聊天服务钩子
 * 提供与当前选定聊天服务交互的方法
 */
export function useChatService() {
  // 错误状态 - 保留本地错误状态用于内部处理
  const [error, setError] = useState<Error | null>(null);
  
  // 获取服务工厂实例
  const chatServiceFactory = ChatServiceFactory.getInstance();
  
  // 获取聊天状态管理方法
  const { 
    setChatStatus, 
    setStreamingMessageId, 
    setLastError,
    chatStatus
  } = useChatStore();
  
  // 获取当前会话的供应商和模型
  const activeConversation = useChatStore(state => state.getActiveConversation());
  const defaultProviderId = useProviderStore(state => state.defaultProviderId);
  const defaultModelId = useProviderStore(state => state.defaultModelId);
  const { updateConversation } = useChatStore();
  
  // 获取当前活动会话的所用供应商ID
  const providerId = activeConversation?.providerId || defaultProviderId;
  
  // 自动更新对话的供应商和模型设置
  useEffect(() => {
    // 如果有活跃对话，且对话没有设置供应商ID，但有默认供应商和模型，则自动更新对话设置
    if (activeConversation && !activeConversation.providerId && defaultProviderId && defaultModelId) {
      updateConversation(activeConversation.id, {
        providerId: defaultProviderId,
        modelId: defaultModelId
      });
      console.log('已自动更新对话供应商设置:', defaultProviderId, defaultModelId);
    }
  }, [activeConversation, defaultProviderId, defaultModelId, updateConversation]);
  
  // 获取当前供应商配置
  const providerConfig = useProviderStore(state => 
    providerId ? state.getProviderConfig(providerId) : undefined
  );
  
  // 在函数内部获取最新对话设置，以确保数据始终是最新的
  const getConversationOptions = (): ChatRequestOptions => {
    const conversation = useChatStore.getState().getActiveConversation();
    if (!conversation) return {};
    
    return {
      modelId: conversation.modelId,
      systemPrompt: conversation.systemPrompt,
      temperature: conversation.temperature,
      maxTokens: conversation.maxTokens,
      maxTurns: conversation.maxTurns
    };
  };
  
  /**
   * 更新状态
   */
  const updateStatus = (status: ChatStatus, errorMessage?: string) => {
    setChatStatus(status);
    
    if (errorMessage) {
      setLastError(errorMessage);
      setError(new Error(errorMessage));
    } else if (status !== 'error') {
      setLastError(null);
      setError(null);
    }
  };
  
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
      const errMsg = '未配置供应商或API密钥';
      updateStatus('error', errMsg);
      throw new Error(errMsg);
    }
    
    // 获取聊天服务
    const chatService = chatServiceFactory.getChatService(providerId);
    if (!chatService) {
      const errMsg = `不支持的供应商: ${providerId}`;
      updateStatus('error', errMsg);
      throw new Error(errMsg);
    }
    
    // 设置状态
    updateStatus('loading');
    
    try {
      // 合并对话设置和传入的选项
      const conversationOptions = getConversationOptions();
      const mergedOptions = { ...conversationOptions, ...options };
      
      // 调用服务发送消息
      const response = await chatService.sendMessage(messages, mergedOptions);
      updateStatus('success');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      updateStatus('error', errorMessage);
      throw err instanceof Error ? err : new Error(String(err));
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
      const errMsg = '未配置供应商或API密钥';
      updateStatus('error', errMsg);
      throw new Error(errMsg);
    }
    
    // 获取聊天服务
    const chatService = chatServiceFactory.getChatService(providerId);
    if (!chatService) {
      const errMsg = `不支持的供应商: ${providerId}`;
      updateStatus('error', errMsg);
      throw new Error(errMsg);
    }
    
    // 设置加载状态，这会触发思考状态显示
    updateStatus('loading');
    
    // 创建AbortController用于中断请求
    const abortController = new AbortController();
    useChatStore.getState().setAbortController(abortController);
    
    // 保存流式消息内容的变量
    let currentResponse = '';
    
    // 创建包装回调，添加状态管理
    const wrappedCallbacks: ChatStreamCallbacks = {
      onStart: () => {
        // 设置状态为streaming，但不立即创建消息
        updateStatus('streaming');
        
        // 重置当前响应
        currentResponse = '';
        
        callbacks.onStart?.();
      },
      onContent: (content) => {
        // 如果已经中止，则不处理新内容
        if (abortController.signal.aborted) return;
        
        // 累积响应内容
        currentResponse += content;
        
        // 获取当前流式消息ID
        let messageId = useChatStore.getState().streamingMessageId;
        
        // 如果还没有创建消息，现在创建
        if (!messageId && currentResponse.trim() !== '') {
          // 创建一个助手消息，包含已收到的内容
          const newAssistantMessage = {
            role: 'assistant' as const,
            content: currentResponse,
            timestamp: Date.now(),
          };
          
          // 添加消息并获取生成的ID
          messageId = useChatStore.getState().addMessage(newAssistantMessage);
          
          // 保存流式消息ID
          setStreamingMessageId(messageId);
          
          // 第一次收到内容后不需要更新消息，因为刚刚创建了
          callbacks.onContent?.(content);
          return;
        }
        
        // 如果没有消息ID则返回
        if (!messageId) return;
        
        // 获取最新对话
        const conversation = useChatStore.getState().getActiveConversation();
        if (!conversation) return;
        
        // 查找消息索引
        const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) return;
        
        // 更新消息内容
        const updatedMessages = [...conversation.messages];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: currentResponse,
          timestamp: Date.now()
        };
        
        // 更新对话
        useChatStore.getState().updateConversation(
          conversation.id,
          { messages: updatedMessages }
        );
        
        // 调用原始回调
        callbacks.onContent?.(content);
      },
      onToolCall: (toolCall) => {
        // 如果已经中止，则不处理工具调用
        if (abortController.signal.aborted) return;
        
        callbacks.onToolCall?.(toolCall);
      },
      onFinish: () => {
        updateStatus('success');
        setStreamingMessageId(null);
        useChatStore.getState().setAbortController(null);
        
        callbacks.onFinish?.();
      },
      onError: (err) => {
        const errorMessage = err.message || String(err);
        
        // 添加错误信息到当前消息
        const messageId = useChatStore.getState().streamingMessageId;
        if (messageId) {
          const conversation = useChatStore.getState().getActiveConversation();
          if (conversation) {
            const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId);
            if (messageIndex !== -1) {
              const updatedMessages = [...conversation.messages];
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                content: currentResponse + '\n\n[错误: ' + errorMessage + ']',
                timestamp: Date.now()
              };
              
              useChatStore.getState().updateConversation(
                conversation.id,
                { messages: updatedMessages }
              );
            }
          }
        }
        
        updateStatus('error', errorMessage);
        useChatStore.getState().setAbortController(null);
        
        callbacks.onError?.(err);
      }
    };
    
    try {
      // 合并对话设置和传入的选项
      const conversationOptions = getConversationOptions();
      const mergedOptions = { 
        ...conversationOptions, 
        ...options,
        signal: abortController.signal // 传递中止信号
      };
      
      // 调用服务流式发送消息
      await chatService.streamMessage(messages, wrappedCallbacks, mergedOptions);
    } catch (err) {
      // 如果是中止错误，不需要设置为错误状态
      if (err instanceof Error && err.name === 'AbortError') {
        updateStatus('idle');
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      updateStatus('error', errorMessage);
      throw err instanceof Error ? err : new Error(String(err));
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
    status: chatStatus,
    error,
    sendMessage,
    streamMessage,
    testConnection,
    currentProviderId: providerId,
  };
} 