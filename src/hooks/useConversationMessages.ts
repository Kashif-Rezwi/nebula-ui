import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { conversationsApi } from '../lib/conversations';
import { createChatTransport } from '../lib/createChatTransport';
import { useGenerateTitle } from './useConversations';
import type { UIMessage } from '../types';

export function useConversationMessages(conversationId?: string) {
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: generateTitle } = useGenerateTitle();

  const chatHelpers = useChat({
    transport: createChatTransport(conversationId ?? 'default'),
  });

  const { messages, status, error } = chatHelpers;

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      setHasAutoTriggered(false); // Reset for new conversation
      loadConversation();
    } else {
      // No conversation ID - clear messages (at /new)
      if (chatHelpers.setMessages) {
        chatHelpers.setMessages([]);
      }
      setLoading(false);
    }
  }, [conversationId]);

  // Auto-trigger AI response for newly created conversations
  useEffect(() => {
    // Only trigger if:
    // 1. We have a conversationId
    // 2. Exactly 1 message exists
    // 3. Last message is from user
    // 4. Haven't triggered yet
    // 5. Chat is ready
    if (
      conversationId &&
      messages.length === 1 &&
      messages[0].role === 'user' &&
      !hasAutoTriggered &&
      status === 'ready' &&
      !loading
    ) {
      setHasAutoTriggered(true);
      
      // Trigger AI response by sending the user message
      const userMessage = messages[0];
      const messageText = userMessage.parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('');

      // Send message to trigger AI response
      if (chatHelpers.sendMessage && messageText) {
        chatHelpers.sendMessage({
          role: 'user',
          parts: [{ type: 'text', text: messageText }],
        });

        // Generate title
        generateTitle({ conversationId, message: messageText });
      }
    }
  }, [conversationId, messages, status, hasAutoTriggered, loading]);

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

      if (chatHelpers.setMessages) {
        chatHelpers.setMessages(uiMessages);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      if (chatHelpers.setMessages) {
        chatHelpers.setMessages([]);
      }
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
      // Send message through the transport
      if (chatHelpers.sendMessage) {
        chatHelpers.sendMessage({
          role: 'user',
          parts: [{ type: 'text', text: messageText }],
        });
      }

      // Generate title if first message (only for non-auto-triggered messages)
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
    setMessages: chatHelpers.setMessages,
  };
}