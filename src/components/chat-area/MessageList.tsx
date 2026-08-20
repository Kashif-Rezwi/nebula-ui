import { useState, useLayoutEffect } from 'react';
import { format } from '../../utils';
import { useAuth } from '../../hooks/useAuth';
import { MessageActions } from './MessageActions';
import { MessageContent } from './MessageContent';
import { ToolCallStatus } from './ToolCallStatus';
import { ModeIndicator } from './ModeIndicator';
import type { UIMessage, WebSearchSource, SearchSummary } from '../../types';

interface MessageListProps {
  messages: UIMessage[];
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

export function MessageList({ messages }: MessageListProps) {
  const { getUser } = useAuth();
  const user = getUser();
  const [dynamicPadding, setDynamicPadding] = useState(168);

  const getMessageText = (msg: UIMessage): string => {
    // AI SDK v5 UIMessage only uses 'parts', no 'content' field
    const parts = (msg as any).parts || [];

    if (Array.isArray(parts) && parts.length > 0) {
      return parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('');
    }

    return '';
  };

  useLayoutEffect(() => {
    const calculatePadding = () => {
      const container = document.querySelector('[data-messages-container]');

      // Measure the fixed bottom composer stack so the last message (+ its copy
      // button) always clears it, no matter the composer height (attachments,
      // multi-line textarea, scroll-to-bottom band, etc.).
      const composerEl = document.querySelector('[data-chat-composer]');
      const composerHeight = composerEl ? composerEl.getBoundingClientRect().height : 148;
      // Comfortable margin so the last message is fully above the composer.
      const minPadding = composerHeight + 16;

      if (!container || messages.length < 2) {
        setDynamicPadding(minPadding);
        return;
      }

      const lastTwo = Array.from(container.querySelectorAll('[data-message-id]')).slice(-2);
      const totalHeight = lastTwo.reduce((sum, el) => sum + (el as HTMLElement).offsetHeight, 0);
      const topSpace = 16;
      const totalSpaceBetweenMessages = 48;
      const padding = Math.max(minPadding, window.innerHeight - totalHeight - totalSpaceBetweenMessages - topSpace);

      setDynamicPadding(padding);
    };

    calculatePadding();
    const rafId = requestAnimationFrame(calculatePadding);

    const observer = new ResizeObserver(() => requestAnimationFrame(calculatePadding));
    const container = document.querySelector('[data-messages-container]');

    container?.querySelectorAll('[data-message-id]')
      .forEach((el, i, arr) => i >= arr.length - 2 && observer.observe(el));

    // Recompute when the composer (underlay band + controls) changes height too
    const composerEl = document.querySelector('[data-chat-composer]');
    if (composerEl) observer.observe(composerEl);

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
      {/* Messages */}
      <div className="flex flex-col gap-6">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            data-message-id={msg.id}
            data-role={msg.role}
            className={index === messages.length - 1 ? 'animate-fade-in' : ''}
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
                    <MessageContent message={msg} variant="user" />
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
              <div className="group text-[15px] text-foreground">
                {/* Render message parts */}
                <MessageContent message={msg} variant="assistant" />
                
                {/* Render tool calls separately */}
                {(() => {
                  const parts = (msg as any).parts || [];
                  return parts.map((part: any, partIndex: number) => {
                    // Both statically-typed tool parts (e.g. tool-tavily_web_search)
                    // and AI SDK dynamic-tool parts render through the same strip
                    const isToolPart =
                      part.type === 'tool-tavily_web_search' || part.type === 'dynamic-tool';
                    if (!isToolPart) return null;

                    const { sources, summary } = parseToolOutput(
                      part.state === 'output-available' ? part.output : undefined
                    );

                    return (
                      <ToolCallStatus
                        key={partIndex}
                        toolName={part.type === 'dynamic-tool' ? part.toolName : 'tavily_web_search'}
                        status={
                          part.state === 'output-available' ? 'success' :
                            part.state === 'output-error' ? 'error' : 'pending'
                        }
                        sources={sources}
                        summary={summary}
                        error={part.state === 'output-error' ? part.errorText : undefined}
                      />
                    );
                  });
                })()}

                {/* Footer: mode + timestamp on the left, copy action on the right */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
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
                  <MessageActions content={getMessageText(msg)} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}