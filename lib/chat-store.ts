import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './config';

// 消息类型
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// 对话设置类型
export interface ConversationSettings {
  providerId?: string; 
  modelId?: string;
  systemPrompt?: string;
  maxTurns?: number;
  temperature?: number;
  maxTokens?: number;
}

// 对话类型
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  providerId?: string; // 使用的AI供应商ID
  modelId?: string;    // 使用的模型ID
  systemPrompt?: string; // 系统提示词
  maxTurns?: number;   // 保留的对话轮数
  temperature?: number; // 模型温度，控制创造性
  maxTokens?: number;  // 生成的最大token数
}

// 聊天状态类型
export type ChatStatus = 'idle' | 'loading' | 'streaming' | 'success' | 'error';

// 聊天状态接口
interface ChatState {
  // 所有对话
  conversations: Conversation[];
  // 当前活动对话ID
  activeConversationId: string | null;
  // 全局默认对话设置
  defaultSettings: ConversationSettings;
  
  // 聊天状态相关
  chatStatus: ChatStatus;
  streamingMessageId: string | null;
  lastError: string | null;
  abortController: AbortController | null;
  
  // 添加新对话
  createConversation: (title?: string) => string;
  // 添加消息到当前对话
  addMessage: (message: Omit<Message, 'id'>) => string;
  // 设置活动对话
  setActiveConversation: (conversationId: string) => void;
  // 获取当前活动对话
  getActiveConversation: () => Conversation | undefined;
  // 删除对话
  deleteConversation: (conversationId: string) => void;
  // 清空所有对话
  clearAllConversations: () => void;
  // 更新对话标题
  updateConversationTitle: (conversationId: string, title: string) => void;
  // 更新对话设置
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  // 更新对话设置
  updateConversationSettings: (
    conversationId: string, 
    settings: ConversationSettings
  ) => void;
  // 获取默认设置
  getDefaultSettings: () => ConversationSettings;
  
  // 状态管理方法
  setChatStatus: (status: ChatStatus) => void;
  setStreamingMessageId: (messageId: string | null) => void;
  setLastError: (error: string | null) => void;
  setAbortController: (controller: AbortController | null) => void;
  abortChat: () => void;
}

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// 创建聊天状态存储
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      defaultSettings: {}, // 初始化默认设置为空对象
      
      // 聊天状态相关初始值
      chatStatus: 'idle',
      streamingMessageId: null,
      lastError: null,
      abortController: null,

      // 创建新对话
      createConversation: (title) => {
        const id = generateId();
        const defaultSettings = get().defaultSettings;
        
        const newConversation: Conversation = {
          id,
          title: title || `新对话 ${new Date().toLocaleString()}`,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...defaultSettings, // 应用默认设置到新对话
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: id,
        }));

        return id;
      },

      // 添加消息到当前对话，返回新消息的ID
      addMessage: (message) => {
        const { activeConversationId, conversations } = get();
        
        if (!activeConversationId) {
          const newId = get().createConversation();
          set({ activeConversationId: newId });
        }

        const newMessageId = generateId();
        
        set((state) => {
          const newMessage: Message = {
            ...message,
            id: newMessageId,
          };

          const updatedConversations = state.conversations.map((conv) => {
            if (conv.id === state.activeConversationId) {
              // 如果对话标题是默认的，并且这是第一条用户消息，则使用消息内容作为标题
              let title = conv.title;
              if (
                conv.messages.length === 0 && 
                message.role === 'user' && 
                title.startsWith('新对话')
              ) {
                // 截取消息的前20个字符作为标题
                title = message.content.length > 20 
                  ? `${message.content.substring(0, 20)}...` 
                  : message.content;
              }

              // 如果设置了maxTurns，则限制消息数量
              let messages = [...conv.messages, newMessage];
              if (conv.maxTurns && conv.maxTurns > 0 && messages.length > conv.maxTurns * 2) {
                // 保留最新的对话轮数（每轮包含用户和助手各一条消息）
                messages = messages.slice(-conv.maxTurns * 2);
              }

              return {
                ...conv,
                messages,
                updatedAt: Date.now(),
                title,
              };
            }
            return conv;
          });

          return {
            conversations: updatedConversations,
          };
        });
        
        return newMessageId;
      },

      // 设置活动对话
      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });
      },

      // 获取当前活动对话
      getActiveConversation: () => {
        const { activeConversationId, conversations } = get();
        return conversations.find((conv) => conv.id === activeConversationId);
      },

      // 获取默认设置
      getDefaultSettings: () => {
        return get().defaultSettings;
      },

      // 删除对话
      deleteConversation: (conversationId) => {
        set((state) => {
          const filteredConversations = state.conversations.filter(
            (conv) => conv.id !== conversationId
          );
          
          // 如果删除的是当前活动对话，则设置第一个对话为活动对话
          let newActiveId = state.activeConversationId;
          if (state.activeConversationId === conversationId) {
            newActiveId = filteredConversations.length > 0 ? filteredConversations[0].id : null;
          }
          
          return {
            conversations: filteredConversations,
            activeConversationId: newActiveId,
          };
        });
      },

      // 清空所有对话
      clearAllConversations: () => {
        set({
          conversations: [],
          activeConversationId: null,
        });
      },

      // 更新对话标题
      updateConversationTitle: (conversationId, title) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, title, updatedAt: Date.now() }
              : conv
          ),
        }));
      },

      // 更新对话设置
      updateConversation: (conversationId, updates) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, ...updates, updatedAt: Date.now() }
              : conv
          ),
        }));
      },
      
      // 更新对话设置专用方法
      updateConversationSettings: (conversationId, settings) => {
        // 同时更新全局默认设置和当前对话设置
        set((state) => ({
          defaultSettings: { ...settings }, // 更新默认设置
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? { 
                  ...conv, 
                  ...settings,
                  updatedAt: Date.now() 
                }
              : conv
          ),
        }));
      },
      
      // 状态管理方法
      setChatStatus: (status) => set({ chatStatus: status }),
      setStreamingMessageId: (messageId) => set({ streamingMessageId: messageId }),
      setLastError: (error) => set({ lastError: error }),
      setAbortController: (controller) => set({ abortController: controller }),
      abortChat: () => {
        const controller = get().abortController;
        if (controller) {
          controller.abort();
          set({ abortController: null });
        }
        set({ chatStatus: 'idle', streamingMessageId: null });
      },
    }),
    {
      name: STORAGE_KEYS.CHAT,
      // 仅保存需要持久化的状态，忽略临时状态
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        defaultSettings: state.defaultSettings,
      }),
    }
  )
); 