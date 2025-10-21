import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { conversationsApi } from '../lib/conversations';
import { createChatTransport } from '../lib/createChatTransport';
import { useGenerateTitle } from './useConversations';
import type { UIMessage } from '../types';

export function useConversationMessages(conversationId?: string) {
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: generateTitle } = useGenerateTitle();

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: createChatTransport(conversationId ?? 'default'),
  });

  // Load conversation messages
  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const loadConversation = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const conversation = await conversationsApi.getConversation(conversationId);

      const uiMessages: UIMessage[] = (conversation.messages || []).map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        parts: [{ type: 'text', text: msg.content }],
        metadata: { createdAt: msg.createdAt },
      }));

      setMessages(uiMessages);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToBottomSmooth = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isScrolledUp = element.scrollHeight - element.scrollTop - element.clientHeight > 100;
    setShowScrollButton(isScrolledUp);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !conversationId || status !== 'ready') return;

    try {
      sendMessage({
        role: 'user',
        parts: [{ type: 'text', text: messageText }],
      });

      // Generate title if first message
      if (messages.length === 0) {
        await generateTitle({ conversationId, message: messageText });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return {
    messages,
    status,
    error,
    loading,
    showScrollButton,
    messagesEndRef,
    messagesContainerRef,
    handleScroll,
    scrollToBottomSmooth,
    handleSendMessage,
  };
}