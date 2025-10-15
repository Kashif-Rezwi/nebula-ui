import { DefaultChatTransport } from "ai";
import { API_CONFIG } from "../constants";
import { storage } from "../utils";

export function createChatTransport(conversationId: string) {
    const token = storage.getToken();

    console.log("🧠 createChatTransport file LOADED in build:", new Date().toISOString());

    return new DefaultChatTransport({
        api: `${API_CONFIG.BASE_URL}/chat/conversations/${conversationId}/messages`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        prepareSendMessagesRequest: ({ messages, id, trigger }) => {
            console.log("📤 OUTGOING PAYLOAD:", { messages, id, trigger });
            return { 
                body: { messages, id, trigger }, 
                credentials: "include"
            };
        },
    });
}
