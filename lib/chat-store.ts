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

// 对话类型
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// 聊天状态接口
interface ChatState {
  // 所有对话
  conversations: Conversation[];
  // 当前活动对话ID
  activeConversationId: string | null;
  // 添加新对话
  createConversation: (title?: string) => string;
  // 添加消息到当前对话
  addMessage: (message: Omit<Message, 'id'>) => void;
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
}

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// 创建聊天状态存储
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,

      // 创建新对话
      createConversation: (title) => {
        const id = generateId();
        const newConversation: Conversation = {
          id,
          title: title || `新对话 ${new Date().toLocaleString()}`,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: id,
        }));

        return id;
      },

      // 添加消息到当前对话
      addMessage: (message) => {
        const { activeConversationId, conversations } = get();
        
        if (!activeConversationId) {
          const newId = get().createConversation();
          set({ activeConversationId: newId });
        }

        set((state) => {
          const newMessage: Message = {
            ...message,
            id: generateId(),
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

              return {
                ...conv,
                messages: [...conv.messages, newMessage],
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
    }),
    {
      name: STORAGE_KEYS.CHAT,
    }
  )
); 