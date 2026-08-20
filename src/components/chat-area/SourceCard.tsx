import { IoOpenOutline } from 'react-icons/io5';
import type { WebSearchSource } from '../../types';

interface SourceCardProps {
  source: WebSearchSource;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const handleClick = () => {
    window.open(source.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border hover:border-primary/50 transition-smooth text-left group"
      title={`Open ${source.title}`}
    >
      {/* Favicon */}
      <div className="flex-shrink-0 mt-1">
        {source.favicon ? (
          <img
            src={source.favicon}
            alt=""
            className="w-5 h-5 rounded"
            onError={(e) => {
              // Fallback to default icon if favicon fails
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
            <span className="text-xs text-primary font-medium">{index + 1}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground/90 group-hover:text-primary transition-smooth line-clamp-1">
          {source.title}
        </div>
        <div className="text-xs text-foreground/60 mt-1 line-clamp-2">
          {source.snippet}
        </div>
        <div className="text-xs text-foreground/40 mt-1 flex items-center gap-2">
          <span className="truncate">{new URL(source.url).hostname}</span>
          {source.relevanceScore > 0 && (
            <span className="text-primary">
              {Math.round(source.relevanceScore * 100)}% match
            </span>
          )}
        </div>
      </div>

      {/* Arrow Icon */}
      <div className="flex-shrink-0">
        <IoOpenOutline className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-smooth" />
      </div>
    </button>
  );
}