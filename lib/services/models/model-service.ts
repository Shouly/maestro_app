/**
 * 模型服务接口
 * 定义所有模型服务的通用接口
 */

import { ModelPreset } from '../../provider-presets';

/**
 * 模型服务接口
 * 定义了与AI模型提供商交互的标准方法
 */
export interface IModelService {
  /**
   * 获取供应商支持的模型列表
   * @param apiKey API密钥
   * @param baseUrl 可选的自定义API基础URL
   * @returns 模型列表
   */
  fetchModels(apiKey: string, baseUrl?: string): Promise<ModelPreset[]>;
  
  /**
   * 测试API连接是否有效
   * @param apiKey API密钥
   * @param baseUrl 可选的自定义API基础URL
   * @returns 连接是否成功
   */
  testConnection(apiKey: string, baseUrl?: string): Promise<boolean>;
  
  /**
   * 获取供应商ID
   * @returns 供应商ID
   */
  getProviderId(): string;
}

/**
 * 模型服务工厂接口
 * 用于创建和获取模型服务实例
 */
export interface IModelServiceFactory {
  /**
   * 获取特定供应商的模型服务实例
   * @param providerId 供应商ID
   * @returns 对应的模型服务，如果不存在则返回undefined
   */
  getModelService(providerId: string): IModelService | undefined;
  
  /**
   * 注册模型服务
   * @param service 模型服务实例
   */
  registerModelService(service: IModelService): void;
}

/**
 * 模拟AI响应
 * 用于开发环境或测试时模拟AI回复
 */
export const simulateResponse = async (userMessage: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        `您好！我是AI助手，很高兴能帮助您解答问题。关于"${userMessage.substring(0, 20)}${userMessage.length > 20 ? '...' : ''}"，我的回答是：这是一个AI生成的回复，在实际应用中，这里会连接到后端服务获取真实的AI回答。`,
        `感谢您的问题。我理解您想了解关于"${userMessage.substring(0, 20)}${userMessage.length > 20 ? '...' : ''}"的信息。这是一个模拟回复，在完整实现中将通过API获取大语言模型的回答。`,
        `您提到的"${userMessage.substring(0, 20)}${userMessage.length > 20 ? '...' : ''}"是一个很有趣的话题。这只是一个模拟响应，实际应用中会连接到AI服务获取更专业的回答。`,
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      resolve(randomResponse);
    }, 1000);
  });
}; 