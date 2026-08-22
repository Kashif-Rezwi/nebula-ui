import { useState } from 'react';
import { IoCheckmarkOutline, IoChevronDownOutline, IoCloseOutline } from 'react-icons/io5';
import type { WebSearchSource, SearchSummary } from '../../types';
import { SourceCard } from './SourceCard';
import { SearchSummary as SearchSummaryComponent } from './SearchSummary';

interface ToolCallStatusProps {
  toolName?: string;
  status: 'pending' | 'success' | 'error';
  sources?: WebSearchSource[];
  summary?: SearchSummary;
  error?: string;
}

export function ToolCallStatus({
  toolName = 'Web Search',
  status,
  sources = [],
  summary,
  error,
}: ToolCallStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
        );
      case 'success':
        return <IoCheckmarkOutline className="w-4 h-4 text-green-500" />;
      case 'error':
        return <IoCloseOutline className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Searching the web...';
      case 'success':
        return `Found ${sources.length} sources`;
      case 'error':
        return 'Search failed';
    }
  };

  const displayName = toolName === 'tavily_web_search' ? 'Web Search' : toolName;

  return (
    <div className="my-4">
      {/* Tool Call Strip */}
      <button
        onClick={() => status === 'success' && setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-surface border border-border rounded-xl hover:border-primary/50 transition-smooth cursor-pointer"
        disabled={status !== 'success'}
      >
        {/* Left: Icon + Status */}
        <div className="flex items-center gap-2 flex-1">
          {getStatusIcon()}
          <span className="text-sm font-medium text-foreground/90">
            {displayName}
          </span>
          <span className="text-xs text-foreground/60">
            {getStatusText()}
          </span>
        </div>

        {/* Right: Source icons + dropdown */}
        {status === 'success' && sources.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {sources.slice(0, 3).map((source, idx) => (
                <div
                  key={idx}
                  className="w-5 h-5 rounded bg-border border border-background flex items-center justify-center overflow-hidden"
                >
                  {source.favicon ? (
                    <img src={source.favicon} alt="" className="w-4 h-4" />
                  ) : (
                    <span className="text-[10px] text-primary">{idx + 1}</span>
                  )}
                </div>
              ))}
            </div>

            <IoChevronDownOutline
              className={`w-4 h-4 text-foreground/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        )}
      </button>

      {/* Error message */}
      {status === 'error' && error && (
        <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="text-sm text-red-500">{error}</div>
        </div>
      )}

      {/* Sources Container */}
      {status === 'success' && isExpanded && sources.length > 0 && (
        <div className="mt-2 space-y-2 overflow-hidden animate-slide-down">
          <div className="text-xs text-foreground/60 font-medium px-1">All Sources:</div>
          <div className="grid grid-cols-1 gap-2">
            {sources.map((source, index) => (
              <SourceCard key={index} source={source} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {status === 'success' && summary && sources.length > 0 && (
        <div className="transition-all duration-300 ease-out">
          <SearchSummaryComponent summary={summary} sources={sources} />
        </div>
      )}
    </div>
  );
}