import { useQuery } from '@tanstack/react-query';
import { conversationsApi } from '../../lib/conversations';
import { conversationKeys } from './keys';

// Hook to get a single conversation with all its messages
export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId!),
    queryFn: () => conversationsApi.getConversation(conversationId!),
    enabled: !!conversationId,  // Only fetch if ID exists
    staleTime: 1000 * 60 * 2,   // Consider fresh for 2 minutes
    gcTime: 1000 * 60 * 5,      // Keep in cache for 5 minutes
  });
}