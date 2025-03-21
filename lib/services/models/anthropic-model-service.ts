/**
 * Anthropic 模型服务实现
 */

import { ModelPreset } from '../../provider-presets';
import { IModelService } from './model-service';

/**
 * Anthropic模型服务实现
 * 通过Anthropic API获取和管理Claude系列模型
 */
export class AnthropicModelService implements IModelService {
  private readonly providerId = 'anthropic';
  private readonly defaultBaseUrl = 'https://api.anthropic.com/v1';
  
  /**
   * 获取供应商ID
   */
  getProviderId(): string {
    return this.providerId;
  }
  
  /**
   * 获取Anthropic支持的模型列表
   */
  async fetchModels(apiKey: string, baseUrl?: string): Promise<ModelPreset[]> {
    const url = `${baseUrl || this.defaultBaseUrl}/models`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`获取模型失败: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 将API返回的模型数据转换为应用使用的格式
      return data.models.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        maxTokens: model.context_window || 100000
      }));
    } catch (error) {
      console.error('获取Anthropic模型失败:', error);
      return [];
    }
  }
  
  /**
   * 测试Anthropic API连接
   */
  async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    const url = `${baseUrl || this.defaultBaseUrl}/models`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
} 