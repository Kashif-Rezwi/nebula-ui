import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom'; // ADD THIS
import { useChat } from '@ai-sdk/react';
import { conversationsApi } from '../lib/conversations';
import { createChatTransport } from '../lib/createChatTransport';
import { useGenerateTitle } from './useConversations';
import type { UIMessage, ChatRouterState } from '../types'; // ADD ChatRouterState

export function useConversationMessages(conversationId?: string) {
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: generateTitle } = useGenerateTitle();
  const location = useLocation();

  const chatHelpers = useChat({
    transport: createChatTransport(conversationId ?? 'default'),
  });

  const { messages, status, error } = chatHelpers;

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      // No conversation ID - clear messages (at /new)
      if (chatHelpers.setMessages) {
        chatHelpers.setMessages([]);
      }
      setLoading(false);
    }
  }, [conversationId]);

  // Auto-trigger AI response when navigating from /new with shouldAutoTrigger flag
  useEffect(() => {
    const routerState = location.state as ChatRouterState | null;
    
    // Only trigger if:
    // 1. We have the flag from navigation
    // 2. Conversation is loaded (not loading)
    // 3. Chat is ready
    // 4. We have exactly 1 user message
    if (
      routerState?.shouldAutoTrigger &&
      conversationId &&
      !loading &&
      status === 'ready' &&
      messages.length === 1 &&
      messages[0].role === 'user'
    ) {
      // Clear the flag so we don't trigger again
      window.history.replaceState({}, document.title);
      
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
  }, [conversationId, loading, status, messages, location.state]);

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