import { DefaultChatTransport } from 'ai';
import { storage } from '../utils';
import { API_CONFIG } from '../constants';

export function createChatTransport(conversationId: string) {
    // if conversationId is not provided, throw an error
    if (!conversationId) throw new Error('Conversation ID is required');

    // return the chat transport
    return new DefaultChatTransport({
        api: `${API_CONFIG.BASE_URL}/chat/conversations/${conversationId}/messages`,
        prepareSendMessagesRequest: ({ messages, trigger, messageId }) => {
            return {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storage.getToken()}`,
                },
                credentials: 'include',
                body: {
                    messages,
                    trigger,
                    messageId,
                },
            };
        },
    });
}