import { DefaultChatTransport } from "ai";
import { API_CONFIG } from "../constants";
import { storage } from "../utils";

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
            return {
                body: { messages }
            };
        },
    });
}
