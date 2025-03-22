/**
 * OpenRouter聊天服务
 * 基于OpenRouter API实现的聊天服务
 */

import { BaseChatService, ChatRequestOptions, ChatResponse, ChatStreamCallbacks, Tool, ToolCall, ToolCallResult } from './chat-service';
import { Message } from '@/lib/chat-store';
import { useProviderStore } from '@/lib/provider-store';

/**
 * OpenRouter聊天服务实现
 */
export class OpenRouterChatService extends BaseChatService {
  /**
   * 获取供应商ID
   */
  getProviderId(): string {
    return 'openrouter';
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
      throw new Error('OpenRouter API密钥未配置');
    }

    const baseUrl = this.getBaseUrl() || 'https://openrouter.ai/api/v1';

    try {
      // 将消息转换为OpenRouter格式
      const apiMessages = this.convertMessages(messages, options?.systemPrompt);
      
      // 准备工具定义
      const tools = this.convertTools(options?.tools);
      
      // 构建请求参数
      const params: any = {
        model: options?.modelId || 'openai/gpt-3.5-turbo',
        messages: apiMessages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
        top_p: 1.0,
      };

      // 添加工具
      if (tools && tools.length > 0) {
        params.tools = tools;
      }

      // 如果有工具结果，则添加到最后一条消息中
      if (options?.toolResults && options.toolResults.length > 0) {
        this.addToolResultsToMessages(apiMessages, options.toolResults);
      }

      // 设置请求头
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'maestro-app', // 应用标识
        'X-Title': 'Maestro', // 应用名称
      };

      // 发送请求
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API错误: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // 提取响应内容
      return this.extractResponse(data);
    } catch (error) {
      console.error('OpenRouter API调用失败:', error);
      throw new Error(`OpenRouter API调用失败: ${error instanceof Error ? error.message : String(error)}`);
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
      callbacks.onError?.(new Error('OpenRouter API密钥未配置'));
      return;
    }

    const baseUrl = this.getBaseUrl() || 'https://openrouter.ai/api/v1';

    try {
      // 通知开始
      callbacks.onStart?.();
      
      // 将消息转换为OpenRouter格式
      const apiMessages = this.convertMessages(messages, options?.systemPrompt);
      
      // 准备工具定义
      const tools = this.convertTools(options?.tools);
      
      // 构建请求参数
      const params: any = {
        model: options?.modelId || 'openai/gpt-3.5-turbo',
        messages: apiMessages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
        stream: true,
        top_p: 1.0,
      };

      // 添加工具
      if (tools && tools.length > 0) {
        params.tools = tools;
      }

      // 如果有工具结果，则添加到最后一条消息中
      if (options?.toolResults && options.toolResults.length > 0) {
        this.addToolResultsToMessages(apiMessages, options.toolResults);
      }

      // 设置请求头
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'maestro-app', // 应用标识
        'X-Title': 'Maestro', // 应用名称
      };

      // 发送请求
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API错误: ${response.status} - ${errorText}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      // 处理工具调用
      let currentToolCall: {
        id: string;
        function: {
          name: string;
          arguments: string;
        };
      } | null = null;

      // 解码器
      const decoder = new TextDecoder();
      let buffer = '';

      // 读取流
      const processStream = async () => {
        const { done, value } = await reader.read();
        
        if (done) {
          callbacks.onFinish?.();
          return;
        }
        
        // 解码新的数据块
        buffer += decoder.decode(value, { stream: true });
        
        // 按行分割并处理每一行
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          
          const data = line.substring(6);
          if (data === '[DONE]') continue;
          
          try {
            const json = JSON.parse(data);
            const delta = json.choices[0]?.delta;
            
            if (delta?.content) {
              callbacks.onContent?.(delta.content);
            }
            
            // 处理工具调用
            if (delta?.tool_calls && delta.tool_calls.length > 0) {
              const toolCall = delta.tool_calls[0];
              
              if (toolCall.index === 0 && toolCall.id) {
                // 新的工具调用
                currentToolCall = {
                  id: toolCall.id,
                  function: {
                    name: toolCall.function?.name || '',
                    arguments: toolCall.function?.arguments || ''
                  }
                };
              } else if (currentToolCall) {
                // 继续之前的工具调用
                if (toolCall.function?.name) {
                  currentToolCall.function.name += toolCall.function.name;
                }
                if (toolCall.function?.arguments) {
                  currentToolCall.function.arguments += toolCall.function.arguments;
                }
              }
              
              // 如果工具调用完成，则触发回调
              if (json.choices[0]?.finish_reason === 'tool_calls' && currentToolCall) {
                callbacks.onToolCall?.({
                  id: currentToolCall.id,
                  type: 'function',
                  function: {
                    name: currentToolCall.function.name,
                    arguments: currentToolCall.function.arguments
                  }
                });
                currentToolCall = null;
              }
            }
          } catch (err) {
            console.error('解析流式响应出错:', err);
          }
        }
        
        // 继续处理
        processStream();
      };
      
      await processStream();
    } catch (error) {
      console.error('OpenRouter 流式API调用失败:', error);
      callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * 测试连接
   * @param apiKey API密钥
   * @param baseUrl 可选的基础URL
   */
  async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://openrouter.ai/api/v1') + '/models';
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'maestro-app',
          'X-Title': 'Maestro',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data.data);
    } catch (error) {
      console.error('OpenRouter连接测试失败:', error);
      return false;
    }
  }

  /**
   * 将应用消息格式转换为OpenRouter消息格式
   */
  private convertMessages(messages: Message[], systemPrompt?: string): any[] {
    const result: any[] = [];
    
    // 添加系统提示(如果有)
    if (systemPrompt) {
      result.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    // 添加对话历史
    messages.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') {
        result.push({
          role: msg.role,
          content: msg.content
        });
      }
    });
    
    return result;
  }

  /**
   * 将工具定义转换为OpenRouter工具格式
   */
  private convertTools(tools?: Tool[]): any[] | undefined {
    if (!tools || tools.length === 0) {
      return undefined;
    }

    return tools.map(tool => {
      if (tool.type === 'function') {
        return {
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description || '',
            parameters: tool.parameters || {},
          }
        };
      }
      return null;
    }).filter(Boolean);
  }

  /**
   * 添加工具调用结果到消息
   */
  private addToolResultsToMessages(messages: any[], toolResults: ToolCallResult[]): void {
    // 找到最后一条助手消息的索引
    const lastAssistantIndex = messages.length - 1;
    
    if (lastAssistantIndex >= 0) {
      // 对于每个工具结果，添加一条工具结果消息
      toolResults.forEach(result => {
        messages.push({
          role: 'tool',
          tool_call_id: result.toolCallId,
          content: result.result
        });
      });
    }
  }

  /**
   * 从OpenRouter响应中提取内容
   */
  private extractResponse(response: any): ChatResponse {
    const choice = response.choices[0];
    const message = choice?.message;
    
    if (!message) {
      throw new Error('无效的OpenRouter响应格式');
    }
    
    // 提取工具调用
    const toolCalls = message.tool_calls?.map((tc: any) => ({
      id: tc.id,
      type: 'function' as const,
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments
      }
    }));
    
    return {
      content: message.content || '',
      toolCalls: toolCalls?.length > 0 ? toolCalls : undefined,
      modelId: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
      },
    };
  }

  /**
   * 获取API密钥
   */
  private getApiKey(): string | null {
    // 从供应商配置中获取API密钥
    const providerConfig = useProviderStore.getState().getProviderConfig('openrouter');
    return providerConfig?.apiKey || null;
  }

  /**
   * 获取基础URL
   */
  private getBaseUrl(): string | null {
    // 从供应商配置中获取基础URL
    const providerConfig = useProviderStore.getState().getProviderConfig('openrouter');
    return providerConfig?.baseUrl || null;
  }
} 