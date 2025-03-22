# 开发者指南：扩展聊天服务架构

本指南介绍如何扩展Maestro应用的聊天服务架构，添加新的AI供应商支持。

## 架构概述

Maestro的聊天服务架构遵循工厂模式和策略模式，核心组件包括：

1. **聊天服务接口**（IChatService）- 定义标准接口
2. **基础聊天服务**（BaseChatService）- 提供基本实现
3. **聊天服务工厂**（ChatServiceFactory）- 管理服务实例
4. **特定供应商实现** - 如AnthropicChatService、OpenRouterChatService等

## 添加新供应商支持

### 步骤1：创建新的聊天服务类

在`/lib/services/chat/`目录下创建新的服务类文件，如`new-provider-chat-service.ts`：

```typescript
/**
 * 新供应商聊天服务
 * 基于New Provider API实现的聊天服务
 */

import { BaseChatService, ChatRequestOptions, ChatResponse, ChatStreamCallbacks, Tool, ToolCall, ToolCallResult } from './chat-service';
import { Message } from '@/lib/chat-store';
import { useProviderStore } from '@/lib/provider-store';

/**
 * 新供应商聊天服务实现
 */
export class NewProviderChatService extends BaseChatService {
  /**
   * 获取供应商ID
   */
  getProviderId(): string {
    return 'new-provider';
  }

  /**
   * 发送消息并获取完整响应
   * @param messages 对话历史
   * @param options 请求选项
   */
  async sendMessage(
    messages: Message[],
    options?: ChatRequestOptions
  ): Promise<ChatResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API密钥未配置');
    }

    // 实现发送消息逻辑...
    
    // 返回响应
    return {
      content: '响应内容',
      modelId: options?.modelId || 'default-model',
    };
  }

  /**
   * 发送消息并通过流式返回响应
   * @param messages 对话历史
   * @param callbacks 流回调函数
   * @param options 请求选项
   */
  async streamMessage(
    messages: Message[],
    callbacks: ChatStreamCallbacks,
    options?: ChatRequestOptions
  ): Promise<void> {
    // 实现流式响应逻辑...
    
    // 调用回调
    callbacks.onStart?.();
    callbacks.onContent?.('流式内容');
    callbacks.onFinish?.();
  }

  /**
   * 测试连接
   * @param apiKey API密钥
   * @param baseUrl 可选的基础URL
   */
  async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    // 实现连接测试逻辑...
    return true;
  }

  /**
   * 获取API密钥
   * @private
   */
  private getApiKey(): string | null {
    // 从供应商配置中获取API密钥
    const providerConfig = useProviderStore.getState().getProviderConfig('new-provider');
    return providerConfig?.apiKey || null;
  }

  /**
   * 获取基础URL
   * @private
   */
  private getBaseUrl(): string | null {
    // 从供应商配置中获取基础URL
    const providerConfig = useProviderStore.getState().getProviderConfig('new-provider');
    return providerConfig?.baseUrl || null;
  }
}
```

### 步骤2：注册新的聊天服务

修改`/lib/services/chat/chat-service-factory.ts`，在工厂的构造函数中注册新服务：

```typescript
import { NewProviderChatService } from './new-provider-chat-service';

// ...

private constructor() {
  // 注册默认服务
  this.registerChatService(new AnthropicChatService());
  this.registerChatService(new OpenRouterChatService());
  
  // 注册新服务
  this.registerChatService(new NewProviderChatService());
}
```

### 步骤3：更新服务导出

修改`/lib/services/index.ts`，导出新的聊天服务：

```typescript
// 聊天服务
export * from './chat/chat-service';
export * from './chat/chat-service-factory';
export * from './chat/anthropic-chat-service';
export * from './chat/openrouter-chat-service';
export * from './chat/new-provider-chat-service';
```

### 步骤4：添加供应商预设定义

在`/lib/provider-presets.ts`中添加新供应商的预设定义：

```typescript
export const PROVIDER_PRESETS: ProviderPreset[] = [
  // 其他供应商...
  
  {
    id: 'new-provider',
    name: '新供应商',
    logoUrl: '/logos/new-provider.svg',
    baseUrl: 'https://api.new-provider.com',
    apiKeyRequired: true,
    models: [
      {
        id: 'model-1',
        name: '模型 1',
        maxTokens: 4096
      },
      {
        id: 'model-2',
        name: '模型 2',
        maxTokens: 8192
      }
    ]
  }
];
```

## 实现聊天服务的关键方法

### 1. 发送消息（sendMessage）

此方法负责处理非流式消息发送：

```typescript
async sendMessage(
  messages: Message[],
  options?: ChatRequestOptions
): Promise<ChatResponse> {
  const apiKey = this.getApiKey();
  if (!apiKey) {
    throw new Error('API密钥未配置');
  }

  try {
    // 1. 准备请求参数（根据供应商API要求）
    // 2. 发送API请求
    // 3. 处理响应
    // 4. 返回格式化的结果
  } catch (error) {
    console.error('API调用失败:', error);
    throw new Error(`API调用失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

### 2. 流式消息（streamMessage）

此方法负责处理流式响应：

```typescript
async streamMessage(
  messages: Message[],
  callbacks: ChatStreamCallbacks,
  options?: ChatRequestOptions
): Promise<void> {
  const apiKey = this.getApiKey();
  if (!apiKey) {
    callbacks.onError?.(new Error('API密钥未配置'));
    return;
  }

  try {
    // 1. 通知开始
    callbacks.onStart?.();
    
    // 2. 准备请求参数（设置stream=true）
    // 3. 发送API请求
    // 4. 获取并处理流式响应
    //    - 解析每个数据块
    //    - 调用onContent回调
    //    - 处理工具调用（如果有）
    
    // 5. 完成时通知
    callbacks.onFinish?.();
  } catch (error) {
    callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}
```

### 3. 测试连接（testConnection）

此方法用于验证API密钥和URL是否有效：

```typescript
async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
  try {
    // 1. 选择一个简单的API端点进行测试
    // 2. 发送请求验证凭据
    // 3. 根据响应返回true或false
    return true;
  } catch (error) {
    console.error('连接测试失败:', error);
    return false;
  }
}
```

## 处理工具调用

如需支持工具调用，需要实现以下功能：

1. 在`sendMessage`和`streamMessage`中添加工具定义处理
2. 添加工具调用结果处理
3. 实现流式响应中对工具调用事件的检测

示例：
```typescript
// 添加工具调用支持
if (tools && tools.length > 0) {
  params.tools = this.convertTools(tools);
}

// 在流式响应中检测工具调用
if (delta?.tool_calls && delta.tool_calls.length > 0) {
  // 处理工具调用...
  callbacks.onToolCall?.({
    id: toolCallId,
    type: 'function',
    function: {
      name: functionName,
      arguments: functionArgs
    }
  });
}
```

## 编写测试

为新服务编写测试，放在`__tests__/lib/services/chat/`目录下：

```typescript
/**
 * 新供应商聊天服务测试
 */

import { NewProviderChatService } from '@/lib/services/chat/new-provider-chat-service';
import { ChatStreamCallbacks } from '@/lib/services/chat/chat-service';

// 模拟提供商存储
jest.mock('@/lib/provider-store', () => ({
  useProviderStore: {
    getState: () => ({
      getProviderConfig: () => ({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.test.com',
      }),
    }),
  },
}));

// 测试代码...
```

## 最佳实践

1. **错误处理**：确保全面的错误处理，提供有意义的错误消息
2. **类型安全**：使用TypeScript类型确保代码安全
3. **代码注释**：添加详细注释说明实现细节
4. **遵循模式**：遵循已有服务的实现模式
5. **测试覆盖**：为所有关键功能编写测试
6. **流式处理**：正确处理流式响应的分块和状态
7. **配置管理**：使用提供的provider-store获取配置

## 调试技巧

1. 使用console.log记录API请求和响应
2. 添加详细的错误日志
3. 使用浏览器开发工具检查网络请求
4. 验证API响应格式与预期是否一致

## 后续工作

成功实现新的供应商服务后，考虑以下后续工作：

1. 更新文档，添加新供应商信息
2. 在供应商预设中添加相关模型
3. 添加供应商特定的设置UI（如果需要）
4. 考虑添加高级功能（如多模态支持） 