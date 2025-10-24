import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from '../utils/toast';
import { conversationKeys } from './useConversations';
import type { Conversation } from '../types';

interface CreateConversationWithMessageParams {
  title?: string;
  firstMessage: string;
  systemPrompt?: string;
}

interface CreateConversationResponse {
  id: string;
  title: string;
  systemPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export function useCreateConversationWithMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateConversationWithMessageParams): Promise<CreateConversationResponse> => {
      const response = await api.post<CreateConversationResponse>(
        '/chat/conversations/with-message',
        params
      );

      return response.data;
    },

    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });

      // Snapshot previous value
      const previousConversations = queryClient.getQueryData(conversationKeys.lists());

      // Optimistically add temp conversation
      const tempConversation: Conversation = {
        id: `temp-${Date.now()}`,
        title: params.title || 'Untitled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(conversationKeys.lists(), (old: Conversation[] = []) => {
        return [tempConversation, ...old];
      });

      return { previousConversations };
    },

    onSuccess: (data) => {
      // Replace temp conversation with real one
      queryClient.setQueryData(conversationKeys.lists(), (old: Conversation[] = []) => {
        return old.map(conv => 
          conv.id.startsWith('temp-') 
            ? {
                id: data.id,
                title: data.title,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                systemPrompt: data.systemPrompt,
              }
            : conv
        );
      });

      // Pre-populate the conversation detail cache with the user message
      // This will be loaded when navigating to the conversation
      queryClient.setQueryData(
        conversationKeys.detail(data.id),
        {
          id: data.id,
          title: data.title,
          systemPrompt: data.systemPrompt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          messages: [], // Will be loaded from backend
        }
      );
    },

    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationKeys.lists(), context.previousConversations);
      }
      toast.error(error.message || 'Failed to create conversation');
    },
  });
}