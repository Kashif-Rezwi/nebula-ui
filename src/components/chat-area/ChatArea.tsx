import { useState, useRef } from 'react';
import { Composer } from './Composer';
import { ScrollToBottom } from './ScrollToBottom';
import { EmptyState } from './EmptyState';
import { Greeting } from './Greeting';
import { ChatSkeleton } from './ChatSkeleton';
import { MessageList } from './MessageList';
import { useConversationMessages } from '../../hooks/useConversationMessages';
import type { UIMessage } from '@/types';

interface ChatAreaProps {
  conversationId?: string;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  const handleSend = async () => {
    if (!message.trim()) return;

    await handleSendMessage(message);
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (text: string) => {
    setMessage(text);
  };

  const hasConversation = Boolean(conversationId);
  const hasMessages = messages.length > 0;
  const isLoading = loading;

  return (
    <main className="w-full h-full flex flex-col">
      {/* Messages Area */}
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        {!hasConversation && (
          <EmptyState onSuggestionClick={handleSuggestionClick} />
        )}

        {hasConversation && isLoading && (
          <ChatSkeleton />
        )}

        {hasConversation && !isLoading && !hasMessages && (
          <div className="h-full flex items-center justify-center px-4">
            <div className="flex flex-col items-center gap-8 w-full max-w-3xl">
              <Greeting />
              <div className="w-full">
                <Composer
                  loading={false}
                  message={message}
                  setMessage={setMessage}
                  onSend={handleSend}
                  onKeyDown={handleKeyDown}
                  disabled={status !== 'ready'}
                  isStreaming={status === 'streaming'}
                  textareaRef={textareaRef}
                />
              </div>
            </div>
          </div>
        )}

        {hasConversation && !isLoading && hasMessages && (
          <>
            <MessageList messages={messages as UIMessage[]} isStreaming={status === 'streaming'} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Fixed Bottom Composer - ONLY when has messages */}
      {hasConversation && !isLoading && hasMessages && (
        <div className="fixed bottom-0 left-0 right-0">
          <div className="absolute h-[calc(100%-58px)] bottom-0 left-0 right-0 bg-background pointer-events-auto" />
          
          <ScrollToBottom
            show={showScrollButton || status === 'streaming'}
            onClick={scrollToBottomSmooth}
            isStreaming={status === 'streaming'}
          />

          <Composer
            loading={false}
            message={message}
            setMessage={setMessage}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            disabled={status !== 'ready'}
            isStreaming={status === 'streaming'}
            textareaRef={textareaRef}
          />
        </div>
      )}
    </main>
  );
}