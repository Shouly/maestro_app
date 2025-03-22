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
   * 测试连接
   * @param apiKey API密钥
   * @param baseUrl 可选的基础URL
   */
  abstract testConnection(apiKey: string, baseUrl?: string): Promise<boolean>;

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
    if (!maxTurns || maxTurns <= 0 || apiMessages.length <= 1) {
      return apiMessages; // 如果没有设置maxTurns或消息太少，直接返回原始消息
    }

    // 分离系统消息和对话消息
    const hasSystemMessage = systemMessage || (apiMessages.length > 0 && apiMessages[0].role === 'system');
    const systemMsg = systemMessage || (hasSystemMessage ? apiMessages[0] : null);
    const dialogMessages = systemMessage ? apiMessages : (hasSystemMessage ? apiMessages.slice(1) : apiMessages);

    // 定义轮次类型，允许user或assistant可选
    interface Turn {
      user?: any;
      assistant?: any;
    }

    // 重新组织消息为轮次
    const turns: Turn[] = [];
    let currentTurn: Turn = {};

    // 遍历所有消息，组织成轮次
    for (let i = 0; i < dialogMessages.length; i++) {
      const msg = dialogMessages[i];

      if (msg.role === 'user') {
        // 如果当前轮次已有user消息，先保存当前轮次，再创建新轮次
        if (currentTurn.user) {
          // 这种情况下可能缺少assistant回复，但我们仍将其视为一个轮次
          turns.push({ ...currentTurn });
          currentTurn = { user: msg };
        } else {
          currentTurn.user = msg;
        }
      } else if (msg.role === 'assistant') {
        if (currentTurn.user) {
          // 当前轮次已有user消息，添加assistant回复，完成一个轮次
          currentTurn.assistant = msg;
          turns.push({ ...currentTurn });
          currentTurn = {};
        } else {
          // 如果没有对应的user消息，将assistant消息单独视为一个不完整轮次
          turns.push({ assistant: msg });
        }
      }
    }

    // 处理最后可能未完成的轮次（只有user消息，没有assistant回复）
    if (currentTurn.user) {
      turns.push({ ...currentTurn });
    }

    console.log(`识别到${turns.length}个对话轮次，maxTurns设置为${maxTurns}`);

    // 如果轮次数超过限制，只保留最近的maxTurns轮
    if (turns.length > maxTurns) {
      const keepTurns = turns.slice(-maxTurns);
      console.log(`应用maxTurns限制: 从${turns.length}轮对话中保留最新的${keepTurns.length}轮`);

      // 将轮次转换回扁平的消息列表
      const limitedMessages: any[] = [];

      // 添加系统消息（如果有）
      if (systemMsg) {
        limitedMessages.push(systemMsg);
      }

      // 添加保留的轮次消息
      keepTurns.forEach(turn => {
        if (turn.user) limitedMessages.push(turn.user);
        if (turn.assistant) limitedMessages.push(turn.assistant);
      });

      console.log(`消息数量限制后: ${limitedMessages.length}条消息将被发送到模型`);
      return limitedMessages;
    }

    // 如果轮次数未超过限制，返回原始消息
    return apiMessages;
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