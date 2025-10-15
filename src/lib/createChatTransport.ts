import { DefaultChatTransport } from "ai";
import { storage } from '../utils';
import { API_CONFIG } from '../constants';

export function createChatTransport(conversationId: string) {
    const token = storage.getToken();
  
    return new DefaultChatTransport({
      api: `${API_CONFIG.BASE_URL}/chat/conversations/${conversationId}/messages`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      prepareSendMessagesRequest: ({ messages, id, trigger }) => {
        // Normalize legacy single message shape (if ever needed)
        // If messages is an array: send as is
        return {
          body: {
            messages,
            // Optionally extra fields
          },
          id,
          trigger,
        };
      },
    });
  }
  