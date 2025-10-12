import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { conversationsApi } from '../lib/conversations';
import { streamChatResponse } from '../lib/streaming';
import type { Message } from '../types';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      <main className="flex-1 flex items-center justify-center">
        <div className="text-foreground/60">Loading conversation...</div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isStreaming ? (
          /* Empty State */
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl mb-4">✨ Welcome back!</h2>
              <p className="text-foreground/60">
                {conversationId 
                  ? 'Start chatting in this conversation'
                  : 'Create a new conversation to get started'
                }
              </p>
            </div>
          </div>
        ) : (
          /* Messages List */
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-[#262626] text-foreground'
                    }`}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Streaming Message */}
              {isStreaming && streamingContent && (
                 <div className="flex justify-start">
                   <div className="max-w-[80%] bg-[#262626] text-foreground rounded-lg px-4 py-3">
                     <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>
                        {streamingContent}
                      </ReactMarkdown>
                     </div>
                     <span className="inline-block w-1 h-4 bg-foreground/50 ml-1 animate-pulse"></span>
                   </div>
                 </div>
              )}

            {/* Typing Indicator */}
            {isStreaming && !streamingContent && (
              <div className="flex justify-start">
                <div className="bg-[#262626] rounded-lg px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="How can I help you today?"
            className="w-full bg-[#262626] text-foreground rounded-lg px-4 py-3 pr-12 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none max-h-[200px] overflow-y-auto"
            rows={1}
            style={{ minHeight: '48px' }}
            disabled={!conversationId || isStreaming}
          />
          <button 
            onClick={handleSend}
            className="absolute bottom-3 right-3 bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!message.trim() || isStreaming || !conversationId}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}