// createChatTransport.ts
import { DefaultChatTransport } from "ai";
import { API_CONFIG } from "../constants";
import { storage } from "../utils";

export function createChatTransport(conversationId: string) {
  const token = storage.getToken();

  console.log("🔧 Creating transport for conversation:", conversationId);
  console.log(
    "🔧 API URL:",
    `${API_CONFIG.BASE_URL}/chat/conversations/${conversationId}/messages`
  );

  return new DefaultChatTransport({
    api: `${API_CONFIG.BASE_URL}/chat/conversations/${conversationId}/messages`,

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",

    // ✅ ensure outgoing payload is always { messages: [...] }
    // regardless of local vs production behavior
    prepareSendMessagesRequest: ({ messages, id, trigger }) => {
      let normalized = messages;

      // Safety: if SDK or environment accidentally sends single message
      if (!Array.isArray(normalized)) {
        normalized = [
          typeof normalized === "string"
            ? { role: "user", id: "1", parts: [{ type: "text", text: normalized }] }
            : normalized,
        ];
      }

      return {
        body: {
          messages: normalized,
          id,
          trigger,
        },
      };
    },
  });
}
