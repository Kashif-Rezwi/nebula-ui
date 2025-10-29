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

  const getMessageText = (msg: UIMessage): string => {
    return msg.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-[168px]">
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

        {/* Streaming Indicator */}
        {isStreaming && (
          <div className="animate-fade-in">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}