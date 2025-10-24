import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '../../lib/conversations';
import { toast } from '../../utils/toast';
import { conversationKeys } from './keys';
import type { Conversation, ConversationWithMessages } from '../../types';

// Hook to update the system prompt for a conversation
// Uses optimistic updates for better UX
export function useUpdateSystemPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, systemPrompt }: { id: string; systemPrompt: string }) =>
      conversationsApi.updateSystemPrompt(id, systemPrompt),
    
    onMutate: async ({ id, systemPrompt }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: conversationKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });

      // Snapshot previous values
      const previousConversation = queryClient.getQueryData(conversationKeys.detail(id));
      const previousConversations = queryClient.getQueryData(conversationKeys.lists());

      // Optimistically update conversation detail
      queryClient.setQueryData(
        conversationKeys.detail(id),
        (old: ConversationWithMessages | undefined) => {
          if (!old) return old;
          return { ...old, systemPrompt };
        }
      );

      // Optimistically update conversations list
      queryClient.setQueryData(
        conversationKeys.lists(),
        (old: Conversation[] = []) => {
          return old.map((conv) =>
            conv.id === id ? { ...conv, systemPrompt } : conv
          );
        }
      );

      return { previousConversation, previousConversations };
    },
    
    onSuccess: (updatedConversation, { id }) => {
      // Update with real data from server
      queryClient.setQueryData(conversationKeys.detail(id), updatedConversation);
      
      queryClient.setQueryData(
        conversationKeys.lists(),
        (old: Conversation[] = []) => {
          return old.map((conv) =>
            conv.id === id ? updatedConversation : conv
          );
        }
      );
      
      toast.success('Instructions updated');
    },
    
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousConversation) {
        queryClient.setQueryData(conversationKeys.detail(id), context.previousConversation);
      }
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationKeys.lists(), context.previousConversations);
      }
      toast.error(error.message || 'Failed to update instructions');
    },
    
    onSettled: (_, __, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}