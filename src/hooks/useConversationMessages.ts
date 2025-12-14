import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useChat } from '@ai-sdk/react';
import { conversationsApi } from '../lib/conversations';
import { createChatTransport } from '../lib/createChatTransport';
import { useGenerateTitle } from './conversations';
import { toUIMessages } from '../lib/messageUtils';
import type { UIMessage, ChatRouterState } from '../types';

export function useConversationMessages(conversationId?: string) {
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: generateTitle } = useGenerateTitle();
  const location = useLocation();

  // Use ref to prevent re-triggering
  const hasTriggeredRef = useRef(false);

  const { messages, status, error, setMessages, sendMessage } = useChat({
    transport: createChatTransport(conversationId ?? 'default'),
  });

  // Reset trigger flag when conversation changes
  useEffect(() => {
    hasTriggeredRef.current = false;
  }, [conversationId]);

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      if (setMessages) {
        setMessages([]);
      }
      setLoading(false);
    }
  }, [conversationId]);

  // Simple auto-trigger with ref to prevent duplicates
  useEffect(() => {
    const routerState = location.state as ChatRouterState | null;

    // Only trigger once using ref
    if (
      routerState?.shouldAutoTrigger &&
      conversationId &&
      !loading &&
      status === 'ready' &&
      messages.length === 1 &&
      messages[0].role === 'user' &&
      !hasTriggeredRef.current
    ) {
      // Mark as triggered
      hasTriggeredRef.current = true;

      // Clear the flag
      window.history.replaceState({}, document.title);

      // Trigger AI response by sending the user message
      const userMessage = messages[0];
      const messageText = userMessage.parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('');

      // This prevents the duplicate
      if (setMessages && sendMessage) {
        // Temporarily clear messages
        setMessages([]);

        // Use setTimeout to ensure state update completes
        setTimeout(() => {
          // Now send - no duplicate because array is empty!
          sendMessage({
            role: 'user',
            parts: [{ type: 'text', text: messageText }],
          });
        }, 0);
      }

      // Generate title
      generateTitle({ conversationId, message: messageText });
    }
  }, [conversationId, loading, status, messages.length, location.state]);
  // Only depend on messages.length, not messages array itself

  const loadConversation = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const conversation = await conversationsApi.getConversation(conversationId);

      const uiMessages: UIMessage[] = toUIMessages(conversation.messages);

      if (setMessages) {
        setMessages(uiMessages);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      if (setMessages) {
        setMessages([]);
      }
    } finally {
      setLoading(false);
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
      if (sendMessage) {
        sendMessage({
          role: 'user',
          parts: [{ type: 'text', text: messageText }],
        });
      }

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
    setMessages,
  };
}