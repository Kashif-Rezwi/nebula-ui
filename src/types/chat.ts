import type { UIMessage as BaseUIMessage } from '@ai-sdk/react';

// Operational Mode Types
export type OperationalMode = 'fast' | 'thinking' | 'auto';
export type EffectiveMode = 'fast' | 'thinking' | 'vision';

export type TextPart = {
  type: 'text';
  text: string;
};

export type ImagePart = {
  type: 'image';
  image: string | URL;
  url?: string;
  attachmentId?: string;
};

export type FilePart = {
  type: 'file';
  text: string;
  attachmentId: string;
  fileType?: 'pdf' | 'docx' | string;
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

export type DynamicToolPart = {
  type: 'dynamic-tool' | `tool-${string}`;
  toolName?: string;
  state?: 'pending' | 'output-available' | 'output-error';
  args?: Record<string, unknown>;
  output?: unknown;
  errorText?: string;
};

export type MessagePart = TextPart | ImagePart | FilePart | ToolInvocationPart | DynamicToolPart;

export interface ToolCall {
  id?: string;
  name?: string;
  type?: string;
  args?: Record<string, unknown>;
  status?: 'pending' | 'success' | 'error';
  result?: unknown;
  error?: string;
  timestamp?: string;
}

export interface WebSearchSource {
  title: string;
  url: string;
  snippet: string;
  favicon: string;
  relevanceScore: number;
}

export interface SearchCitation {
  text: string;
  sourceIndex: number;
  url: string;
}

export interface SearchSummary {
  text: string;
  citations: SearchCitation[];
}

export interface ToolCallMessageMetadata {
  toolCalls?: ToolCall[];
  sources?: WebSearchSource[];
}

export interface UIMessageMetadata {
  createdAt?: string;
  toolCalls?: ToolCall[];
  sources?: WebSearchSource[];
  operationalMode?: OperationalMode;
  effectiveMode?: EffectiveMode;
  modelUsed?: string;
  tokensUsed?: number;
  temperature?: number;
  [key: string]: unknown;
}

export interface UIMessage extends Omit<BaseUIMessage, 'parts'> {
  parts: MessagePart[];
  metadata?: UIMessageMetadata;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content?: string;
  parts?: MessagePart[];
  createdAt: string;
  metadata?: UIMessageMetadata;
}

// Attachment Types for Multi-Modal Messages
export interface Attachment {
  id: string;
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
  attachmentId?: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress?: number;
  error?: string;
  type: 'image' | 'file';
}

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
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES] as const;

export interface ChatRouterState {
  shouldAutoTrigger?: boolean;
}
