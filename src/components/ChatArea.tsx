import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import { conversationsApi } from '../lib/conversations';
import { MessageSkeleton, Skeleton } from './Skeleton';
import { format } from '../utils';
import { useAuth } from '../hooks/useAuth';
import { MessageActions } from './MessageActions';
import { ScrollToBottom } from './ScrollToBottom';
import { InputArea } from './InputArea';
import nebulaLogo from '../assets/nebula-logo.png';
import { createChatTransport } from '../lib/createChatTransport';

interface ChatAreaProps {
  conversationId?: string;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { getUser } = useAuth();
  const user = getUser();

  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // // ✅ AI SDK 5 way - using DefaultChatTransport with prepareSendMessagesRequest
  // const { messages, sendMessage, status, error, setMessages } = useChat({
  //   id: conversationId ?? "default",
  //   transport: new DefaultChatTransport({
  //     api: `${API_CONFIG.BASE_URL}/chat/conversations/${conversationId ?? "default"}/messages`,
  //     headers: () => ({
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${storage.getToken()}`
  //     }),
  //     credentials: 'include',
  //     prepareSendMessagesRequest: ({ messages, id, trigger }) => {
  //       console.log('📤 PREPARING REQUEST:', { messages, id, trigger });
  //       return {
  //         body: {
  //           messages,
  //           id,
  //           trigger
  //         }
  //       };
  //     }
  //   })
  // });

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: createChatTransport(conversationId ?? "default"),
  })

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isScrolledUp = element.scrollHeight - element.scrollTop - element.clientHeight > 100;
    setShowScrollButton(isScrolledUp);
  };
  
  const scrollToBottomSmooth = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const loadConversation = async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      const conversation = await conversationsApi.getConversation(conversationId);
      
      // Convert old message format to UIMessage format
      const uiMessages: UIMessage[] = (conversation.messages || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        parts: [
          {
            type: 'text',
            text: msg.content,
          },
        ],
        metadata: {
          createdAt: msg.createdAt,
        },
      }));
      
      setMessages(uiMessages);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    console.log('handleSend', message, conversationId, status);
    if (!message.trim() || !conversationId || status !== 'ready') return;

    const userMessage = message;
    console.log('userMessage', userMessage);
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Send message using AI SDK v5
      sendMessage({
        role: 'user',
        parts: [
          {
            type: 'text',
            text: userMessage,
          },
        ],
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Extract text from message parts
  const getMessageText = (msg: UIMessage): string => {
    return msg.parts
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join('');
  };

  if (loading) {
    return (
      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </div>
        </div>
        <div className="p-4 border-t border-border">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/50 px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <p className="text-red-500 text-sm">Error: {error.message}</p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {messages.length === 0 && status === 'ready' ? (
          /* Empty State with Suggestions */
          <div className="h-full flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <img 
                    src={nebulaLogo} 
                    alt="Nebula Logo" 
                    className="w-12 h-12 object-contain mr-3"
                  />
                  <h2 className="text-3xl font-semibold">Welcome back!</h2>
                </div>
                <p className="text-foreground/60 text-lg">
                  How can I help you today?
                </p>
              </div>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => conversationId && setMessage("Explain a complex topic in simple terms")}
                  className="text-left p-4 rounded-xl bg-[#1a1a1a] border border-border hover:border-primary/50 transition-all hover:bg-[#202020] group"
                >
                  <div className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">
                    💡 Explain concepts
                  </div>
                  <div className="text-xs text-foreground/60">
                    Break down complex topics into simple explanations
                  </div>
                </button>

                <button
                  onClick={() => conversationId && setMessage("Help me brainstorm ideas for")}
                  className="text-left p-4 rounded-xl bg-[#1a1a1a] border border-border hover:border-primary/50 transition-all hover:bg-[#202020] group"
                >
                  <div className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">
                    🎨 Brainstorm ideas
                  </div>
                  <div className="text-xs text-foreground/60">
                    Generate creative ideas and solutions
                  </div>
                </button>

                <button
                  onClick={() => conversationId && setMessage("Write code to")}
                  className="text-left p-4 rounded-xl bg-[#1a1a1a] border border-border hover:border-primary/50 transition-all hover:bg-[#202020] group"
                >
                  <div className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">
                    💻 Write code
                  </div>
                  <div className="text-xs text-foreground/60">
                    Help with programming and debugging
                  </div>
                </button>

                <button
                  onClick={() => conversationId && setMessage("Analyze and summarize")}
                  className="text-left p-4 rounded-xl bg-[#1a1a1a] border border-border hover:border-primary/50 transition-all hover:bg-[#202020] group"
                >
                  <div className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">
                    📊 Analyze data
                  </div>
                  <div className="text-xs text-foreground/60">
                    Break down and summarize information
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Messages List - Single Column */
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex flex-col">
              {(messages as UIMessage[]).map((msg, index) => (
                <div
                  key={msg.id}
                  className="mt-6 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {msg.role === 'user' ? (
                    /* User Message with Background */
                    <div>
                      <div className="relative bg-primary/10 border border-primary/20 rounded-2xl p-4 pl-14 min-h-14 flex items-center">
                        {/* Avatar inside bubble - vertically centered */}
                        <div className="absolute left-3 top-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                          {user?.email ? format.getInitialFromEmail(user.email) : 'U'}
                        </div>
                        
                        {/* Content with proper spacing */}
                        <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                          {getMessageText(msg)}
                        </div>
                      </div>
                      
                      {/* Timestamp below user message */}
                      {msg.metadata?.createdAt && (
                        <div className="text-xs text-foreground/40 mt-1 text-right" 
                            title={format.formatFullDateTime(msg.metadata.createdAt)}>
                          {format.formatRelativeTime(msg.metadata.createdAt)}
                        </div>
                      )}

                    </div>
                  ) : (
                    /* AI Message without Background */
                    <div className="group text-[15px] text-[#e8e8e8]">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>
                          {getMessageText(msg)}
                        </ReactMarkdown>
                      </div>

                      {/* Timestamp below AI message */}
                      {msg.metadata?.createdAt && (
                        <div className="text-xs text-foreground/40 mt-1" 
                            title={format.formatFullDateTime(msg.metadata.createdAt)}>
                          {format.formatRelativeTime(msg.metadata.createdAt)}
                        </div>
                      )}
                      
                      {/* Action buttons at bottom */}
                      <MessageActions content={getMessageText(msg)} />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming Indicator */}
              {status === 'streaming' && (
                <div className="mt-6 animate-fade-in">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to Bottom Button */}
            <ScrollToBottom 
              show={showScrollButton || status === 'streaming'} 
              onClick={scrollToBottomSmooth}
              isStreaming={status === 'streaming'}
            />
          </div>
        )}
      </div>

      {/* Input Area */}
      <InputArea
        message={message}
        setMessage={setMessage}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        disabled={!conversationId || status !== 'ready'}
        isStreaming={status === 'streaming'}
        textareaRef={textareaRef}
      />
    </main>
  );
}