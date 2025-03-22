# 聊天服务架构

## 概述

聊天服务架构负责管理和处理AI对话功能，提供统一的接口与不同AI供应商对接。该架构遵循工厂模式和策略模式，使得添加新的AI供应商变得简单灵活。

## 核心组件

### 1. 聊天服务接口与基类

- **IChatService**：定义了聊天服务的标准接口
- **BaseChatService**：提供了基础实现，具体供应商服务通过继承此类实现特定功能

### 2. 聊天服务工厂

- **ChatServiceFactory**：单例模式实现的工厂类，负责创建和管理不同供应商的聊天服务实例
- 自动注册所有支持的聊天服务，便于统一管理

### 3. 特定供应商实现

- **AnthropicChatService**：基于Anthropic API的聊天服务实现
- **OpenRouterChatService**：基于OpenRouter API的聊天服务实现，支持多种模型

### 4. React钩子

- **useChatService**：提供便捷的React钩子，简化UI组件与聊天服务的交互

## 服务功能

聊天服务提供以下核心功能：

1. **消息发送**：支持发送用户消息并获取AI回复
2. **流式响应**：支持流式接收AI回复，提供更好的用户体验
3. **工具调用**：支持AI进行工具调用，扩展AI能力
4. **连接测试**：测试API密钥和基础URL是否有效
5. **状态管理**：提供完整的状态管理，包括加载、成功、错误等状态

## 使用方式

### 聊天服务工厂

```typescript
// 获取工厂实例
const factory = ChatServiceFactory.getInstance();

// 获取特定供应商的服务
const anthropicService = factory.getChatService('anthropic');
const openrouterService = factory.getChatService('openrouter');

// 判断是否支持某供应商
const isSupported = factory.supportsProvider('anthropic');
```

### React钩子使用

```typescript
// 在React组件中使用
function ChatComponent() {
  const { 
    sendMessage,
    streamMessage,
    status,
    error 
  } = useChatService();
  
  // 发送消息
  const handleSend = async () => {
    try {
      await streamMessage(
        messages,
        {
          onStart: () => { /* 开始回调 */ },
          onContent: (content) => { /* 内容回调 */ },
          onFinish: () => { /* 完成回调 */ },
          onError: (err) => { /* 错误回调 */ }
        },
        {
          systemPrompt: '你是一个AI助手',
          modelId: 'openai/gpt-4',
          // 更多选项...
        }
      );
    } catch (err) {
      console.error('发送失败', err);
    }
  };
  
  return (
    // 组件UI
  );
}
```

## 扩展新的供应商

添加新的供应商需要以下步骤：

1. 创建新的聊天服务类，继承`BaseChatService`
2. 实现必要的方法，特别是`getProviderId`、`sendMessage`、`streamMessage`和`testConnection`
3. 在`ChatServiceFactory`的构造函数中注册该服务

示例：
```typescript
export class NewProviderChatService extends BaseChatService {
  getProviderId(): string {
    return 'new-provider';
  }
  
  // 实现其他必要方法...
}

// 在工厂中注册
private constructor() {
  // 注册默认服务
  this.registerChatService(new AnthropicChatService());
  this.registerChatService(new OpenRouterChatService());
  this.registerChatService(new NewProviderChatService());
}
```

## 已支持的供应商详情

### Anthropic

- **模型**：Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku等Claude系列模型
- **功能**：支持流式响应、工具调用
- **配置**：需要API密钥，可自定义基础URL

### OpenRouter

- **模型**：支持多种模型，包括OpenAI的GPT系列、Anthropic的Claude系列、Cohere的模型等
- **功能**：支持流式响应、工具调用
- **配置**：需要API密钥，可自定义基础URL

## 技术实现细节

### 消息格式转换

每个供应商服务负责将应用统一的消息格式转换为供应商特定的格式：

```typescript
protected convertMessagesToApiFormat(
  messages: Message[], 
  systemPrompt?: string
): ChatMessage[] {
  // 转换逻辑
}
```

### 流式响应处理

流式响应使用标准的Web Streams API处理：

```typescript
const reader = response.body?.getReader();
if (!reader) {
  throw new Error('无法获取响应流');
}

const decoder = new TextDecoder();
let buffer = '';

const processStream = async () => {
  const { done, value } = await reader.read();
  // 处理流数据
};
```

### 错误处理

每个服务方法都实现了统一的错误处理模式：

```typescript
try {
  // 服务调用
} catch (error) {
  console.error('API调用失败:', error);
  throw new Error(`API调用失败: ${error instanceof Error ? error.message : String(error)}`);
}
```

## 测试

聊天服务包含完整的单元测试，确保各项功能正常工作：

- 消息发送测试
- 流式响应测试
- 错误处理测试
- 连接测试

## 后续扩展计划

1. 添加更多供应商支持（如OpenAI、Google、Mistral等）
2. 增强工具调用能力
3. 添加高级功能如思维链、多模态支持等 