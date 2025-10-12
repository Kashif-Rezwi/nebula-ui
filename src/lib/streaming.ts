import { storage } from '../utils';
import type { StreamChunk } from '../types';

export async function* streamChatResponse(
  conversationId: string,
  message: string
): AsyncGenerator<StreamChunk> {
  const token = storage.getToken();
  
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/chat/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data.trim()) {
            try {
              const parsed: StreamChunk = JSON.parse(data);
              yield parsed;
            } catch (e) {
              console.error('Failed to parse chunk:', data);
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}