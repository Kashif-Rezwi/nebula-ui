import { useQuery } from '@tanstack/react-query';
import { conversationService } from '../../services/conversation.service';
import { conversationKeys } from './keys';
import type { Conversation } from '../../types';

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: conversationKeys.lists(),
    queryFn: conversationService.getConversations,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes
  });
}