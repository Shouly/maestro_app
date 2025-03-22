/**
 * 聊天服务工厂
 * 用于创建和管理各种聊天服务实例
 */

import { IChatService } from './chat-service';
import { AnthropicChatService } from './anthropic-chat-service';
import { OpenRouterChatService } from './openrouter-chat-service';

/**
 * 聊天服务工厂接口
 */
export interface IChatServiceFactory {
  /**
   * 获取指定供应商的聊天服务
   * @param providerId 供应商ID
   */
  getChatService(providerId: string): IChatService | undefined;
  
  /**
   * 获取所有已注册的聊天服务
   */
  getAllChatServices(): IChatService[];
  
  /**
   * 是否支持指定供应商
   * @param providerId 供应商ID
   */
  supportsProvider(providerId: string): boolean;
}

/**
 * 聊天服务工厂
 * 管理所有聊天服务的单例实例
 */
export class ChatServiceFactory implements IChatServiceFactory {
  private static instance: ChatServiceFactory;
  private chatServices: Map<string, IChatService> = new Map();
  
  /**
   * 私有构造函数，初始化默认服务
   */
  private constructor() {
    // 注册默认服务
    this.registerChatService(new AnthropicChatService());
    this.registerChatService(new OpenRouterChatService());
    
    // 可以在这里注册更多服务...
  }
  
  /**
   * 获取工厂单例
   */
  public static getInstance(): ChatServiceFactory {
    if (!ChatServiceFactory.instance) {
      ChatServiceFactory.instance = new ChatServiceFactory();
    }
    return ChatServiceFactory.instance;
  }
  
  /**
   * 获取特定供应商的聊天服务
   * @param providerId 供应商ID
   * @returns 对应的聊天服务，如果不存在则返回undefined
   */
  public getChatService(providerId: string): IChatService | undefined {
    return this.chatServices.get(providerId);
  }
  
  /**
   * 注册聊天服务
   * @param service 聊天服务实例
   */
  public registerChatService(service: IChatService): void {
    this.chatServices.set(service.getProviderId(), service);
  }
  
  /**
   * 获取所有已注册的聊天服务
   * @returns 所有聊天服务的数组
   */
  public getAllChatServices(): IChatService[] {
    return Array.from(this.chatServices.values());
  }
  
  /**
   * 判断是否支持指定的供应商
   * @param providerId 供应商ID
   * @returns 如果支持则返回true，否则返回false
   */
  public supportsProvider(providerId: string): boolean {
    return this.chatServices.has(providerId);
  }
} 