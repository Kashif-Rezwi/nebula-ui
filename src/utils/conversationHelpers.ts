import type { Conversation } from '../types';

// Generate a unique temporary conversation ID
export function generateTempId(): string {
  return `temp-${Date.now()}`;
}

// Check if a conversation ID is temporary
export function isTempConversation(id: string): boolean {
  return id.startsWith('temp-');
}

// Create a temporary conversation object for optimistic updates
export function createTempConversation(params?: {
  title?: string;
  systemPrompt?: string;
}): Conversation {
  return {
    id: generateTempId(),
    title: params?.title || 'Untitled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...(params?.systemPrompt && { systemPrompt: params.systemPrompt }),
  };
}

// Create a real conversation object from API response
export function createConversationFromResponse(data: {
  id: string;
  title: string;
  systemPrompt?: string;
  createdAt: string;
  updatedAt: string;
}): Conversation {
  return {
    id: data.id,
    title: data.title,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    ...(data.systemPrompt && { systemPrompt: data.systemPrompt }),
  };
}