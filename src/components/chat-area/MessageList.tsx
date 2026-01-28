import { useState, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { format } from '../../utils';
import { useAuth } from '../../hooks/useAuth';
import { MessageActions } from './MessageActions';
import { ToolCallStatus } from './ToolCallStatus';
import { ModeIndicator } from './ModeIndicator';
import type { UIMessage, WebSearchSource, SearchSummary } from '../../types';

interface MessageListProps {
  messages: UIMessage[];
  isStreaming: boolean;
}

// Helper to parse tool output into sources AND summary
function parseToolOutput(output: any): {
  sources: WebSearchSource[];
  summary?: SearchSummary;
} {
  if (!output) return { sources: [] };

  try {
    // Check if it's web search results
    if (output.results && Array.isArray(output.results)) {
      const sources = output.results.map((r: any) => ({
        title: r.title || '',
        url: r.url || '',
        snippet: r.snippet || '',
        favicon: r.favicon || '',
        relevanceScore: r.relevanceScore || 0,
      }));

      // Extract summary if available
      const summary = output.summary && output.citations
        ? {
          text: output.summary,
          citations: output.citations,
        }
        : undefined;

      return { sources, summary };
    }
  } catch (error) {
    console.error('Failed to parse tool output:', error);
  }

  return { sources: [] };
}

export function MessageList({
  messages,
  // isStreaming,
}: MessageListProps) {
  const { getUser } = useAuth();
  const user = getUser();
  const [dynamicPadding, setDynamicPadding] = useState(168);

  const getMessageText = (msg: UIMessage): string => {
    const partsOrContent = (msg as any).content || (msg as any).parts || [];
    return partsOrContent
      .filter((part: any) => part.type === 'text')
      .map((part: any) => part.text)
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
      const topSpace = 16;
      const totalSpaceBetweenMessages = 48;
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

  console.log('📝 Messages:', messages.map(m => ({
    id: m.id,
    role: m.role,
    parts: m.parts.map(p => ({ type: p.type }))
  })));

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
                <div className="relative bg-primary/10 border border-primary/20 rounded-xl p-4 pl-14 min-h-14">
                  <div className="absolute left-3 top-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                    {user?.email ? format.getInitialFromEmail(user.email) : 'U'}
                  </div>

                  {/* Message parts */}
                  <div className="space-y-2">
                    {((msg as any).content || msg.parts || []).map((part: any, idx: number) => {
                      if (part.type === 'text') {
                        return (
                          <div key={idx} className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {part.text}
                          </div>
                        );
                      }
                      // Handle image parts
                      if (part.type === 'image') {
                        const imageUrl = part.url || part.image;  // Support both 'url' (new) and 'image' (legacy)
                        return (
                          <img
                            key={idx}
                            src={imageUrl}
                            alt="Uploaded image"
                            className="max-w-sm rounded-lg border border-primary/30 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(imageUrl, '_blank')}
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="12"%3EImage failed%3C/text%3E%3C/svg%3E';
                              e.currentTarget.classList.add('opacity-50');
                            }}
                          />
                        );
                      }
                      
                      // Handle file parts
                      if (part.type === 'file') {
                        return (
                          <div key={idx} className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-lg p-3 max-w-sm">
                             <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <IoDocumentTextOutline className="w-6 h-6 text-primary" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate" title={part.text}>
                                    {part.text}
                                </p>
                                <p className="text-xs text-foreground/60 uppercase">
                                    {part.fileType || 'DOC'}
                                </p>
                             </div>
                          </div>
                        );
                      }
                      
                      return null;
                    })}
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
                {/* Render message parts */}
                {((msg as any).content || msg.parts || []).map((part: any, partIndex: number) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <div key={partIndex} className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{part.text}</ReactMarkdown>
                        </div>
                      );

                    // Handle image parts
                    default:
                      if ((part as any).type === 'image') {
                        const imageUrl = (part as any).url || (part as any).image;  // Support both 'url' (new) and 'image' (legacy)
                        return (
                          <div key={partIndex} className="my-3">
                            <img
                              src={imageUrl}
                              alt="AI-provided image"
                              className="max-w-full max-h-96 rounded-lg border border-[#2a2a2a] cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(imageUrl, '_blank')}
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23333" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="14"%3EImage failed to load%3C/text%3E%3C/svg%3E';
                                e.currentTarget.classList.add('opacity-50', 'cursor-not-allowed');
                              }}
                            />
                          </div>
                        );
                      }
                      break;

                    case 'tool-tavily_web_search': {
                      const { sources, summary } = parseToolOutput(
                        part.state === 'output-available' ? part.output : undefined
                      );

                      return (
                        <ToolCallStatus
                          key={partIndex}
                          toolName="tavily_web_search"
                          status={
                            part.state === 'output-available' ? 'success' :
                              part.state === 'output-error' ? 'error' : 'pending'
                          }
                          sources={sources}
                          summary={summary}
                          error={
                            part.state === 'output-error'
                              ? part.errorText
                              : undefined
                          }
                        />
                      );
                    }

                    case 'dynamic-tool': {
                      const { sources, summary } = parseToolOutput(
                        part.state === 'output-available' ? part.output : undefined
                      );

                      return (
                        <ToolCallStatus
                          key={partIndex}
                          toolName={part.toolName}
                          status={
                            part.state === 'output-available' ? 'success' :
                              part.state === 'output-error' ? 'error' : 'pending'
                          }
                          sources={sources}
                          summary={summary}
                          error={
                            part.state === 'output-error'
                              ? part.errorText
                              : undefined
                          }
                        />
                      );
                    }


                  }
                })}

                {/* Show timestamp and mode indicator */}
                {(msg.metadata?.createdAt || msg.metadata?.effectiveMode) && (
                  <div className="flex items-center gap-2 mt-1">
                    {msg.metadata?.effectiveMode && (
                      <ModeIndicator
                        mode={msg.metadata.effectiveMode}
                        wasAutoSelected={msg.metadata.operationalMode === 'auto'}
                      />
                    )}
                    {msg.metadata?.createdAt && (
                      <div
                        className="text-xs text-foreground/40"
                        title={format.formatFullDateTime(msg.metadata.createdAt)}
                      >
                        {format.formatRelativeTime(msg.metadata.createdAt)}
                      </div>
                    )}
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