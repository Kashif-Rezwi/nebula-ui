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
import type { UIMessage, ChatRouterState, ChatAreaProps, Attachment } from '@/types';
import { ROUTES } from '../../constants';
import { validateFile, uploadAttachment } from '@/lib/upload';
import { toast } from '@/utils/toast';

export function ChatArea({
  conversationId,
  draftSystemPrompt,
  onDraftSystemPromptChange
}: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();
  const prevMessagesLengthRef = useRef(0);

  const MAX_ATTACHMENTS = 5; // Max 5 attachments per message

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

  // Attachment handlers
  const handleAttachmentAdd = async (file: File) => {
    // Check if conversation exists
    if (!conversationId) {
      toast.error('Please create a conversation first before uploading files');
      return;
    }

    // Check limit
    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} files per message`);
      return;
    }

    // Validate
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Create attachment object
    const attachment: Attachment = {
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0,
      type: file.type.startsWith('image/') ? 'image' : 'file',
    };

    setAttachments(prev => [...prev, attachment]);
    setIsUploading(true);

    try {
      // Upload to server with conversationId
      const { url: uploadedUrl, attachmentId } = await uploadAttachment(file, conversationId, (progress) => {
        setAttachments(prev =>
          prev.map(att =>
            att.id === attachment.id
              ? { ...att, progress }
              : att
          )
        );
      });

      // Update with URL and attachment ID
      setAttachments(prev =>
        prev.map(att =>
          att.id === attachment.id
            ? { ...att, uploadedUrl, attachmentId, status: 'uploaded' as const }
            : att
        )
      );
      toast.success('File uploaded successfully');
    } catch (error) {
      // Mark as error
      setAttachments(prev =>
        prev.map(att =>
          att.id === attachment.id
            ? { ...att, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
            : att
        )
      );
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAttachmentRemove = (id: string) => {
    setAttachments(prev => {
      const removed = prev.find(att => att.id === id);
      if (removed) {
        // Clean up blob URL to prevent memory leaks
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter(att => att.id !== id);
    });
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      attachments.forEach(att => URL.revokeObjectURL(att.previewUrl));
    };
  }, []);

  // Mode management is now message-level, handled in Composer

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    // Don't allow sending with uploading attachments
    if (attachments.some(att => att.status === 'uploading')) {
      toast.error('Please wait for upload to complete');
      return;
    }

    // Don't allow sending with failed attachments
    if (attachments.some(att => att.status === 'error')) {
      toast.error('Please remove failed uploads before sending');
      return;
    }

    // Ensure all uploaded attachments have valid URLs
    const uploadedAttachments = attachments.filter(att => att.status === 'uploaded');
    if (uploadedAttachments.some(att => !att.uploadedUrl)) {
      toast.error('Some uploads are not ready yet. Please wait.');
      return;
    }

    const messageText = message;
    const messageAttachments = [...attachments];

    setMessage('');
    setAttachments([]); // Clear immediately

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
        });

        // Clear draft system prompt after successful creation
        onDraftSystemPromptChange?.('');

        // Navigate with state flag to trigger AI response
        navigate(ROUTES.CHAT_WITH_ID(result.id), {
          state: { shouldAutoTrigger: true } as ChatRouterState,
        });
      } else {
        // At /chat/:id - Send message with attachments
        await handleSendMessage(messageText, messageAttachments);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message and attachments on error
      setMessage(messageText);
      setAttachments(messageAttachments);
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