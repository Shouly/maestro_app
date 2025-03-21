/**
 * OpenRouter 模型服务实现
 */

import { ModelPreset } from '../../provider-presets';
import { IModelService } from './model-service';

/**
 * OpenRouter模型服务实现
 * 通过OpenRouter API获取和管理多种AI模型
 */
export class OpenRouterModelService implements IModelService {
  private readonly providerId = 'openrouter';
  private readonly defaultBaseUrl = 'https://openrouter.ai/api/v1';
  
  /**
   * 获取供应商ID
   */
  getProviderId(): string {
    return this.providerId;
  }
  
  /**
   * 获取OpenRouter支持的模型列表
   */
  async fetchModels(apiKey: string, baseUrl?: string): Promise<ModelPreset[]> {
    const url = `${baseUrl || this.defaultBaseUrl}/models`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`获取模型失败: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 将API返回的模型数据转换为应用使用的格式
      return data.data.map((model: any) => ({
        id: model.id,
        name: model.name.includes(':') ? model.name.split(':')[1] : model.name,
        maxTokens: model.context_length || 4096
      }));
    } catch (error) {
      console.error('获取OpenRouter模型失败:', error);
      return [];
    }
  }
  
  /**
   * 测试OpenRouter API连接
   */
  async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    const url = `${baseUrl || this.defaultBaseUrl}/models`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
} 