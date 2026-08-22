import { api, getErrorMessage } from './api';
import type {
  Conversation,
  ConversationWithMessages,
  CreateConversationParams,
  CreateConversationResponse,
} from '../types';

export const conversationService = {
  createConversationWithMessage: async (
    data: CreateConversationParams
  ): Promise<CreateConversationResponse> => {
    try {
      const response = await api.post<CreateConversationResponse>(
        '/chat/conversations/with-message',
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await api.get<Conversation[]>('/chat/conversations');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getConversation: async (id: string): Promise<ConversationWithMessages> => {
    try {
      const response = await api.get<ConversationWithMessages>(`/chat/conversations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  updateConversation: async (
    id: string,
    data: Partial<Conversation>
  ): Promise<Conversation> => {
    try {
      const response = await api.patch<Conversation>(`/chat/conversations/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  deleteConversation: async (id: string): Promise<void> => {
    try {
      await api.delete(`/chat/conversations/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  generateTitle: async (id: string, message: string): Promise<string> => {
    try {
      const response = await api.post<{ title: string }>(
        `/chat/conversations/${id}/generate-title`,
        { message }
      );
      return response.data.title;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  updateSystemPrompt: async (
    id: string,
    systemPrompt: string
  ): Promise<Conversation> => {
    try {
      const response = await api.put<Conversation>(
        `/chat/conversations/${id}/system-prompt`,
        { systemPrompt }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
