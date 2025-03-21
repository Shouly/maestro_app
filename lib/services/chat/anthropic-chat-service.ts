/**
 * Anthropic聊天服务
 * 基于Anthropic官方SDK实现的聊天服务
 */

import { Message } from '@/lib/chat-store';
import { useProviderStore } from '@/lib/provider-store';
import Anthropic from '@anthropic-ai/sdk';
import { BaseChatService, ChatRequestOptions, ChatResponse, ChatStreamCallbacks, Tool } from './chat-service';

/**
 * Anthropic聊天服务实现
 */
export class AnthropicChatService extends BaseChatService {
  /**
   * 获取供应商ID
   */
  getProviderId(): string {
    return 'anthropic';
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
      throw new Error('Anthropic API密钥未配置');
    }

    try {
      // 创建Anthropic客户端
      const anthropic = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      // 将消息转换为Anthropic格式
      let apiMessages = this.convertMessages(messages);

      // 限制历史消息数量，使用基类的公共方法
      if (options?.maxTurns && options.maxTurns > 0) {
        // 直接使用返回的新数组，而不是修改原数组
        const limitedMessages = this.applyMaxTurnsLimit(apiMessages, options.maxTurns);
        console.log('limitedMessages', limitedMessages);

        // 直接使用新数组
        apiMessages = limitedMessages;
        console.log('apiMessages after assignment', apiMessages);
      }

      // 准备工具定义
      const tools = this.convertTools(options?.tools);

      // 构建请求参数
      const params: any = {
        model: options?.modelId || 'claude-3-opus-20240229',
        max_tokens: options?.maxTokens || 4000,
        temperature: options?.temperature || 0.7,
        messages: apiMessages,
      };

      // 添加系统消息（使用结构化格式支持缓存）
      if (options?.systemPrompt) {
        // 使用结构化的system格式，添加cache_control
        params.system = [{
          type: "text",
          text: options.systemPrompt,
          cache_control: { type: "ephemeral" }
        }];
      }

      // 添加工具
      if (tools && tools.length > 0) {
        params.tools = tools;
      }

      // 添加prompt缓存header
      const headers = {
        "anthropic-beta": "prompt-caching-2024-07-31"
      };

      // 打印当前用户配置信息
      console.log('=== Anthropic用户配置信息 ===');
      console.log('API密钥:', apiKey ? '已配置' : '未配置');
      console.log('使用模型:', params.model);
      console.log('系统提示词:', typeof params.system === 'string' ? params.system : (params.system?.[0]?.text || '未设置'));
      console.log('温度:', params.temperature);
      console.log('最大Token数:', params.max_tokens);
      console.log('启用prompt缓存:', true);

      // 打印完整Prompt
      console.log('=== 发送到Anthropic的完整Prompt ===');
      console.log('系统提示词:', typeof params.system === 'string' ? params.system : (params.system?.[0]?.text || '未设置'));
      console.log('消息:', JSON.stringify(apiMessages, null, 2));
      if (tools && tools.length > 0) {
        console.log('=== 工具定义 ===');
        console.log(JSON.stringify(tools, null, 2));
      }

      // 如果有工具结果，则添加到最后一条消息中
      if (options?.toolResults && options.toolResults.length > 0) {
        const lastMessageIndex = apiMessages.length - 1;
        if (lastMessageIndex >= 0 && apiMessages[lastMessageIndex].role === 'user') {
          // 替换最后一条用户消息，添加工具调用结果
          const lastMessage = apiMessages[lastMessageIndex];
          const content = Array.isArray(lastMessage.content)
            ? [...lastMessage.content]
            : [{ type: 'text', text: lastMessage.content }];

          // 添加工具结果
          options.toolResults.forEach(result => {
            content.push({
              type: 'tool_result',
              tool_use_id: result.toolCallId,
              content: result.result,
            });
          });

          // 更新消息
          apiMessages[lastMessageIndex] = {
            ...lastMessage,
            content,
          };
        }
      }

      // 发送请求，正确传递headers参数
      const response = await anthropic.messages.create(params, { headers });

      // 打印模型响应内容和缓存信息
      console.log('=== Anthropic响应内容 ===');
      console.log(JSON.stringify(response, null, 2));
      
      // 打印缓存统计信息（如果有）
      if (response.usage) {
        console.log('=== 缓存统计信息 ===');
        console.log('缓存创建Token:', response.usage.input_tokens);
        if ('cache_creation_input_tokens' in response.usage) {
          console.log('缓存创建Token:', response.usage.cache_creation_input_tokens);
        }
        if ('cache_read_input_tokens' in response.usage) {
          console.log('缓存读取Token:', response.usage.cache_read_input_tokens);
        }
      }

      // 提取响应内容
      return this.extractResponse(response);
    } catch (error) {
      console.error('Anthropic API调用失败:', error);
      throw new Error(`Anthropic API调用失败: ${error instanceof Error ? error.message : String(error)}`);
    }
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
    const apiKey = this.getApiKey();
    if (!apiKey) {
      callbacks.onError?.(new Error('Anthropic API密钥未配置'));
      return;
    }

    // 创建Anthropic客户端
    const anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    try {
      // 通知开始
      callbacks.onStart?.();

      // 将消息转换为Anthropic格式
      let apiMessages = this.convertMessages(messages);

      // 限制历史消息数量，使用基类的公共方法
      if (options?.maxTurns && options.maxTurns > 0) {
        // 直接使用返回的新数组，而不是修改原数组
        const limitedMessages = this.applyMaxTurnsLimit(apiMessages, options.maxTurns);
        console.log('limitedMessages', limitedMessages);

        // 直接使用新数组
        apiMessages = limitedMessages;
        console.log('apiMessages after assignment', apiMessages);
      }

      // 准备工具定义
      const tools = this.convertTools(options?.tools);

      // 构建请求参数
      const params: any = {
        model: options?.modelId || 'claude-3-opus-20240229',
        max_tokens: options?.maxTokens || 4000,
        temperature: options?.temperature || 0.7,
        messages: apiMessages,
        stream: true,
      };

      // 添加系统消息（使用结构化格式支持缓存）
      if (options?.systemPrompt) {
        // 使用结构化的system格式，添加cache_control
        params.system = [{
          type: "text",
          text: options.systemPrompt,
          cache_control: { type: "ephemeral" }
        }];
      }

      // 添加工具
      if (tools && tools.length > 0) {
        params.tools = tools;
      }

      // 准备请求配置，包含headers和信号
      const requestOptions: any = {
        headers: {
          "anthropic-beta": "prompt-caching-2024-07-31"
        }
      };
      
      // 如果有中止信号，添加到请求选项中
      if (options?.signal) {
        requestOptions.signal = options.signal;
      }

      // 打印当前用户配置信息
      console.log('=== Anthropic流式请求配置信息 ===');
      console.log('API密钥:', apiKey ? '已配置' : '未配置');
      console.log('使用模型:', params.model);
      console.log('系统提示词:', typeof params.system === 'string' ? params.system : (params.system?.[0]?.text || '未设置'));
      console.log('温度:', params.temperature);
      console.log('最大Token数:', params.max_tokens);
      console.log('启用prompt缓存:', true);

      // 打印完整Prompt
      console.log('=== 发送到Anthropic的完整Prompt(流式) ===');
      console.log('系统提示词:', typeof params.system === 'string' ? params.system : (params.system?.[0]?.text || '未设置'));
      console.log('消息:', JSON.stringify(apiMessages, null, 2));
      if (tools && tools.length > 0) {
        console.log('=== 工具定义 ===');
        console.log(JSON.stringify(tools, null, 2));
      }

      // 调用Anthropic API，使用stream方法
      const stream = await anthropic.messages.stream(params, requestOptions);

      // 使用正确的事件处理API
      stream.on('text', (text: string) => {
        // 如果已经中止，则不处理新内容
        if (options?.signal?.aborted) return;

        callbacks.onContent?.(text);
      });

      // 处理工具调用（适配 Anthropic SDK 的事件类型）
      const handleToolUse = (toolUse: any) => {
        // 如果已经中止，则不处理工具调用
        if (options?.signal?.aborted) return;

        callbacks.onToolCall?.({
          id: toolUse.id,
          type: 'function',
          function: {
            name: toolUse.name,
            arguments: JSON.stringify(toolUse.input)
          }
        });
      };

      // 注册工具调用监听器
      (stream as any).on('tool_use', handleToolUse);

      stream.on('error', (error: Error) => {
        // 如果是中止错误，不报告错误
        if (
          options?.signal?.aborted || 
          (error instanceof Error && (
            error.name === 'AbortError' || 
            error.message.includes('aborted') || 
            error.message.includes('cancelled') ||
            error.message.includes('canceled')
          ))
        ) {
          console.log('流请求已中止，不报告错误');
          return;
        }

        callbacks.onError?.(error);
      });

      // 等待流完成
      await stream.done();

      // 通知完成
      callbacks.onFinish?.();
    } catch (error) {
      // 如果是中止错误，不记录日志
      if (
        options?.signal?.aborted || 
        (error instanceof Error && (
          error.name === 'AbortError' || 
          error.message.includes('aborted') || 
          error.message.includes('cancelled') ||
          error.message.includes('canceled')
        ))
      ) {
        console.log('捕获到中止错误，请求已取消');
        return;
      }

      console.error('Anthropic 流式API调用失败:', error);
      callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * 将应用消息格式转换为Anthropic消息格式
   */
  private convertMessages(messages: Message[]): any[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * 将工具定义转换为Anthropic工具格式
   */
  private convertTools(tools?: Tool[]): any[] | undefined {
    if (!tools || tools.length === 0) {
      return undefined;
    }

    return tools.map(tool => ({
      name: tool.name,
      description: tool.description || '',
      input_schema: {
        type: 'object',
        properties: tool.parameters || {},
      },
    }));
  }

  /**
   * 从Anthropic响应中提取内容
   */
  private extractResponse(response: any): ChatResponse {
    let content = '';
    const toolCalls: any[] = [];

    // 处理响应内容块
    response.content.forEach((block: any) => {
      if (block.type === 'text') {
        content += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          type: 'function',
          function: {
            name: block.name,
            arguments: JSON.stringify(block.input),
          },
        });
      }
    });

    // 包含缓存统计信息
    const usage: Record<string, any> = {
      promptTokens: response.usage?.input_tokens,
      completionTokens: response.usage?.output_tokens,
      totalTokens: response.usage ? (response.usage.input_tokens + response.usage.output_tokens) : undefined,
    };

    // 如果有缓存信息，添加到usage中
    if (response.usage && 'cache_creation_input_tokens' in response.usage) {
      usage.cacheCreationTokens = response.usage.cache_creation_input_tokens;
    }
    
    if (response.usage && 'cache_read_input_tokens' in response.usage) {
      usage.cacheReadTokens = response.usage.cache_read_input_tokens;
    }

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      modelId: response.model,
      usage,
    };
  }

  /**
   * 获取API密钥
   */
  private getApiKey(): string | null {
    // 从供应商配置中获取API密钥
    const providerConfig = useProviderStore.getState().getProviderConfig('anthropic');
    return providerConfig?.apiKey || null;
  }
} 