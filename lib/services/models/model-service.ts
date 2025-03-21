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