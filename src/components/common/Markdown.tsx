import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IoCheckmarkOutline, IoCopyOutline } from 'react-icons/io5';

interface Citation {
  title: string;
  url: string;
}

interface MarkdownProps {
  children: string;
  // Render citation markers like [1], [2] as links that open the referenced
  // source in a new tab. Used for search summaries.
  citations?: Citation[];
}

// Recursively extract plain text from rendered children (used for the copy button)
function extractText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return '';
}

// Extract language from the code element's className (e.g. "language-ts")
function extractLanguage(node: ReactNode): string | null {
  if (React.isValidElement(node)) {
    const className = (node.props as { className?: string }).className;
    const match = className?.match(/language-(\w+)/);
    if (match) return match[1];
  }
  return null;
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const language = extractLanguage(children);
  const codeText = extractText(children).replace(/\n$/, '');

  // Clear the pending "Copied" reset when the block unmounts
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      resetTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="text-xs font-medium text-foreground/50">{language ?? 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-foreground/50 hover:text-foreground transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <IoCheckmarkOutline className="w-3.5 h-3.5 text-green-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <IoCopyOutline className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  );
}

export function Markdown({ children, citations }: MarkdownProps) {
  // Build a custom text renderer only when citation handling is requested
  const textRenderer = citations
    ? ({ children: text }: { children?: ReactNode }) => {
        if (typeof text !== 'string' || !text.includes('[')) {
          return <>{text}</>;
        }

        const parts: ReactNode[] = [];
        const citationRegex = /\[(\d+)\]/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = citationRegex.exec(text)) !== null) {
          const sourceIndex = parseInt(match[1], 10) - 1;

          if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
          }

          const citation = citations[sourceIndex];
          if (citation) {
            parts.push(
              <a
                key={`cite-${match.index}`}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors mx-0.5 no-underline"
                title={`Source: ${citation.title}`}
              >
                [{match[1]}]
              </a>
            );
          } else {
            parts.push(match[0]);
          }

          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
          parts.push(text.substring(lastIndex));
        }

        return <>{parts}</>;
      }
    : undefined;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Code blocks get a themed header with a copy button
        pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        // Links open in a new tab
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        // Tables scroll horizontally on small screens
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table>{children}</table>
          </div>
        ),
        ...(textRenderer ? { text: textRenderer } : {}),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
