/**
 * Anthropic 模型服务实现
 */

import Anthropic from '@anthropic-ai/sdk';
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

    try {
      const anthropic = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true
      });

      const response = await anthropic.models.list({
        limit: 20,
      });
      // 将API返回的模型数据转换为应用使用的格式
      return response.data.map((model: any) => ({
        id: model.id,
        name: model.display_name || model.id,
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

    try {
      const anthropic = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true
      });

      await anthropic.models.list({
        limit: 20,
      });
      return true;
    } catch (error) {
      console.error('Anthropic连接测试失败:', error);
      return false;
    }
  }
} 