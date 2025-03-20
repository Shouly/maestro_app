'use client';

import React from 'react';
import { ChatHeader } from './chat-header';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';

export function ChatContainer() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <ChatHeader />
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>
      <ChatInput />
    </div>
  );
} 