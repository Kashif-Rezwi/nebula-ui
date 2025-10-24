// Query Keys Factory for React Query
// Centralized place for all conversation-related query keys
export const conversationKeys = {
    all: ['conversations'] as const,
    lists: () => [...conversationKeys.all, 'list'] as const,
    list: (filters?: string) => [...conversationKeys.lists(), { filters }] as const,
    details: () => [...conversationKeys.all, 'detail'] as const,
    detail: (id: string) => [...conversationKeys.details(), id] as const,
  };