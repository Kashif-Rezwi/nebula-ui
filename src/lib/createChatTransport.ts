// createChatTransport.ts
import { DefaultChatTransport } from "ai";
import { API_CONFIG } from "../constants";
import { storage } from "../utils";

export function createChatTransport(conversationId: string) {
  const token = storage.getToken();

  console.log("✅ Using custom DefaultChatTransport build at runtime:", new Date().toISOString());

  return new DefaultChatTransport({
    api: `${API_CONFIG.BASE_URL}/chat/conversations/${conversationId}/messages`,

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",

    prepareSendMessagesRequest: (payload) => {
        console.log("✅ prepareSendMessagesRequest payload:", payload);
        return {
          body: {
            messages: payload.messages,
            id: payload.id,
            trigger: payload.trigger,
          },
        };
      },
  });
}
