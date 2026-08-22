import { useQuery } from '@tanstack/react-query';
import { conversationService } from '../../services/conversation.service';
import { conversationKeys } from './keys';
import type { ConversationWithMessages } from '../../types';

export function useConversation(conversationId: string | undefined) {
  return useQuery<ConversationWithMessages>({
    queryKey: conversationKeys.detail(conversationId!),
    queryFn: () => conversationService.getConversation(conversationId!),
    enabled: Boolean(conversationId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,    // 5 minutes
  });
}