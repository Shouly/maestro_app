/**
 * 预设的AI供应商列表
 * 包含了常见AI提供商的API配置和默认模型
 */

export interface ModelPreset {
  id: string;           // 模型ID
  name: string;         // 显示名称
  maxTokens: number;    // 最大Token数
}

export interface ProviderPreset {
  id: string;           // 唯一标识符
  name: string;         // 显示名称
  baseUrl: string;      // 默认API基础URL
  apiKeyRequired: boolean; // 是否需要API密钥
  models: ModelPreset[]; // 供应商支持的模型列表
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    apiKeyRequired: true,
    models: [
      {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        maxTokens: 200000
      },
      {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        maxTokens: 200000
      },
      {
        id: "claude-3-haiku",
        name: "Claude 3 Haiku",
        maxTokens: 200000
      },
      {
        id: "claude-2.1",
        name: "Claude 2.1",
        maxTokens: 100000
      }
    ]
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKeyRequired: true,
    models: [
      {
        id: "openrouter:auto",
        name: "自动选择",
        maxTokens: 32000
      },
      {
        id: "anthropic/claude-3-opus",
        name: "Claude 3 Opus",
        maxTokens: 200000
      },
      {
        id: "anthropic/claude-3-sonnet",
        name: "Claude 3 Sonnet",
        maxTokens: 200000
      },
      {
        id: "meta-llama/llama-3-70b-instruct",
        name: "Llama 3 70B",
        maxTokens: 32000
      }
    ]
  }
]; 