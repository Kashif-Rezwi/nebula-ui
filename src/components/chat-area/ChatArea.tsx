import { useState, useRef, useEffect, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Composer } from './Composer';
import { ScrollToBottom } from './ScrollToBottom';
import { Greeting } from './Greeting';
import { ChatSkeleton } from './ChatSkeleton';
import { MessageList } from './MessageList';
import { useConversationMessages } from '../../hooks/useConversationMessages';
import { useCreateConversationWithMessage } from '../../hooks/conversations';
import { useScrollToMessage } from '../../hooks/useScrollToMessage';
import { useChatAttachments } from '../../hooks/chat/useChatAttachments';
import type { UIMessage, ChatRouterState, ChatAreaProps } from '@/types';
import { ROUTES } from '../../constants';
import { toast } from '@/utils/toast';
import { cn } from '../../utils/cn';

export function ChatArea({
  conversationId,
  title,
  draftSystemPrompt,
  onDraftSystemPromptChange,
  isLeftPanelCollapsed = false,
  isRightPanelCollapsed = false,
}: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();
  const prevMessagesLengthRef = useRef(0);

  const {
    attachments,
    isUploading,
    handleAttachmentAdd,
    handleAttachmentRemove,
    clearAttachments,
    hasUploadingAttachments,
    hasFailedAttachments,
  } = useChatAttachments(conversationId);

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

  const { scrollToMessage } = useScrollToMessage(messagesContainerRef as RefObject<HTMLDivElement>);

  // Automatically scroll to new user messages
  useEffect(() => {
    if (messages.length === 0 || loading) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (messages.length > prevMessagesLengthRef.current) {
      const latestMessage = messages[messages.length - 1];

      if (latestMessage.role === 'user') {
        timeoutId = setTimeout(() => {
          scrollToMessage(latestMessage.id, {
            offset: 16,
            behavior: 'smooth',
          });
        }, 400);
      }
    }

    prevMessagesLengthRef.current = messages.length;

    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [messages, loading, scrollToMessage]);

  const { mutateAsync: createConversationWithMessage, isPending: isCreating } =
    useCreateConversationWithMessage();

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    if (hasUploadingAttachments) {
      toast.error('Please wait for upload to complete');
      return;
    }

    if (hasFailedAttachments) {
      toast.error('Please remove failed uploads before sending');
      return;
    }

    const messageText = message;
    const messageAttachments = [...attachments];

    setMessage('');
    clearAttachments();

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
        });

        onDraftSystemPromptChange?.('');

        navigate(ROUTES.CHAT_WITH_ID(result.id), {
          state: { shouldAutoTrigger: true } as ChatRouterState,
        });
      } else {
        // At /chat/:id - Send message with attachments
        await handleSendMessage(messageText, messageAttachments);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className={cn(
          'flex-1 overflow-y-auto',
          !isLeftPanelCollapsed && 'lg:pl-[288px]',
          !isRightPanelCollapsed && 'xl:pr-[288px]'
        )}
      >
        {/* Sticky chat title */}
        {hasConversation && (
          <div className="sticky top-0 z-20 w-full max-w-3xl mx-auto">
            <div className="bg-background pt-4 lg:pt-[34px] pb-2 pl-20 pr-20 lg:pl-4 lg:pr-20 xl:pr-4">
              <div className="flex h-10 lg:h-7 items-center">
                <h1
                  className="truncate text-base lg:text-[15px] font-medium text-foreground/80 leading-none"
                  title={title}
                >
                  {title || 'Untitled'}
                </h1>
              </div>
            </div>
            <div className="h-6 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none" />
          </div>
        )}

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
                  showModeSelector={true}
                  attachments={attachments}
                  onAttachmentAdd={handleAttachmentAdd}
                  onAttachmentRemove={handleAttachmentRemove}
                  isUploading={isUploading}
                />
              </div>
            </div>
          </div>
        )}

        {/* At /chat/:id - Loading skeleton */}
        {hasConversation && loading && <ChatSkeleton />}

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
                  showModeSelector={hasConversation}
                  attachments={attachments}
                  onAttachmentAdd={handleAttachmentAdd}
                  onAttachmentRemove={handleAttachmentRemove}
                  isUploading={isUploading}
                />
              </div>
            </div>
          </div>
        )}

        {/* At /chat/:id - Has messages */}
        {hasConversation && !loading && hasMessages && (
          <>
            <MessageList messages={messages as UIMessage[]} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Fixed bottom composer */}
      {hasConversation && (
        <div
          className={cn(
            'fixed bottom-0 left-0 right-0',
            !isLeftPanelCollapsed && 'lg:left-[288px]',
            !isRightPanelCollapsed && 'xl:right-[288px]'
          )}
          data-chat-composer
        >
          <div className="absolute h-[calc(100%-58px)] bottom-0 left-0 right-0 bg-background pointer-events-none" />

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
            showModeSelector={true}
            attachments={attachments}
            onAttachmentAdd={handleAttachmentAdd}
            onAttachmentRemove={handleAttachmentRemove}
            isUploading={isUploading}
          />
        </div>
      )}
    </main>
  );
}