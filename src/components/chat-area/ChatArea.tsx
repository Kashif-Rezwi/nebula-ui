import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Composer } from './Composer';
import { ScrollToBottom } from './ScrollToBottom';
import { Greeting } from './Greeting';
import { ChatSkeleton } from './ChatSkeleton';
import { MessageList } from './MessageList';
import { useConversationMessages } from '../../hooks/useConversationMessages';
import { useCreateConversationWithMessage } from '../../hooks/conversations';
import type { UIMessage, ChatRouterState } from '@/types';
import { ROUTES } from '../../constants';

interface ChatAreaProps {
  conversationId?: string;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();

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

  const { mutateAsync: createConversationWithMessage, isPending: isCreating } = 
    useCreateConversationWithMessage();

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
        });

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
          />
        </div>
      )}
    </main>
  );
}