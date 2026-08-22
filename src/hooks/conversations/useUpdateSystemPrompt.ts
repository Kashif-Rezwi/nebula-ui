import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../../services/conversation.service';
import { toast } from '../../utils/toast';
import { conversationKeys } from './keys';
import type { Conversation, ConversationWithMessages } from '../../types';

export function useUpdateSystemPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, systemPrompt }: { id: string; systemPrompt: string }) =>
      conversationService.updateSystemPrompt(id, systemPrompt),

    onMutate: async ({ id, systemPrompt }) => {
      await queryClient.cancelQueries({ queryKey: conversationKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });

      const previousConversation = queryClient.getQueryData<ConversationWithMessages>(
        conversationKeys.detail(id)
      );
      const previousConversations = queryClient.getQueryData<Conversation[]>(
        conversationKeys.lists()
      );

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
        (old: Conversation[] | undefined) => {
          if (!Array.isArray(old)) return [];
          return old.map((conv) => (conv.id === id ? { ...conv, systemPrompt } : conv));
        }
      );

      return { previousConversation, previousConversations };
    },

    onSuccess: (updatedConversation, { id }) => {
      queryClient.setQueryData(conversationKeys.detail(id), updatedConversation);

      queryClient.setQueryData(
        conversationKeys.lists(),
        (old: Conversation[] | undefined) => {
          if (!Array.isArray(old)) return [updatedConversation];
          return old.map((conv) => (conv.id === id ? updatedConversation : conv));
        }
      );

      toast.success('Instructions updated');
    },

    onError: (error: Error, { id }, context) => {
      if (context?.previousConversation) {
        queryClient.setQueryData(conversationKeys.detail(id), context.previousConversation);
      }
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationKeys.lists(), context.previousConversations);
      }
      toast.error(error.message || 'Failed to update instructions');
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}