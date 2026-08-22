import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../../services/conversation.service';
import { conversationKeys } from './keys';
import type { Conversation, ConversationWithMessages } from '../../types';

export function useGenerateTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      conversationService.generateTitle(conversationId, message),

    onSuccess: (title, { conversationId }) => {
      // Update conversation detail cache
      queryClient.setQueryData(
        conversationKeys.detail(conversationId),
        (old: ConversationWithMessages | undefined) => {
          if (!old) return old;
          return { ...old, title };
        }
      );

      // Update conversations list cache
      queryClient.setQueryData(
        conversationKeys.lists(),
        (old: Conversation[] = []) => {
          return old.map((conv) => (conv.id === conversationId ? { ...conv, title } : conv));
        }
      );
    },

    onError: (error: Error) => {
      console.error('Failed to generate title:', error);
    },
  });
}