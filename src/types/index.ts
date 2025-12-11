// AI SDK v5 UIMessage type with typed metadata
import type { UIMessage as BaseUIMessage } from '@ai-sdk/react';

// Operational Mode Types
export type OperationalMode = 'fast' | 'thinking' | 'auto';

export interface UIMessage extends BaseUIMessage {
  metadata?: {
    createdAt?: string;
    toolCalls?: ToolCall[];
    sources?: WebSearchSource[];
    operationalMode?: OperationalMode;
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
  operationalMode?: OperationalMode;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  metadata?: {
    operationalMode?: OperationalMode;
    toolCalls?: Array<{
      type: string;
      toolName?: string;
      state: 'pending' | 'output-available' | 'output-error';
      output?: any;
      errorText?: string;
    }>;
    [key: string]: any;
  };
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
  draftSystemPrompt?: string;
  onDraftSystemPromptChange?: (prompt: string) => void;
}

export interface ActionsPanelProps {
  currentConversationId?: string;
  onConversationCreated?: () => void;
}

export interface ActivitiesPanelProps {
  conversationId?: string;
  systemPrompt: string;
  draftSystemPrompt?: string;
  onSaveSystemPrompt: (systemPrompt: string) => void;
  isSavingSystemPrompt: boolean;
}

export interface SystemPromptCardProps {
  systemPrompt: string;
  onSaveSystemPrompt: (systemPrompt: string) => void;
  isSavingSystemPrompt: boolean;
  isDraft?: boolean;
}

export interface SystemPromptModalProps {
  initialInstructions: string;
  onSave: (systemPrompt: string) => void;
  isSaving?: boolean;
  isDraft?: boolean;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface ChatRouterState {
  shouldAutoTrigger?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  args: any;
  status: 'pending' | 'success' | 'error';
  result?: any;
  error?: string;
  timestamp: string;
}

export interface WebSearchSource {
  title: string;
  url: string;
  snippet: string;
  favicon: string;
  relevanceScore: number;
}

export interface SearchSummary {
  text: string;
  citations: Array<{
    text: string;
    sourceIndex: number;
    url: string;
  }>;
}

export interface ToolCallMessageMetadata {
  toolCalls?: ToolCall[];
  sources?: WebSearchSource[];
}