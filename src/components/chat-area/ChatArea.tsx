import { useState, useRef, useEffect, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Composer } from './Composer';
import { ScrollToBottom } from './ScrollToBottom';
import { Greeting } from './Greeting';
import { ChatSkeleton } from './ChatSkeleton';
import { MessageList } from './MessageList';
import { useConversationMessages } from '../../hooks/useConversationMessages';
import { useCreateConversationWithMessage, useConversation } from '../../hooks/conversations';
import { useScrollToMessage } from '../../hooks/useScrollToMessage';
import type { UIMessage, ChatRouterState, ChatAreaProps, OperationalMode } from '@/types';
import { ROUTES } from '../../constants';

export function ChatArea({
  conversationId,
  draftSystemPrompt,
  onDraftSystemPromptChange
}: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();
  const prevMessagesLengthRef = useRef(0);

  // Store mode in localStorage for persistence across page refreshes
  const getModeKey = (id: string) => `conversation_mode_${id}`;

  // Get initial mode from localStorage or conversation data
  const [currentMode, setCurrentMode] = useState<OperationalMode>(() => {
    if (conversationId) {
      return (localStorage.getItem(getModeKey(conversationId)) as OperationalMode) || 'auto';
    }
    return 'auto';
  });

  const {
    messages,
    status,
    loading,
    showScrollButton,
    messagesEndRef,
    messagesContainerRef,
    handleScroll,
    scrollToBottomSmooth,
    handleSendMessage,
  } = useConversationMessages(conversationId);

  // Add scroll-to-message functionality
  const { scrollToMessage } = useScrollToMessage(messagesContainerRef as RefObject<HTMLDivElement>);

  // Automatically scroll to new USER messages only (not AI responses)
  useEffect(() => {
    // Skip if no messages or still loading
    if (messages.length === 0 || loading) {
      return;
    }

    // Check if a new message was added
    if (messages.length > prevMessagesLengthRef.current) {
      const latestMessage = messages[messages.length - 1];

      // ONLY scroll if the latest message is from the USER
      if (latestMessage.role === 'user') {
        // Wait a bit for the DOM to update, then scroll to the new message
        setTimeout(() => {
          scrollToMessage(latestMessage.id, {
            offset: 16, // 16px from top of viewport
            behavior: 'smooth'
          });
        }, 800);
      }
    }

    // Update previous length
    prevMessagesLengthRef.current = messages.length;
  }, [messages, loading, scrollToMessage]);

  const { mutateAsync: createConversationWithMessage, isPending: isCreating } =
    useCreateConversationWithMessage();

  const { data: conversation } = useConversation(conversationId || '');

  // Update mode state when navigating to a different conversation
  useEffect(() => {
    if (conversationId) {
      const storedMode = localStorage.getItem(getModeKey(conversationId)) as OperationalMode;

      if (storedMode) {
        // Priority 1: Use user's manually selected mode from localStorage
        setCurrentMode(storedMode);
      } else if (conversation?.operationalMode) {
        // Priority 2: Use server value (conversation's last mode)
        setCurrentMode(conversation.operationalMode);
        // Store it for next time
        localStorage.setItem(getModeKey(conversationId), conversation.operationalMode);
      }
      // If neither exists, keep current state (don't reset to 'auto')
    } else {
      // At /new route - reset to 'auto' for new conversations
      setCurrentMode('auto');
    }
  }, [conversationId, conversation?.operationalMode]);

  // Sync mode with server if it changes (e.g., from another tab or external update)
  useEffect(() => {
    if (conversation?.operationalMode && conversationId) {
      const serverMode = conversation.operationalMode;
      const localMode = localStorage.getItem(getModeKey(conversationId)) as OperationalMode;

      // Only update if server mode exists and differs from local
      if (serverMode && localMode !== serverMode) {
        // Don't override user's manual selection unless explicitly needed
        // This is mainly for syncing when mode is changed externally
        console.log(`[Mode Sync] Server has "${serverMode}", local has "${localMode || 'none'}"`);

        // Only sync if user hasn't manually set a mode (localStorage is empty)
        if (!localMode) {
          localStorage.setItem(getModeKey(conversationId), serverMode);
          setCurrentMode(serverMode);
        }
      }
    }
  }, [conversation?.operationalMode, conversationId]);

  // Handle mode change - only update local state
  const handleModeChange = (newMode: OperationalMode) => {
    setCurrentMode(newMode);
    if (conversationId) {
      // Store in localStorage for persistence
      localStorage.setItem(getModeKey(conversationId), newMode);
    }
    // No API call here! Mode will be sent with next message
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const messageText = message;
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      if (!conversationId) {
        // At /new - Create conversation with first message
        const result = await createConversationWithMessage({
          title: 'Untitled',
          firstMessage: messageText,
          systemPrompt: draftSystemPrompt || undefined,
          operationalMode: currentMode,
        });

        // Store mode in localStorage ONLY for the new conversation ID
        localStorage.setItem(getModeKey(result.id), currentMode);

        // Clear draft system prompt after successful creation
        onDraftSystemPromptChange?.('');

        // Update state with the new conversation ID's mode
        setCurrentMode(currentMode);

        // Navigate with state flag to trigger AI response
        navigate(ROUTES.CHAT_WITH_ID(result.id), {
          state: { shouldAutoTrigger: true } as ChatRouterState,
        });
      } else {
        // At /chat/:id - Send message normally
        await handleSendMessage(messageText);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setMessage(messageText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasConversation = Boolean(conversationId);
  const hasMessages = messages.length > 0;
  const isDisabled = isCreating || (hasConversation && status !== 'ready');
  const isStreamingOrCreating = status === 'streaming' || isCreating;

  return (
    <main className="w-full h-full flex flex-col">
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        {/* At /new - Show centered greeting + composer */}
        {!hasConversation && (
          <div className="h-full flex items-center justify-center px-4">
            <div className="flex flex-col items-center gap-8 w-full max-w-3xl">
              <Greeting />
              <div className="w-full">
                <Composer
                  message={message}
                  setMessage={setMessage}
                  onSend={handleSend}
                  onKeyDown={handleKeyDown}
                  disabled={isCreating}
                  isStreaming={false}
                  textareaRef={textareaRef}
                  currentMode={currentMode}
                  onModeChange={handleModeChange}
                  showModeSelector={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* At /chat/:id - Loading */}
        {hasConversation && loading && (
          <ChatSkeleton />
        )}

        {/* At /chat/:id - Loaded but no messages */}
        {hasConversation && !loading && !hasMessages && (
          <div className="h-full flex items-center justify-center px-4">
            <div className="flex flex-col items-center gap-8 w-full max-w-3xl">
              <Greeting />
              <div className="w-full">
                <Composer
                  message={message}
                  setMessage={setMessage}
                  onSend={handleSend}
                  onKeyDown={handleKeyDown}
                  disabled={isDisabled}
                  isStreaming={false}
                  textareaRef={textareaRef}
                  currentMode={currentMode}
                  onModeChange={handleModeChange}
                  showModeSelector={hasConversation}
                />
              </div>
            </div>
          </div>
        )}

        {/* At /chat/:id - Has messages */}
        {hasConversation && !loading && hasMessages && (
          <>
            <MessageList
              messages={messages as UIMessage[]}
              isStreaming={status === 'streaming'}
            />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Fixed bottom composer */}
      {hasConversation && (
        <div className="fixed bottom-0 left-0 right-0">
          <div className="absolute h-[calc(100%-58px)] bottom-0 left-0 right-0 bg-background pointer-events-auto" />

          <ScrollToBottom
            show={showScrollButton || status === 'streaming'}
            onClick={scrollToBottomSmooth}
            isStreaming={status === 'streaming'}
          />

          <Composer
            message={message}
            setMessage={setMessage}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            isStreaming={isStreamingOrCreating}
            textareaRef={textareaRef}
            currentMode={currentMode}
            onModeChange={handleModeChange}
            showModeSelector={true}
          />
        </div>
      )}
    </main>
  );
}