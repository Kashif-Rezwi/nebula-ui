// AI SDK v5 UIMessage type with typed metadata
import type { UIMessage as BaseUIMessage } from '@ai-sdk/react';

// Operational Mode Types
export type OperationalMode = 'fast' | 'thinking' | 'auto';
export type EffectiveMode = 'fast' | 'thinking' | 'vision';

export interface UIMessage extends Omit<BaseUIMessage, 'parts'> {
  parts: (TextPart | ImagePart | FilePart | ToolInvocationPart)[];
  metadata?: {
    createdAt?: string;
    toolCalls?: ToolCall[];
    sources?: WebSearchSource[];
    // NEW: Mode information
    operationalMode?: OperationalMode;     // What was requested ('fast' | 'thinking' | 'auto')
    effectiveMode?: EffectiveMode;         // What was actually used
    modelUsed?: string;                    // AI model name
    tokensUsed?: number;                   // Token count
    temperature?: number;                  // Temperature setting
    [key: string]: unknown;
  };
}

export type TextPart = { type: 'text'; text: string };

export type ImagePart = { 
  type: 'image'; 
  image: string | URL; // Base64 data URL or HTTP URL 
};

export type ToolInvocationPart = {
    type: 'tool-invocation';
    toolInvocation: {
        toolCallId: string;
        toolName: string;
        args: unknown;
        state: 'call' | 'result';
        result?: unknown;
    };
};

// Custom part for our backend (mapped to text/context on server)
export type FilePart = { 
  type: 'file'; 
  text: string; // Client-side preview text (e.g. filename)
  attachmentId: string; // ID returned from upload endpoint
  fileType: 'pdf' | 'docx'; // For UI icons
};

// Attachment Types for Multi-Modal Messages
export interface Attachment {
  id: string;                    // Frontend temporary ID (use crypto.randomUUID())
  file: File;                    // Original File object
  previewUrl: string;            // Blob URL for local preview
  uploadedUrl?: string;          // Server URL after upload
  attachmentId?: string;         // Backend Attachment entity ID (from server)
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress?: number;             // Upload progress (0-100)
  error?: string;                // Error message if failed
  type: 'image' | 'file';        // Type of attachment
}

// Validation Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
] as const;

export const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES] as const;


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
  parts?: any[]; // Allow parts from backend
  createdAt: string;
  metadata?: {
    // NEW: Mode information
    operationalMode?: OperationalMode;     // What was requested ('fast' | 'thinking' | 'auto')
    effectiveMode?: 'fast' | 'thinking';   // What was actually used
    modelUsed?: string;                    // AI model name
    tokensUsed?: number;                   // Token count
    temperature?: number;                  // Temperature setting

    toolCalls?: Array<{
      type: string;
      toolName?: string;
      state: 'pending' | 'output-available' | 'output-error';
      output?: any;
      errorText?: string;
      args?: any;
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