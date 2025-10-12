import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { conversationsApi } from '../lib/conversations';
import { streamChatResponse } from '../lib/streaming';
import type { Message } from '../types';
import { MessageSkeleton, Skeleton } from './Skeleton';
import { format } from '../utils';
import { useAuth } from '../hooks/useAuth';
import { MessageActions } from './MessageActions';
import { ScrollToBottom } from './ScrollToBottom';
import { InputArea } from './InputArea';

interface ChatAreaProps {
  conversationId?: string;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { getUser } = useAuth();
  const user = getUser();

  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isScrolledUp = element.scrollHeight - element.scrollTop - element.clientHeight > 100;
    setShowScrollButton(isScrolledUp);
  };
  
  const scrollToBottomSmooth = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    // Only auto-scroll if user is near the bottom (within 150px)
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
  }, [messages, isStreaming, streamingContent]);

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
      setMessages(conversation.messages || []);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !conversationId) return;

    const userMessage = message;
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add user message optimistically
    const tempUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      setIsStreaming(true);
      setStreamingContent('');

      // Stream the response
      for await (const chunk of streamChatResponse(conversationId, userMessage)) {
        if (chunk.isComplete) {
          setIsStreaming(false);
          // Reload conversation to get the saved messages with proper IDs
          await loadConversation();
        } else {
          setStreamingContent((prev) => prev + chunk.delta);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {messages.length === 0 && !isStreaming ? (
          /* Empty State with Suggestions */
          <div className="h-full flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <img 
                    src="/src/assets/nebula-logo.png" 
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
              {messages.map((msg, index) => (
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
                          {msg.content}
                        </div>
                      </div>
                      
                      {/* Timestamp below user message */}
                      <div className="text-xs text-foreground/40 mt-1 text-right" title={format.formatFullDateTime(msg.createdAt)}>
                        {format.formatRelativeTime(msg.createdAt)}
                      </div>
                    </div>
                  ) : (
                    /* AI Message without Background */
                    <div className="group text-[15px] text-[#e8e8e8]">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* Timestamp below AI message */}
                      <div className="text-xs text-foreground/40 mt-1" title={format.formatFullDateTime(msg.createdAt)}>
                        {format.formatRelativeTime(msg.createdAt)}
                      </div>
                      
                      {/* Action buttons at bottom */}
                      <MessageActions content={msg.content} />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming Message */}
              {isStreaming && (
                <div className="mt-6 animate-fade-in">
                  {streamingContent ? (
                    /* AI Streaming Content - No Background */
                    <div className="group text-[15px] text-[#e8e8e8]">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>
                          {streamingContent}
                        </ReactMarkdown>
                      </div>
                      <span className="inline-block w-1 h-4 bg-foreground/50 ml-1 animate-pulse"></span>
                      
                      {/* Action buttons for streaming content */}
                      <MessageActions content={streamingContent} />
                    </div>
                  ) : (
                    /* Typing Indicator */
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to Bottom Button */}
            <ScrollToBottom 
              show={showScrollButton || isStreaming} 
              onClick={scrollToBottomSmooth}
              isStreaming={isStreaming}
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
        disabled={!conversationId}
        isStreaming={isStreaming}
        textareaRef={textareaRef}
      />
    </main>
  );
}