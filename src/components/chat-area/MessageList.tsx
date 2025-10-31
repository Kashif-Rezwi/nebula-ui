import { useState, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from '../../utils';
import { useAuth } from '../../hooks/useAuth';
import { MessageActions } from './MessageActions';
import type { UIMessage } from '../../types';

interface MessageListProps {
  messages: UIMessage[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const { getUser } = useAuth();
  const user = getUser();
  const [dynamicPadding, setDynamicPadding] = useState(168);

  const getMessageText = (msg: UIMessage): string => {
    return msg.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('');
  };

  useLayoutEffect(() => {
    const calculatePadding = () => {
      const container = document.querySelector('[data-messages-container]');
      if (!container || messages.length < 2) {
        setDynamicPadding(168);
        return;
      }

      const lastTwo = Array.from(container.querySelectorAll('[data-message-id]')).slice(-2);
      const totalHeight = lastTwo.reduce((sum, el) => sum + (el as HTMLElement).offsetHeight, 0);
      const topSpace = 16; // this might be increase after adding chat title!
      const totalSpaceBetweenMessages = 48 // 16px each (total 3 messages)
      const padding = Math.max(168, window.innerHeight - totalHeight - totalSpaceBetweenMessages - topSpace);
      
      setDynamicPadding(padding);
    };

    calculatePadding();
    const rafId = requestAnimationFrame(calculatePadding);
    
    const observer = new ResizeObserver(() => requestAnimationFrame(calculatePadding));
    const container = document.querySelector('[data-messages-container]');
    
    container?.querySelectorAll('[data-message-id]')
      .forEach((el, i, arr) => i >= arr.length - 2 && observer.observe(el));
    
    window.addEventListener('resize', calculatePadding);
    
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', calculatePadding);
    };
  }, [messages]);

  return (
    <div 
      data-messages-container
      className="max-w-3xl mx-auto px-4 pt-4" 
      style={{ paddingBottom: `${dynamicPadding}px` }}
    >
      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-[16px] bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none z-10" />

      {/* Messages */}
      <div className="flex flex-col gap-6">
        {messages.map((msg, index) => (
          <div 
            key={msg.id} 
            data-message-id={msg.id}
            data-role={msg.role}
            className="animate-fade-in" 
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {msg.role === 'user' ? (
              /* User Message */
              <div>
                <div className="relative bg-primary/10 border border-primary/20 rounded-xl p-4 pl-14 min-h-14 flex items-center">
                  <div className="absolute left-3 top-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                    {user?.email ? format.getInitialFromEmail(user.email) : 'U'}
                  </div>
                  <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {getMessageText(msg)}
                  </div>
                </div>
                {msg.metadata?.createdAt && (
                  <div
                    className="text-xs text-foreground/40 mt-1 text-right"
                    title={format.formatFullDateTime(msg.metadata.createdAt)}
                  >
                    {format.formatRelativeTime(msg.metadata.createdAt)}
                  </div>
                )}
              </div>
            ) : (
              /* AI Message */
              <div className="group text-[15px] text-[#e8e8e8]">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{getMessageText(msg)}</ReactMarkdown>
                </div>
                {msg.metadata?.createdAt && (
                  <div
                    className="text-xs text-foreground/40 mt-1"
                    title={format.formatFullDateTime(msg.metadata.createdAt)}
                  >
                    {format.formatRelativeTime(msg.metadata.createdAt)}
                  </div>
                )}
                <MessageActions content={getMessageText(msg)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}