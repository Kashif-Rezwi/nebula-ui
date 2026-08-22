import { useState, useLayoutEffect, useMemo } from 'react';
import { format } from '../../utils/date';
import { getMessageText } from '../../utils/message';
import { useUser } from '../../hooks/useAuth';
import { MessageActions } from './MessageActions';
import { MessageContent } from './MessageContent';
import { ToolCallStatus } from './ToolCallStatus';
import { ModeIndicator } from './ModeIndicator';
import type { UIMessage, WebSearchSource, SearchSummary, DynamicToolPart } from '../../types';

interface MessageListProps {
  messages: UIMessage[];
}

interface WebSearchOutput {
  results?: Array<{
    title?: string;
    url?: string;
    snippet?: string;
    favicon?: string;
    relevanceScore?: number;
  }>;
  summary?: string;
  citations?: Array<{
    text: string;
    sourceIndex: number;
    url: string;
  }>;
}

// Helper to parse tool output into sources and summary
function parseToolOutput(output: unknown): {
  sources: WebSearchSource[];
  summary?: SearchSummary;
} {
  if (!output || typeof output !== 'object') return { sources: [] };

  try {
    const searchOutput = output as WebSearchOutput;

    if (searchOutput.results && Array.isArray(searchOutput.results)) {
      const sources: WebSearchSource[] = searchOutput.results.map((r) => ({
        title: r.title || '',
        url: r.url || '',
        snippet: r.snippet || '',
        favicon: r.favicon || '',
        relevanceScore: r.relevanceScore || 0,
      }));

      const summary: SearchSummary | undefined =
        searchOutput.summary && searchOutput.citations
          ? {
              text: searchOutput.summary,
              citations: searchOutput.citations,
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
  const { user } = useUser();
  const [dynamicPadding, setDynamicPadding] = useState(168);
  const messageList = useMemo(() => (Array.isArray(messages) ? messages : []), [messages]);

  useLayoutEffect(() => {
    const calculatePadding = () => {
      const container = document.querySelector('[data-messages-container]');
      const composerEl = document.querySelector('[data-chat-composer]');
      const composerHeight = composerEl ? composerEl.getBoundingClientRect().height : 148;
      const minPadding = composerHeight + 16;

      if (!container || messageList.length < 2) {
        setDynamicPadding(minPadding);
        return;
      }

      const lastTwo = Array.from(container.querySelectorAll('[data-message-id]')).slice(-2);
      const totalHeight = lastTwo.reduce((sum, el) => sum + (el as HTMLElement).offsetHeight, 0);
      const topSpace = 16;
      const totalSpaceBetweenMessages = 48;
      const padding = Math.max(
        minPadding,
        window.innerHeight - totalHeight - totalSpaceBetweenMessages - topSpace
      );

      setDynamicPadding(padding);
    };

    calculatePadding();
    const rafId = requestAnimationFrame(calculatePadding);

    const observer = new ResizeObserver(() => requestAnimationFrame(calculatePadding));
    const container = document.querySelector('[data-messages-container]');

    container
      ?.querySelectorAll('[data-message-id]')
      .forEach((el, i, arr) => i >= arr.length - 2 && observer.observe(el));

    const composerEl = document.querySelector('[data-chat-composer]');
    if (composerEl) observer.observe(composerEl);

    window.addEventListener('resize', calculatePadding);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', calculatePadding);
    };
  }, [messageList]);

  return (
    <div
      data-messages-container
      className="max-w-3xl mx-auto px-4 pt-4"
      style={{ paddingBottom: `${dynamicPadding}px` }}
    >
      <div className="space-y-6">
        {messageList.map((msg, index) => (
          <div
            key={msg.id}
            data-message-id={msg.id}
            className={index === messageList.length - 1 ? 'animate-fade-in' : ''}
          >
            {msg.role === 'user' ? (
              /* User Message */
              <div>
                <div className="relative bg-primary/10 border border-primary/20 rounded-xl p-4 pl-14 min-h-14">
                  <div className="absolute left-3 top-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                    {user?.email ? format.getInitialFromEmail(user.email) : 'U'}
                  </div>

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
                <MessageContent message={msg} variant="assistant" />

                {/* Render tool calls */}
                {(() => {
                  const parts = msg.parts || [];
                  return parts.map((part, partIndex) => {
                    const isToolPart =
                      part.type === 'tool-tavily_web_search' || part.type === 'dynamic-tool';
                    if (!isToolPart) return null;

                    const toolPart = part as DynamicToolPart;
                    const { sources, summary } = parseToolOutput(
                      toolPart.state === 'output-available' ? toolPart.output : undefined
                    );

                    return (
                      <ToolCallStatus
                        key={partIndex}
                        toolName={part.type === 'dynamic-tool' ? toolPart.toolName || 'tool' : 'tavily_web_search'}
                        status={
                          toolPart.state === 'output-available'
                            ? 'success'
                            : toolPart.state === 'output-error'
                            ? 'error'
                            : 'pending'
                        }
                        sources={sources}
                        summary={summary}
                        error={toolPart.state === 'output-error' ? toolPart.errorText : undefined}
                      />
                    );
                  });
                })()}

                {/* Footer: mode + timestamp on left, copy action on right */}
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