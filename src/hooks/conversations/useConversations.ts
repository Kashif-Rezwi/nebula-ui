import { useQuery } from '@tanstack/react-query';
import { conversationsApi } from '../../lib/conversations';
import { conversationKeys } from './keys';

// Hook to get all conversations for the current user
// Returns conversations sorted by updatedAt (most recent first)
export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.lists(),
    queryFn: conversationsApi.getConversations,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10,   // Keep in cache for 10 minutes
  });
}