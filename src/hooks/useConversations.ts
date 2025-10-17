import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { conversationsApi } from '../lib/conversations';
import { ROUTES, MESSAGES } from '../constants';
import { toast } from '../utils/toast';
import type { Conversation, ConversationWithMessages } from '../types';

// Query Keys Factory
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters?: string) => [...conversationKeys.lists(), { filters }] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
};

// Hook to get all conversations
export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.lists(),
    queryFn: conversationsApi.getConversations,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });
}

// Hook to get single conversation with messages
export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId!),
    queryFn: () => conversationsApi.getConversation(conversationId!),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });
}

// Hook to create conversation
export function useCreateConversation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string) => conversationsApi.createConversation(title),
    onMutate: async (title) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });

      // Snapshot the previous value
      const previousConversations = queryClient.getQueryData(conversationKeys.lists());

      // Optimistically update to the new value
      const tempConversation: Conversation = {
        id: `temp-${Date.now()}`,
        title: title || 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(conversationKeys.lists(), (old: Conversation[] = []) => {
        return [tempConversation, ...old];
      });

      // Return a context object with the snapshotted value
      return { previousConversations };
    },
    onSuccess: (newConversation) => {
      // Replace temp conversation with real one
      queryClient.setQueryData(conversationKeys.lists(), (old: Conversation[] = []) => {
        return old.map(conv => 
          conv.id.startsWith('temp-') ? newConversation : conv
        );
      });
      
      // Navigate to new conversation
      navigate(ROUTES.CHAT_WITH_ID(newConversation.id));
      toast.success('New conversation created');
    },
    onError: (error: Error, _, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationKeys.lists(), context.previousConversations);
      }
      toast.error(error.message || 'Failed to create conversation');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

// Hook to update conversation
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
      queryClient.setQueryData(conversationKeys.detail(id), (old: ConversationWithMessages | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      // Also update in the list
      queryClient.setQueryData(conversationKeys.lists(), (old: Conversation[] = []) => {
        return old.map(conv => 
          conv.id === id ? { ...conv, ...data } : conv
        );
      });

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

// Hook to delete conversation
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
      queryClient.setQueryData(conversationKeys.lists(), (old: Conversation[] = []) => {
        return old.filter(conv => conv.id !== deletedId);
      });

      // Remove from cache
      queryClient.removeQueries({ queryKey: conversationKeys.detail(deletedId) });

      return { previousConversations, deletedId };
    },
    onSuccess: (_, deletedId) => {
      toast.success('Conversation deleted');
      
      // Get current path
      const currentPath = window.location.pathname;
      if (currentPath.includes(deletedId)) {
        // If we deleted the current conversation, navigate to chat home
        navigate(ROUTES.CHAT);
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

// Consolidated hook for backward compatibility
export function useConversationsManager() {
  const { data: conversations = [], isLoading } = useConversations();
  const { mutate: createConversation, isPending: isCreating } = useCreateConversation();
  const { mutate: deleteConversation, isPending: isDeleting } = useDeleteConversation();
  const { mutate: updateConversation } = useUpdateConversation();

  const handleCreateConversation = (title?: string) => {
    createConversation(title);
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (!confirm(MESSAGES.ERRORS.DELETE_CONFIRM)) {
      return;
    }
    deleteConversation(conversationId);
  };

  const handleUpdateConversation = (id: string, data: Partial<Conversation>) => {
    updateConversation({ id, data });
  };

  return {
    // Data
    conversations,
    
    // Loading states
    loading: isLoading,
    creating: isCreating,
    deleting: isDeleting,
    
    // Actions
    createConversation: handleCreateConversation,
    deleteConversation: handleDeleteConversation,
    updateConversation: handleUpdateConversation,
  };
}

// Hook to generate title for conversation
export function useGenerateTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      conversationsApi.generateTitle(conversationId, message),
    
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
          return old.map((conv) =>
            conv.id === conversationId ? { ...conv, title } : conv
          );
        }
      );
    },
    
    onError: (error: Error) => {
      console.error('Failed to generate title:', error);
    },
  });
}