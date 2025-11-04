import { useState } from 'react';
// import ReactMarkdown from 'react-markdown';
import type { SearchSummary as SearchSummaryType, WebSearchSource } from '../../types';

interface SearchSummaryProps {
  summary: SearchSummaryType;
  sources: WebSearchSource[];
}

export function SearchSummary({ summary, sources }: SearchSummaryProps) {
  const [expandedCitations, setExpandedCitations] = useState<Set<number>>(new Set());

  const toggleCitation = (index: number) => {
    setExpandedCitations(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Replace citation markers with clickable elements
  const renderSummaryWithCitations = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Find all citation markers [1], [2], etc.
    const citationRegex = /\[(\d+)\]/g;
    let match;
    
    const text = summary.text;
    
    while ((match = citationRegex.exec(text)) !== null) {
      const sourceIndex = parseInt(match[1]) - 1;
      
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add clickable citation
      if (sourceIndex >= 0 && sourceIndex < sources.length) {
        parts.push(
          <button
            key={`cite-${match.index}`}
            onClick={() => toggleCitation(sourceIndex)}
            className="inline-flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors mx-0.5"
            title={`Source: ${sources[sourceIndex].title}`}
          >
            [{match[1]}]
          </button>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  };

  return (
    <div className="my-4">
      {/* Summary Section */}
      <div className="bg-[#1a1a1a] border border-border rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-semibold text-foreground/90">Summary</span>
          <span className="text-xs text-foreground/60">
            • {sources.length} sources
          </span>
        </div>

        {/* Summary Text with Inline Citations */}
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {renderSummaryWithCitations()}
          </div>
        </div>

        {/* Expanded Citation Previews */}
        {expandedCitations.size > 0 && (
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            {Array.from(expandedCitations).map(index => {
              const source = sources[index];
              return (
                <div
                  key={index}
                  className="bg-[#0f0f0f] border border-border/50 rounded-lg p-3 animate-fade-in"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-primary mt-0.5">[{index + 1}]</span>
                    <div className="flex-1 min-w-0">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors line-clamp-1 block"
                      >
                        {source.title}
                      </a>
                      <p className="text-xs text-foreground/60 mt-1 line-clamp-2">
                        {source.snippet}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-foreground/40 truncate">
                          {new URL(source.url).hostname}
                        </span>
                        {source.relevanceScore > 0 && (
                          <span className="text-xs text-primary">
                            {Math.round(source.relevanceScore * 100)}% match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}