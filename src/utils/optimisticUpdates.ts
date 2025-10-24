import { QueryClient } from '@tanstack/react-query';
import { conversationKeys } from '../hooks/useConversations';
import type { Conversation } from '../types';
import { isTempConversation } from './conversationHelpers';

// Add a conversation to the list optimistically
export function addConversationOptimistically(
  queryClient: QueryClient,
  conversation: Conversation
): Conversation[] | undefined {
  // Get previous conversations for rollback
  const previousConversations = queryClient.getQueryData<Conversation[]>(
    conversationKeys.lists()
  );

  // Add new conversation to the top of the list
  queryClient.setQueryData<Conversation[]>(
    conversationKeys.lists(),
    (old = []) => [conversation, ...old]
  );

  return previousConversations;
}

// Replace a temporary conversation with the real one from the server
export function replaceTempConversation(
  queryClient: QueryClient,
  realConversation: Conversation
): void {
  queryClient.setQueryData<Conversation[]>(
    conversationKeys.lists(),
    (old = []) => {
      return old.map(conv => 
        isTempConversation(conv.id) ? realConversation : conv
      );
    }
  );
}

// Remove a conversation from the list optimistically
export function removeConversationOptimistically(
  queryClient: QueryClient,
  conversationId: string
): Conversation[] | undefined {
  // Get previous conversations for rollback
  const previousConversations = queryClient.getQueryData<Conversation[]>(
    conversationKeys.lists()
  );

  // Remove conversation from list
  queryClient.setQueryData<Conversation[]>(
    conversationKeys.lists(),
    (old = []) => old.filter(conv => conv.id !== conversationId)
  );

  return previousConversations;
}

// Rollback conversations list to previous state
export function rollbackConversations(
  queryClient: QueryClient,
  previousConversations?: Conversation[]
): void {
  if (previousConversations) {
    queryClient.setQueryData(
      conversationKeys.lists(),
      previousConversations
    );
  }
}

// Pre-populate conversation detail cache (avoids extra API call)
export function preCacheConversationDetail(
  queryClient: QueryClient,
  conversation: Conversation
): void {
  queryClient.setQueryData(
    conversationKeys.detail(conversation.id),
    {
      ...conversation,
      messages: [], // Empty messages array - will be loaded when needed
    }
  );
}