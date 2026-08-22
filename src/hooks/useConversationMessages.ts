import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useChat } from '@ai-sdk/react';
import { conversationService } from '../services/conversation.service';
import { createChatTransport } from '../services/chat-transport.service';
import { useGenerateTitle } from './conversations';
import { toUIMessages } from '../utils/message';
import type { UIMessage, ChatRouterState, Attachment, MessagePart } from '../types';

export function useConversationMessages(conversationId?: string) {
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: generateTitle } = useGenerateTitle();
  const location = useLocation();

  const hasTriggeredRef = useRef(false);

  const { messages, status, error, setMessages, sendMessage } = useChat({
    transport: createChatTransport(conversationId ?? 'default'),
  });

  const loadConversation = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const conversation = await conversationService.getConversation(id);
      const uiMessages: UIMessage[] = toUIMessages(conversation.messages);

      if (setMessages) {
        setMessages(uiMessages as unknown as Parameters<typeof setMessages>[0]);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
      if (setMessages) {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  }, [setMessages]);

  // Reset trigger flag when conversation changes
  useEffect(() => {
    hasTriggeredRef.current = false;
  }, [conversationId]);

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      if (setMessages) {
        setMessages([]);
      }
      setLoading(false);
    }
  }, [conversationId, loadConversation, setMessages]);

  // Auto-trigger assistant response when redirected from /new with a prompt
  useEffect(() => {
    const routerState = location.state as ChatRouterState | null;

    if (
      routerState?.shouldAutoTrigger &&
      conversationId &&
      !loading &&
      status === 'ready' &&
      messages.length === 1 &&
      messages[0].role === 'user' &&
      !hasTriggeredRef.current
    ) {
      hasTriggeredRef.current = true;
      window.history.replaceState({}, document.title);

      const userMessage = messages[0];
      const messageText = (userMessage.parts || [])
        .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
        .map((part) => part.text)
        .join('');

      if (setMessages && sendMessage) {
        setMessages([]);

        setTimeout(() => {
          sendMessage({
            role: 'user',
            parts: [{ type: 'text', text: messageText }],
          } as unknown as Parameters<typeof sendMessage>[0]);
        }, 0);
      }

      generateTitle({ conversationId, message: messageText });
    }
  }, [
    conversationId,
    loading,
    status,
    messages,
    location.state,
    setMessages,
    sendMessage,
    generateTitle,
  ]);

  const scrollToBottomSmooth = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isScrolledUp = element.scrollHeight - element.scrollTop - element.clientHeight > 100;
    setShowScrollButton(isScrolledUp);
  }, []);

  const handleSendMessage = useCallback(
    async (messageText: string, attachments: Attachment[] = []) => {
      if ((!messageText.trim() && attachments.length === 0) || !conversationId || status !== 'ready') {
        return;
      }

      try {
        if (sendMessage) {
          const parts: MessagePart[] = [];

          if (messageText.trim()) {
            parts.push({ type: 'text', text: messageText });
          }

          for (const att of attachments) {
            if (att.status === 'uploaded') {
              if (att.type === 'image') {
                try {
                  const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(att.file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                  });

                  parts.push({
                    type: 'image',
                    image: base64,
                    ...(att.attachmentId ? { attachmentId: att.attachmentId } : {}),
                  });
                } catch (e) {
                  console.error('Failed to convert image to base64:', e);
                }
              } else if (att.type === 'file' && att.attachmentId) {
                const isPdf = att.file.type === 'application/pdf' || att.file.name.endsWith('.pdf');
                parts.push({
                  type: 'file',
                  text: att.file.name,
                  attachmentId: att.attachmentId,
                  fileType: isPdf ? 'pdf' : 'docx',
                });
              }
            }
          }

          if (parts.length === 0) {
            parts.push({ type: 'text', text: '' });
          }

          sendMessage({
            role: 'user',
            parts,
          } as unknown as Parameters<typeof sendMessage>[0]);
        }

        if (messages.length === 0) {
          await generateTitle({ conversationId, message: messageText });
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [conversationId, status, sendMessage, messages.length, generateTitle]
  );

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