import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { conversationService } from '../../services/conversation.service';
import { toast } from '../../utils/toast';
import { ROUTES } from '../../constants';
import { conversationKeys } from './keys';
import type { Conversation } from '../../types';

export function useDeleteConversation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deletedId: string) => conversationService.deleteConversation(deletedId),

    onMutate: async (deletedId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });

      // Snapshot the previous value
      const previousConversations = queryClient.getQueryData<Conversation[]>(conversationKeys.lists());

      // Optimistically remove from the list
      queryClient.setQueryData(
        conversationKeys.lists(),
        (old: Conversation[] = []) => old.filter((conv) => conv.id !== deletedId)
      );

      // Remove from cache
      queryClient.removeQueries({ queryKey: conversationKeys.detail(deletedId) });

      return { previousConversations, deletedId };
    },

    onSuccess: (_, deletedId) => {
      toast.success('Conversation deleted');

      // If we deleted the current conversation, navigate to new chat UI
      const currentPath = window.location.pathname;
      if (currentPath.includes(deletedId)) {
        navigate(ROUTES.NEW);
      }
    },

    onError: (error: Error, _, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationKeys.lists(), context.previousConversations);
      }
      toast.error(error.message || 'Failed to delete conversation');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}