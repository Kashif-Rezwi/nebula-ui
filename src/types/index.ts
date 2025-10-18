// AI SDK v5 UIMessage type with typed metadata
import type { UIMessage as BaseUIMessage } from '@ai-sdk/react';

export interface UIMessage extends BaseUIMessage {
  metadata?: {
    createdAt?: string;
    [key: string]: unknown;
  };
}

// Auth Types
export interface User {
    id: string;
    email: string;
    credits: number;
  }
  
  export interface AuthResponse {
    accessToken: string;
    user: User;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    email: string;
    password: string;
  }
  
  // Conversation Types
  export interface Conversation {
    id: string;
    title: string;
    systemPrompt?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
  }
  
  export interface ConversationWithMessages extends Conversation {
    messages: Message[];
  }
  
  // Streaming Types
  export interface StreamChunk {
    delta: string;
    isComplete: boolean;
  }
  
  // Component Props Types
  export interface ChatAreaProps {
    conversationId?: string;
  }
  
  export interface SidebarProps {
    currentConversationId?: string;
    onConversationCreated?: () => void;
  }
  
  export interface ProtectedRouteProps {
    children: React.ReactNode;
  }