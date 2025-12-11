import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { toast } from '../../utils/toast';
import { conversationKeys } from './keys';
import {
  createTempConversation,
  createConversationFromResponse,
} from '../../utils/conversationHelpers';
import {
  addConversationOptimistically,
  replaceTempConversation,
  rollbackConversations,
  preCacheConversationDetail,
} from '../../utils/optimisticUpdates';

interface CreateConversationWithMessageParams {
  title?: string;
  firstMessage: string;
  systemPrompt?: string;
  operationalMode?: string;
}

interface CreateConversationResponse {
  id: string;
  title: string;
  systemPrompt?: string;
  operationalMode?: string;
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

      // Create temp conversation
      const tempConversation = createTempConversation({
        title: params.title,
        systemPrompt: params.systemPrompt,
      });

      // Add optimistically and get previous state for rollback
      const previousConversations = addConversationOptimistically(
        queryClient,
        tempConversation
      );

      return { previousConversations };
    },

    onSuccess: (data) => {
      // Create real conversation from API response
      const realConversation = createConversationFromResponse(data);

      // Replace temp with real conversation
      replaceTempConversation(queryClient, realConversation);

      // Pre-cache conversation detail to avoid extra API call
      preCacheConversationDetail(queryClient, realConversation);
    },

    onError: (error: Error, _, context) => {
      // Rollback to previous state
      rollbackConversations(queryClient, context?.previousConversations);
      toast.error(error.message || 'Failed to create conversation');
    },
  });
}