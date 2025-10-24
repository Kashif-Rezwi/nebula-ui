import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '../../lib/conversations';
import { toast } from '../../utils/toast';
import { conversationKeys } from './keys';
import type { Conversation, ConversationWithMessages } from '../../types';

// Hook to update a conversation (e.g., title, system prompt)
// Uses optimistic updates for better UX
export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Conversation> }) =>
      conversationsApi.updateConversation(id, data),

    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: conversationKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });

      // Snapshot the previous values
      const previousConversation = queryClient.getQueryData(conversationKeys.detail(id));
      const previousConversations = queryClient.getQueryData(conversationKeys.lists());

      // Optimistically update the conversation
      queryClient.setQueryData(
        conversationKeys.detail(id),
        (old: ConversationWithMessages | undefined) => {
          if (!old) return old;
          return { ...old, ...data };
        }
      );

      // Also update in the list
      queryClient.setQueryData(
        conversationKeys.lists(),
        (old: Conversation[] = []) => {
          return old.map(conv => 
            conv.id === id ? { ...conv, ...data } : conv
          );
        }
      );

      return { previousConversation, previousConversations };
    },

    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousConversation) {
        queryClient.setQueryData(conversationKeys.detail(id), context.previousConversation);
      }
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationKeys.lists(), context.previousConversations);
      }
      toast.error(error.message || 'Failed to update conversation');
    },

    onSettled: (_, __, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}