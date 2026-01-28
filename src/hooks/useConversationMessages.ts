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
        setMessages(uiMessages as any);
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

  const handleSendMessage = async (
    messageText: string,
    attachments: import('@/types').Attachment[] = []
  ) => {
    if ((!messageText.trim() && attachments.length === 0) || !conversationId || status !== 'ready') {
      return;
    }

    try {
      if (sendMessage) {
        // Build parts array for multi-modal message (consistent with architecture)
        const parts: any[] = [];

        // Add text part (even if empty, to maintain structure)
        if (messageText.trim()) {
          parts.push({ type: 'text', text: messageText });
        }

        // Add image/file parts from uploaded attachments
        attachments.forEach(att => {
          if (att.uploadedUrl && att.status === 'uploaded') {
            if (att.type === 'image') {
              // Validate URL before adding
              try {
                new URL(att.uploadedUrl);
                parts.push({
                  type: 'image',
                  image: att.uploadedUrl,  // AI SDK standard field
                  url: att.uploadedUrl,     // Also include for compatibility
                  ...(att.attachmentId && { attachmentId: att.attachmentId }), // Link to Attachment entity
                });
              } catch (e) {
                console.error('Invalid image URL:', att.uploadedUrl);
              }
            } else if (att.type === 'file' && att.attachmentId) {
                // Determine file type for UI
                const isPdf = att.file.type === 'application/pdf' || att.file.name.endsWith('.pdf');
                
                parts.push({
                    type: 'file',
                    text: att.file.name,
                    attachmentId: att.attachmentId,
                    fileType: isPdf ? 'pdf' : 'docx'
                });
            }
          }
        });

        // Ensure at least one part exists
        if (parts.length === 0) {
          parts.push({ type: 'text', text: '' });
        }

        sendMessage({
          role: 'user',
          parts,
        });
      }

      // Generate title if first message
      if (messages.length === 0) {
        await generateTitle({ conversationId, message: messageText });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Re-throw for ChatArea to handle
      throw error;
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