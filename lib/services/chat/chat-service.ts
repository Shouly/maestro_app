/**
 * 聊天服务
 * 处理AI对话的核心功能
 */

import { simulateResponse } from '../models/model-service';

// 消息角色类型
export type MessageRole = 'user' | 'assistant' | 'system';

// 聊天消息接口
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

// 聊天服务接口
export interface IChatService {
  /**
   * 发送消息到AI模型并获取回复
   * @param messages 消息历史
   * @param providerId 供应商ID
   * @param modelId 模型ID
   * @param apiKey API密钥
   * @param baseUrl 可选的自定义基础URL
   * @returns AI回复内容
   */
  sendMessage(
    messages: ChatMessage[],
    providerId: string,
    modelId: string,
    apiKey: string,
    baseUrl?: string
  ): Promise<string>;
  
  /**
   * 流式发送消息到AI模型并获取回复
   * @param messages 消息历史
   * @param providerId 供应商ID
   * @param modelId 模型ID
   * @param apiKey API密钥
   * @param onChunk 处理每个回复片段的回调函数
   * @param baseUrl 可选的自定义基础URL
   * @returns 完整的AI回复内容
   */
  streamMessage(
    messages: ChatMessage[],
    providerId: string,
    modelId: string,
    apiKey: string,
    onChunk: (text: string) => void,
    baseUrl?: string
  ): Promise<string>;
}

/**
 * 默认聊天服务实现
 * 目前使用模拟响应，将来可扩展为基于实际AI服务的实现
 */
export class ChatService implements IChatService {
  /**
   * 发送消息到AI模型并获取回复（非流式）
   * 现在是使用模拟响应，将来会根据不同供应商实现真实API调用
   */
  async sendMessage(
    messages: ChatMessage[],
    providerId: string,
    modelId: string,
    apiKey: string,
    baseUrl?: string
  ): Promise<string> {
    // 获取最后一条用户消息
    const lastUserMessage = messages
      .filter(msg => msg.role === 'user')
      .pop()?.content || '';
    
    // 目前使用模拟响应，后续可改为实际API调用
    return await simulateResponse(lastUserMessage);
  }
  
  /**
   * 流式发送消息到AI模型并获取回复
   * 目前是简单模拟，将来会实现真实的流式API调用
   */
  async streamMessage(
    messages: ChatMessage[],
    providerId: string,
    modelId: string,
    apiKey: string,
    onChunk: (text: string) => void,
    baseUrl?: string
  ): Promise<string> {
    // 获取最后一条用户消息
    const lastUserMessage = messages
      .filter(msg => msg.role === 'user')
      .pop()?.content || '';
    
    // 模拟流式响应
    return new Promise((resolve) => {
      const responses = [
        `您好！我是AI助手，很高兴能帮助您解答问题。关于"${lastUserMessage.substring(0, 20)}${lastUserMessage.length > 20 ? '...' : ''}"，我的回答是：这是一个AI生成的回复，在实际应用中，这里会连接到后端服务获取真实的AI回答。`,
        `感谢您的问题。我理解您想了解关于"${lastUserMessage.substring(0, 20)}${lastUserMessage.length > 20 ? '...' : ''}"的信息。这是一个模拟回复，在完整实现中将通过API获取大语言模型的回答。`,
        `您提到的"${lastUserMessage.substring(0, 20)}${lastUserMessage.length > 20 ? '...' : ''}"是一个很有趣的话题。这只是一个模拟响应，实际应用中会连接到AI服务获取更专业的回答。`,
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      let sentChars = 0;
      
      // 模拟每隔100ms发送一小段文字
      const timer = setInterval(() => {
        if (sentChars >= randomResponse.length) {
          clearInterval(timer);
          resolve(randomResponse);
          return;
        }
        
        // 每次发送1-5个字符
        const chunkSize = Math.min(
          Math.floor(Math.random() * 5) + 1,
          randomResponse.length - sentChars
        );
        const chunk = randomResponse.substring(sentChars, sentChars + chunkSize);
        onChunk(chunk);
        sentChars += chunkSize;
      }, 100);
    });
  }
} 