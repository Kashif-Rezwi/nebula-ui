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

  // Determine what to show
  const renderContent = () => {
    // No conversation selected → Show EmptyState
    if (!conversationId) {
      return <EmptyState onSuggestionClick={handleSuggestionClick} />;
    }

    // Conversation selected + Loading → Show skeleton
    if (loading) {
      return <ChatSkeleton />;
    }

    // Conversation selected + No messages → Show greeting
    if (messages.length === 0) {
      return <Greeting />;
    }

    // Conversation selected + Has messages → Show messages
    return (
      <>
        <MessageList messages={messages as UIMessage[]} isStreaming={status === 'streaming'} />
        <div ref={messagesEndRef} />
      </>
    );
  };

  return (
    <main className="w-full h-full flex flex-col">
      {/* Messages Area */}
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0">
        <div className="absolute h-[calc(100%-58px)] bottom-0 left-0 right-0 bg-background pointer-events-auto" />
        
        {conversationId && !loading && (
          <ScrollToBottom
            show={showScrollButton || status === 'streaming'}
            onClick={scrollToBottomSmooth}
            isStreaming={status === 'streaming'}
          />
        )}

        <Composer
          loading={loading}
          message={message}
          setMessage={setMessage}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          disabled={!conversationId || status !== 'ready'}
          isStreaming={status === 'streaming'}
          textareaRef={textareaRef}
        />
      </div>
    </main>
  );
}