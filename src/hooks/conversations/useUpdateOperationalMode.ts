import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '../../lib/conversations';
import { toast } from '../../utils/toast';
import { conversationKeys } from './keys';
import type { OperationalMode } from '../../types';

/**
 * Hook to update operational mode for a conversation
 * Simplified version without optimistic updates for better maintainability
 */
export function useUpdateOperationalMode() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, operationalMode }: { id: string; operationalMode: OperationalMode }) =>
            conversationsApi.updateOperationalMode(id, operationalMode),

        onSuccess: (_, { id }) => {
            // Invalidate and refetch - simple and reliable
            queryClient.invalidateQueries({ queryKey: conversationKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
        },

        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update operational mode');
        },
    });
}
