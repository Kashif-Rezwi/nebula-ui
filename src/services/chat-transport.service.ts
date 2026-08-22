import { DefaultChatTransport } from 'ai';
import { API_CONFIG } from '../constants';
import { storage } from '../utils/storage';
import { modePreference } from '../utils/modePreference';
import type { MessagePart } from '../types';

interface SendableMessage {
  role: string;
  parts?: MessagePart[];
}

export function createChatTransport(conversationId: string) {
  if (!conversationId) {
    throw new Error('Conversation ID is required');
  }

  return new DefaultChatTransport({
    api: `${API_CONFIG.BASE_URL}/chat/conversations/${conversationId}/messages`,
    headers: () => {
      const token = storage.getToken();
      return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
    },
    credentials: 'include',
    prepareSendMessagesRequest: ({ messages }) => {
      const modeOverride = modePreference.getModeOverride();

      // Transform messages to match backend expectation
      const apiMessages = (messages as SendableMessage[]).map((msg) => {
        const parts = msg.parts;

        if (Array.isArray(parts) && parts.length > 0) {
          return {
            role: msg.role,
            parts,
          };
        }

        return {
          role: msg.role,
          parts: [{ type: 'text', text: '' }],
        };
      });

      return {
        body: {
          messages: apiMessages,
          ...(modeOverride ? { modeOverride } : {}),
        },
      };
    },
  });
}
