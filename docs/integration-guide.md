# AI服务集成指南

本文档提供了如何将Maestro应用与实际AI服务进行集成的指南，用于替换当前的模拟AI响应。

## 当前实现

目前，Maestro使用模拟响应来演示AI对话功能：

```typescript
// 模拟AI响应
const simulateResponse = async (userMessage: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        `您好！我是AI助手，很高兴能帮助您解答问题。关于"${userMessage.substring(0, 20)}..."`,
        // ... 其他模拟响应
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      resolve(randomResponse);
    }, 1000);
  });
};
```

## 集成选项

### 1. OpenAI API

#### 安装依赖

```bash
npm install openai
```

#### 配置

创建环境变量文件 `.env.local`：

```
NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
NEXT_PUBLIC_MODEL_NAME=gpt-4-turbo
```

#### 实现

在 `lib` 目录下创建 `ai-service.ts`：

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 生产环境中应通过后端服务调用
});

export async function getAIResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_MODEL_NAME || 'gpt-4-turbo',
      messages,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '无法获取回答';
  } catch (error) {
    console.error('AI服务调用失败:', error);
    throw new Error('无法获取AI回答，请稍后再试');
  }
}
```

### 2. Anthropic API（Claude）

#### 安装依赖

```bash
npm install @anthropic-ai/sdk
```

#### 配置

创建环境变量文件 `.env.local`：

```
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_api_key_here
NEXT_PUBLIC_ANTHROPIC_MODEL=claude-3-opus-20240229
```

#### 实现

在 `lib` 目录下创建 `ai-service.ts`：

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
});

export async function getAIResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
): Promise<string> {
  try {
    // 转换消息格式以符合Anthropic API要求
    const anthropicMessages = messages.map(msg => {
      if (msg.role === 'system') {
        return { role: 'user', content: msg.content };
      }
      return msg;
    });
    
    const response = await anthropic.messages.create({
      model: process.env.NEXT_PUBLIC_ANTHROPIC_MODEL || 'claude-3-opus-20240229',
      messages: anthropicMessages,
      max_tokens: 1000,
    });

    return response.content[0]?.text || '无法获取回答';
  } catch (error) {
    console.error('AI服务调用失败:', error);
    throw new Error('无法获取AI回答，请稍后再试');
  }
}
```

## 集成到应用

修改 `components/chat/chat-input.tsx`：

```typescript
import { getAIResponse } from '@/lib/ai-service';

// 替换原有的模拟响应函数
const handleSendMessage = async () => {
  if (!message.trim() || isLoading) return;

  // 添加用户消息
  addMessage({
    role: 'user',
    content: message.trim(),
    timestamp: Date.now(),
  });

  // 清空输入框
  setMessage('');
  
  // 显示加载状态
  setIsLoading(true);

  try {
    // 获取对话历史
    const conversation = getActiveConversation();
    const messageHistory = conversation?.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })) || [];
    
    // 可以添加一个系统提示
    const fullMessages = [
      { role: 'system', content: '你是一个有用的AI助手。' },
      ...messageHistory
    ];

    // 调用AI服务
    const response = await getAIResponse(fullMessages);
    
    // 添加AI响应
    addMessage({
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('获取AI响应时出错:', error);
    // 显示错误消息
    // ...
  } finally {
    setIsLoading(false);
  }
};
```

## 流式响应实现

### OpenAI流式响应

```typescript
export async function streamAIResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  onChunk: (chunk: string) => void
) {
  try {
    const stream = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_MODEL_NAME || 'gpt-4-turbo',
      messages,
      stream: true,
    });

    let fullResponse = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        onChunk(content);
      }
    }
    
    return fullResponse;
  } catch (error) {
    console.error('AI流式响应失败:', error);
    throw new Error('无法获取AI回答，请稍后再试');
  }
}
```

### 修改ChatInput组件实现流式响应

```typescript
const handleSendMessage = async () => {
  // ... 前面的代码不变
  
  try {
    // ... 获取消息历史的代码不变
    
    // 创建一个初始的AI响应消息
    const aiMessageId = addMessage({
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    });
    
    // 流式更新消息内容
    let fullContent = '';
    await streamAIResponse(fullMessages, (chunk) => {
      fullContent += chunk;
      // 更新消息内容
      updateMessageContent(aiMessageId, fullContent);
    });
  } catch (error) {
    // ... 错误处理
  } finally {
    setIsLoading(false);
  }
};
```

## 安全考虑

1. **API密钥保护**：
   - 生产环境中，API调用应通过后端服务进行，避免在前端暴露API密钥
   - 使用环境变量和服务端API代理

2. **输入验证**：
   - 限制用户输入长度
   - 过滤潜在的有害内容

3. **速率限制**：
   - 实现请求节流，避免API过度调用
   - 显示剩余配额和使用限制

4. **错误处理**：
   - 优雅处理API错误
   - 提供用户友好的错误消息

## 后续改进

1. **多模型支持**：
   - 允许用户切换不同的AI模型
   - 添加模型配置选项

2. **上下文管理**：
   - 实现高级上下文处理，优化长对话体验
   - 添加上下文窗口大小限制

3. **功能增强**：
   - 支持图像、音频输入
   - 实现文件上传和分析
   - 代码生成和格式化 