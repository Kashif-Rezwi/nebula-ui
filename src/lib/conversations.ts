import { api, getErrorMessage } from './api';
import type { Conversation, ConversationWithMessages } from '../types';

export const conversationsApi = {
  // Get all conversations for the current user
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get single conversation with messages
  getConversation: async (id: string): Promise<ConversationWithMessages> => {
    try {
      const response = await api.get(`/chat/conversations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Create new conversation
  createConversation: async (title: string = 'Untitled'): Promise<Conversation> => {
    try {
      const response = await api.post('/chat/conversations', { title });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Update conversation (e.g., title)
  updateConversation: async (id: string, data: Partial<Conversation>): Promise<Conversation> => {
    try {
      const response = await api.patch(`/chat/conversations/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Delete conversation
  deleteConversation: async (id: string): Promise<void> => {
    try {
      await api.delete(`/chat/conversations/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Generate title for conversation
  generateTitle: async (id: string, message: string): Promise<string> => {
    try {
      const response = await api.post(`/chat/conversations/${id}/generate-title`, {
        message,
      });
      return response.data.title;
    } catch (error) {
      console.error('Failed to generate title:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  // Update system prompt for conversation
  updateSystemPrompt: async (id: string, systemPrompt: string): Promise<Conversation> => {
    try {
      const response = await api.put(`/chat/conversations/${id}/system-prompt`, {
        systemPrompt,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update system prompt:', error);
      throw new Error(getErrorMessage(error));
    }
  },
};