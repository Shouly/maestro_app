/**
 * 聊天服务
 * 处理AI对话的核心功能
 */

import { simulateResponse } from '../models/model-service';
import { Message } from '@/lib/chat-store';

// 消息角色类型
export type MessageRole = 'user' | 'assistant' | 'system';

// 聊天消息接口
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/**
 * 工具调用定义
 */
export interface Tool {
  type: string;
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

/**
 * 工具调用结果
 */
export interface ToolCallResult {
  toolCallId: string;
  result: string;
}

/**
 * 工具调用请求
 */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * 消息流回调函数
 */
export interface ChatStreamCallbacks {
  onStart?: () => void;
  onContent?: (content: string) => void;
  onToolCall?: (toolCall: ToolCall) => void;
  onFinish?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 聊天请求选项
 */
export interface ChatRequestOptions {
  systemPrompt?: string;
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: Tool[];
  toolResults?: ToolCallResult[];
}

/**
 * 聊天响应
 */
export interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
  modelId?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * 聊天服务接口
 */
export interface IChatService {
  /**
   * 获取供应商ID
   */
  getProviderId(): string;
  
  /**
   * 发送消息并获取完整响应
   * @param messages 对话历史
   * @param options 请求选项
   */
  sendMessage(
    messages: Message[], 
    options?: ChatRequestOptions
  ): Promise<ChatResponse>;
  
  /**
   * 发送消息并通过流式返回响应
   * @param messages 对话历史
   * @param callbacks 流回调函数
   * @param options 请求选项
   */
  streamMessage(
    messages: Message[], 
    callbacks: ChatStreamCallbacks,
    options?: ChatRequestOptions
  ): Promise<void>;
  
  /**
   * 测试连接
   * @param apiKey API密钥
   * @param baseUrl 可选的基础URL
   */
  testConnection(apiKey: string, baseUrl?: string): Promise<boolean>;
}

/**
 * 基础聊天服务实现
 * 提供默认的模拟实现，各供应商的具体服务将继承此类并重写相关方法
 */
export abstract class BaseChatService implements IChatService {
  /**
   * 获取供应商ID
   * 子类必须实现此方法
   */
  abstract getProviderId(): string;

  /**
   * 发送消息并获取完整响应
   * @param messages 对话历史
   * @param options 请求选项
   */
  async sendMessage(
    messages: Message[], 
    options?: ChatRequestOptions
  ): Promise<ChatResponse> {
    // 获取最后一条用户消息
    const lastUserMessage = messages
      .filter(msg => msg.role === 'user')
      .pop()?.content || '';
    
    // 默认使用模拟响应
    const content = await simulateResponse(lastUserMessage);
    
    return {
      content,
      modelId: options?.modelId || 'default',
    };
  }
  
  /**
   * 发送消息并通过流式返回响应
   * @param messages 对话历史
   * @param callbacks 流回调函数
   * @param options 请求选项
   */
  async streamMessage(
    messages: Message[], 
    callbacks: ChatStreamCallbacks,
    options?: ChatRequestOptions
  ): Promise<void> {
    try {
      // 通知开始流式响应
      callbacks.onStart?.();
      
      // 获取最后一条用户消息
      const lastUserMessage = messages
        .filter(msg => msg.role === 'user')
        .pop()?.content || '';
      
      // 生成模拟响应
      const responses = [
        `您好！我是AI助手，很高兴能帮助您解答问题。关于"${lastUserMessage.substring(0, 20)}${lastUserMessage.length > 20 ? '...' : ''}"，我的回答是：这是一个AI生成的回复，在实际应用中，这里会连接到后端服务获取真实的AI回答。`,
        `感谢您的问题。我理解您想了解关于"${lastUserMessage.substring(0, 20)}${lastUserMessage.length > 20 ? '...' : ''}"的信息。这是一个模拟回复，在完整实现中将通过API获取大语言模型的回答。`,
        `您提到的"${lastUserMessage.substring(0, 20)}${lastUserMessage.length > 20 ? '...' : ''}"是一个很有趣的话题。这只是一个模拟响应，实际应用中会连接到AI服务获取更专业的回答。`,
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      let sentChars = 0;
      
      // 模拟每隔100ms发送一小段文字
      const sendChunk = () => {
        if (sentChars >= randomResponse.length) {
          // 完成流式响应
          callbacks.onFinish?.();
          return;
        }
        
        // 每次发送1-5个字符
        const chunkSize = Math.min(
          Math.floor(Math.random() * 5) + 1,
          randomResponse.length - sentChars
        );
        const chunk = randomResponse.substring(sentChars, sentChars + chunkSize);
        callbacks.onContent?.(chunk);
        sentChars += chunkSize;
        
        // 继续发送下一个片段
        setTimeout(sendChunk, 100);
      };
      
      // 开始发送
      sendChunk();
    } catch (error) {
      callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * 测试连接
   * @param apiKey API密钥
   * @param baseUrl 可选的基础URL
   */
  async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    // 基础实现总是返回成功
    // 具体供应商应重写此方法进行实际连接测试
    return Promise.resolve(true);
  }
  
  /**
   * 将应用消息格式转换为API所需的消息格式
   * 子类可以重写此方法来适配不同供应商的API格式
   */
  protected convertMessagesToApiFormat(
    messages: Message[], 
    systemPrompt?: string
  ): ChatMessage[] {
    const result: ChatMessage[] = [];
    
    // 添加系统提示(如果有)
    if (systemPrompt) {
      result.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    // 添加对话历史
    messages.forEach(msg => {
      result.push({
        role: msg.role as MessageRole,
        content: msg.content
      });
    });
    
    return result;
  }
} 