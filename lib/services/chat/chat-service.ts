/**
 * 聊天服务
 * 处理AI对话的核心功能
 */

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
  maxTurns?: number;
  tools?: Tool[];
  toolResults?: ToolCallResult[];
  signal?: AbortSignal;
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
    cacheCreationTokens?: number; // 缓存创建token数
    cacheReadTokens?: number;     // 缓存读取token数
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
}

/**
 * 基础聊天服务抽象类
 * 提供了聊天服务的基本框架
 */
export abstract class BaseChatService implements IChatService {
  /**
   * 获取供应商ID
   */
  abstract getProviderId(): string;

  /**
   * 发送消息并获取完整响应
   * @param messages 对话历史
   * @param options 请求选项
   */
  abstract sendMessage(
    messages: Message[],
    options?: ChatRequestOptions
  ): Promise<ChatResponse>;

  /**
   * 发送消息并通过流式返回响应
   * @param messages 对话历史
   * @param callbacks 流回调函数
   * @param options 请求选项
   */
  abstract streamMessage(
    messages: Message[],
    callbacks: ChatStreamCallbacks,
    options?: ChatRequestOptions
  ): Promise<void>;

  /**
   * 应用最大轮次限制
   * 将消息按照user-assistant对组织为轮次，并只保留最近的maxTurns轮
   * @param apiMessages 消息数组
   * @param maxTurns 最大轮次数量
   * @param systemMessage 可选的系统消息（不计入轮次）
   * @returns 处理后的消息数组
   */
  protected applyMaxTurnsLimit(
    apiMessages: any[],
    maxTurns: number,
    systemMessage?: any
  ): any[] {
    // 1. 如果没有设置maxTurns，直接返回原始消息
    if (!maxTurns || maxTurns <= 0) {
      console.log('未设置maxTurns或值无效，不应用消息限制');
      return apiMessages;
    }
    console.log('applyMaxTurnsLimit', apiMessages, maxTurns, systemMessage);
    // 找出系统消息和普通消息
    const hasSystemMsg = systemMessage || (apiMessages.length > 0 && apiMessages[0].role === 'system');
    const systemMsg = systemMessage || (hasSystemMsg ? apiMessages[0] : null);
    const regularMessages = systemMessage ? apiMessages : (hasSystemMsg ? apiMessages.slice(1) : apiMessages);
    console.log('regularMessages', regularMessages);
    // 如果消息为空，直接返回
    if (regularMessages.length === 0) {
      return apiMessages;
    }

    // 分离最新的一条消息（通常是尚未回复的用户消息）
    const latestMessage = regularMessages[regularMessages.length - 1];
    const previousMessages = regularMessages.slice(0, regularMessages.length - 1);

    // 2. 如果排除系统消息和最新消息后的消息数量小于maxTurns*2，直接返回原始消息
    if (previousMessages.length <= maxTurns * 2) {
      console.log(`历史消息数量(${previousMessages.length})不超过限制(${maxTurns * 2})，不需要裁剪`);
      console.log('apiMessages', apiMessages);
      return apiMessages;
    }

    // 3. 保留系统消息 + 最近的maxTurns轮完整对话 + 最新消息
    console.log(`应用maxTurns限制：从${previousMessages.length}条历史消息中保留最新的${maxTurns * 2}条`);

    // 从后往前取maxTurns*2条消息
    const keptMessages = previousMessages.slice(-maxTurns * 2);

    // 构建最终的消息数组
    const result: any[] = [];

    // 添加系统消息（如果有）
    if (systemMsg) {
      result.push(systemMsg);
    }

    // 添加保留的历史消息
    result.push(...keptMessages);

    // 添加最新消息
    result.push(latestMessage);

    console.log(`消息数量限制后: ${result.length}条消息将被发送到模型`);
    return result;
  }
} 