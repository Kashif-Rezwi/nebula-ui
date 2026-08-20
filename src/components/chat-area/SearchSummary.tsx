import { IoDocumentTextOutline } from 'react-icons/io5';
import { Markdown } from '../common/Markdown';
import type { SearchSummary as SearchSummaryType, WebSearchSource } from '../../types';

interface SearchSummaryProps {
  summary: SearchSummaryType;
  sources: WebSearchSource[];
}

export function SearchSummary({ summary, sources }: SearchSummaryProps) {
  return (
    <div className="my-4">
      {/* Summary Section */}
      <div className="bg-surface border border-border rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <IoDocumentTextOutline className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground/90">Summary</span>
          <span className="text-xs text-foreground/60">
            • {sources.length} sources
          </span>
        </div>

        {/* Summary rendered as markdown, with [1] [2] markers linking to sources.
            Sources themselves live in the expandable web search strip above. */}
        <div className="prose max-w-none text-foreground/90">
          <Markdown citations={sources.map(s => ({ title: s.title, url: s.url }))}>
            {summary.text}
          </Markdown>
        </div>
      </div>
    </div>
  );
}