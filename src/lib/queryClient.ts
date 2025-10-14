import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Cache data for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Only retry once on failure
      retry: 1,
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Retry after 1 second on failure
      retryDelay: 1000,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      retryDelay: 1000,
    },
  },
});