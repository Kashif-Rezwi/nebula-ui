import { storage } from '../utils';
import { API_CONFIG } from '../constants';
import type { UIMessage } from '@ai-sdk/react';
import type { UIMessageChunk } from 'ai';

export function createChatTransport(conversationId: string) {
    if (!conversationId) {
        throw new Error('Conversation ID is required');
    }

    const token = storage.getToken();

    return {
        async sendMessages({ messages }: { messages: UIMessage[] }) {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}/chat/conversations/${conversationId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ messages: messages || [] }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            // Transform stream to parse UIMessageChunk
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            return new ReadableStream<UIMessageChunk>({
                async start(controller) {
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split('\n');
                            buffer = lines.pop() || '';

                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    const data = line.slice(6).trim();
                                    if (data === '[DONE]') continue;
                                    
                                    try {
                                        const parsed = JSON.parse(data);
                                        controller.enqueue(parsed as UIMessageChunk);
                                    } catch {
                                        // Skip invalid JSON
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        controller.error(error);
                    } finally {
                        reader.releaseLock();
                        controller.close();
                    }
                }
            });
        },
        async reconnectToStream() {
            // For now, return null as reconnection isn't implemented
            return null;
        }
    };
}