import { useState, useEffect, useCallback } from 'react';
import type { OperationalMode, Conversation } from '../types';

// Safe localStorage wrapper to prevent crashes in private mode or restricted environments
const safeStorage = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('[Session] LocalStorage access failed:', e);
            return null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('[Session] LocalStorage write failed:', e);
        }
    }
};

/**
 * Custom hook for managing conversation operational mode
 * 
 * Features:
 * - Persistent storage with error handling
 * - Optimized sync logic
 * - Priority: localStorage → Server → 'auto'
 */
export function useConversationMode(
    conversationId: string | undefined,
    conversation?: Conversation
) {
    const [currentMode, setCurrentMode] = useState<OperationalMode>('auto');

    // Stable key generator
    const getModeKey = useCallback((id: string) => `conversation_mode_${id}`, []);

    // 1. Navigation Handler: Restore state when conversationId changes
    // We removed conversation.operationalMode from deps to prevent re-runs on data refresh
    useEffect(() => {
        if (conversationId) {
            const storedMode = safeStorage.getItem(getModeKey(conversationId)) as OperationalMode;

            if (storedMode) {
                // Instant restore from local cache
                setCurrentMode(storedMode);
            }
            // Note: We don't fallback to server here to avoid dependency on conversation object
            // The Sync Listener below handles the server fallback if local is empty
        } else {
            // Reset for new conversation
            setCurrentMode('auto');
        }
    }, [conversationId, getModeKey]);

    // 2. Sync Listener: Syncs with server data when it arrives
    useEffect(() => {
        if (conversation?.operationalMode && conversationId) {
            const serverMode = conversation.operationalMode;
            const localMode = safeStorage.getItem(getModeKey(conversationId)) as OperationalMode;

            // Sync if we have server data but no local data (first load on new device)
            // OR if we want to ensure eventual consistency (optional, sticking to user preference usually)
            if (!localMode && serverMode) {
                safeStorage.setItem(getModeKey(conversationId), serverMode);
                setCurrentMode(serverMode);
            }

            // Optional debug: log if there's a mismatch but we're keeping local
            if (localMode && serverMode && localMode !== serverMode) {
                // User has a specific local override active, we respect it
            }
        }
    }, [conversation?.operationalMode, conversationId, getModeKey]);

    /**
     * Update the operational mode
     */
    const setMode = useCallback((newMode: OperationalMode) => {
        setCurrentMode(newMode);

        if (conversationId) {
            safeStorage.setItem(getModeKey(conversationId), newMode);
        }
    }, [conversationId, getModeKey]);

    /**
     * Initialize mode for a newly created conversation
     */
    const initializeModeForConversation = useCallback((newConversationId: string, mode: OperationalMode) => {
        safeStorage.setItem(getModeKey(newConversationId), mode);
        setCurrentMode(mode);
    }, [getModeKey]);

    return {
        currentMode,
        setMode,
        initializeModeForConversation,
    };
}
