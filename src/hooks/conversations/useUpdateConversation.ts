import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../../services/conversation.service';
import { toast } from '../../utils/toast';
import { conversationKeys } from './keys';
import type { Conversation, ConversationWithMessages } from '../../types';

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Conversation> }) =>
      conversationService.updateConversation(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: conversationKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });

      const previousConversation = queryClient.getQueryData<ConversationWithMessages>(
        conversationKeys.detail(id)
      );
      const previousConversations = queryClient.getQueryData<Conversation[]>(
        conversationKeys.lists()
      );

      // Optimistically update the conversation detail
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
          return old.map((conv) => (conv.id === id ? { ...conv, ...data } : conv));
        }
      );

      return { previousConversation, previousConversations };
    },

    onError: (error: Error, { id }, context) => {
      if (context?.previousConversation) {
        queryClient.setQueryData(conversationKeys.detail(id), context.previousConversation);
      }
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationKeys.lists(), context.previousConversations);
      }
      toast.error(error.message || 'Failed to update conversation');
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}