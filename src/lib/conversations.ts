import { api } from './api';
import type { Conversation, ConversationWithMessages } from '../types';

export const conversationsApi = {
  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  // Get single conversation with messages
  getConversation: async (id: string): Promise<ConversationWithMessages> => {
    const response = await api.get(`/chat/conversations/${id}`);
    return response.data;
  },

  // Create new conversation
  createConversation: async (title?: string): Promise<Conversation> => {
    const response = await api.post('/chat/conversations', { title });
    return response.data;
  },

  // Delete conversation
  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/chat/conversations/${id}`);
  },
};