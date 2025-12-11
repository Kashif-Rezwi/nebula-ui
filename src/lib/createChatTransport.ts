import { DefaultChatTransport } from "ai";
import { API_CONFIG } from "../constants";
import { storage } from "../utils";
import type { OperationalMode } from "../types";

export function createChatTransport(conversationId: string) {
    if (!conversationId) {
        throw new Error("Conversation ID is required");
    }

    return new DefaultChatTransport({
        api: `${API_CONFIG.BASE_URL}/chat/conversations/${conversationId}/messages`,
        headers: () => {
            const token = storage.getToken();
            return {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            };
        },
        credentials: "include",
        prepareSendMessagesRequest: ({ messages }) => {
            // Read current mode from localStorage safely when sending message
            let currentMode: OperationalMode | null = null;
            try {
                const modeKey = `conversation_mode_${conversationId}`;
                currentMode = localStorage.getItem(modeKey) as OperationalMode | null;
            } catch (e) {
                console.warn('[Chat Transport] LocalStorage access failed:', e);
            }

            return {
                body: {
                    messages,
                    // Include mode if user has selected one
                    ...(currentMode && { modeOverride: currentMode })
                }
            };
        },
    });
}
