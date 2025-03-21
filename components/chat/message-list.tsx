'use client';

import React, { useEffect, useRef } from 'react';
import { useChatStore, Message } from '@/lib/chat-store';
import { Bot, Sparkles } from 'lucide-react';

export function MessageList() {
  const { getActiveConversation } = useChatStore();
  const conversation = getActiveConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 消息滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 当消息列表变化时，滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  // 如果没有对话，则显示空状态
  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-6">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <h3 className="mb-3 text-2xl font-bold font-display">开始一个新对话</h3>
        <p className="mb-8 max-w-md text-muted-foreground leading-relaxed">
          创建一个新的对话，开始与AI助手交流。您可以询问任何问题，获取帮助或者探索新想法。
        </p>
      </div>
    );
  }

  // 如果对话为空，则显示引导
  if (conversation.messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-6">
          <Bot className="h-12 w-12 text-primary" />
        </div>
        <h3 className="mb-3 text-2xl font-bold font-display">开始对话</h3>
        <p className="mb-8 max-w-md text-muted-foreground leading-relaxed">
          在下方输入框中提出您的问题或者描述您需要帮助的内容。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 md:px-12 lg:px-24 py-6 max-w-4xl mx-auto w-full">
      {conversation.messages.map((message, index) => (
        <MessageItem 
          key={message.id} 
          message={message} 
          isFirst={index === 0}
          isLast={index === conversation.messages.length - 1}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

interface MessageItemProps {
  message: Message;
  isFirst?: boolean;
  isLast?: boolean;
}

function MessageItem({ message, isFirst, isLast }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className="flex items-start">
      <div
        className={`rounded-md px-5 py-3 max-w-[90%] ${
          isUser
            ? 'bg-accent text-accent-foreground border border-accent/50'
            : 'bg-muted text-foreground border border-border/50'
        }`}
      >
        <div className="flex items-center">
          {isUser && (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-foreground/40 text-accent-foreground text-xs mr-2">
              <span className="font-medium">U</span>
            </div>
          )}
          <p className="whitespace-pre-wrap break-words text-base leading-relaxed font-light text-foreground/80">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
} 