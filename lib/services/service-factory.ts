/**
 * 服务工厂
 * 用于创建和管理各种服务实例
 */

import { IModelService, IModelServiceFactory } from './models/model-service';
import { OpenRouterModelService } from './models/openrouter-model-service';
import { AnthropicModelService } from './models/anthropic-model-service';

/**
 * 模型服务工厂
 * 管理所有模型服务的单例实例
 */
export class ModelServiceFactory implements IModelServiceFactory {
  private static instance: ModelServiceFactory;
  private modelServices: Map<string, IModelService> = new Map();
  
  /**
   * 私有构造函数，初始化默认服务
   */
  private constructor() {
    // 注册默认服务
    this.registerModelService(new OpenRouterModelService());
    this.registerModelService(new AnthropicModelService());
  }
  
  /**
   * 获取工厂单例
   */
  public static getInstance(): ModelServiceFactory {
    if (!ModelServiceFactory.instance) {
      ModelServiceFactory.instance = new ModelServiceFactory();
    }
    return ModelServiceFactory.instance;
  }
  
  /**
   * 获取特定供应商的模型服务
   * @param providerId 供应商ID
   * @returns 对应的模型服务，如果不存在则返回undefined
   */
  public getModelService(providerId: string): IModelService | undefined {
    return this.modelServices.get(providerId);
  }
  
  /**
   * 注册模型服务
   * @param service 模型服务实例
   */
  public registerModelService(service: IModelService): void {
    this.modelServices.set(service.getProviderId(), service);
  }
  
  /**
   * 获取所有已注册的模型服务
   * @returns 所有模型服务的数组
   */
  public getAllModelServices(): IModelService[] {
    return Array.from(this.modelServices.values());
  }
  
  /**
   * 判断是否支持指定的供应商
   * @param providerId 供应商ID
   * @returns 如果支持则返回true，否则返回false
   */
  public supportsProvider(providerId: string): boolean {
    return this.modelServices.has(providerId);
  }
} 