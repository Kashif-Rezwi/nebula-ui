import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { conversationsApi } from '../../lib/conversations';
import { toast } from '../../utils/toast';
import { ROUTES } from '../../constants';
import { conversationKeys } from './keys';
import type { Conversation } from '../../types';

// Hook to delete a conversation
// Uses optimistic updates and handles navigation if deleting current conversation
export function useDeleteConversation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: conversationsApi.deleteConversation,

    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });

      // Snapshot the previous value
      const previousConversations = queryClient.getQueryData(conversationKeys.lists());

      // Optimistically remove from the list
      queryClient.setQueryData(
        conversationKeys.lists(),
        (old: Conversation[] = []) => {
          return old.filter(conv => conv.id !== deletedId);
        }
      );

      // Remove from cache
      queryClient.removeQueries({ queryKey: conversationKeys.detail(deletedId) });

      return { previousConversations, deletedId };
    },

    onSuccess: (_, deletedId) => {
      toast.success('Conversation deleted');
      
      // Get current path
      const currentPath = window.location.pathname;
      if (currentPath.includes(deletedId)) {
        // If we deleted the current conversation, navigate to new chat UI
        navigate(ROUTES.NEW);
      }
    },

    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationKeys.lists(), context.previousConversations);
      }
      toast.error(error.message || 'Failed to delete conversation');
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}