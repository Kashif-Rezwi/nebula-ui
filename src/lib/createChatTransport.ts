import { DefaultChatTransport } from 'ai';
import { storage } from '../utils';
import { API_CONFIG } from '../constants';

export function createChatTransport(conversationId: string) {
    const token = storage.getToken();

    console.log('🔧 Creating transport for conversation:', conversationId);
    console.log('🔧 API URL:', `${API_CONFIG.BASE_URL}/chat/conversations/${conversationId}/messages`);

    return new DefaultChatTransport({
        api: `${API_CONFIG.BASE_URL}/chat/conversations/${conversationId}/messages`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
    });
}