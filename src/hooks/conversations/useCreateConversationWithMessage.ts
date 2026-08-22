import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../../services/conversation.service';
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
import type { CreateConversationParams, CreateConversationResponse } from '../../types';

export function useCreateConversationWithMessage() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateConversationResponse,
    Error,
    CreateConversationParams,
    { previousConversations: unknown }
  >({
    mutationFn: (params) => conversationService.createConversationWithMessage(params),

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
      const realConversation = createConversationFromResponse(data);

      // Replace temp with real conversation
      replaceTempConversation(queryClient, realConversation);

      // Pre-cache conversation detail to avoid extra API call
      preCacheConversationDetail(queryClient, realConversation);
    },

    onError: (error: Error, _, context) => {
      rollbackConversations(
        queryClient,
        context?.previousConversations as import('../../types').Conversation[] | undefined
      );
      toast.error(error.message || 'Failed to create conversation');
    },
  });
}