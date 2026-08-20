import { useEffect, useRef, useState } from 'react';
import { IoCheckmarkOutline, IoCopyOutline } from 'react-icons/io5';
import { toast } from '../../utils/toast';

interface MessageActionsProps {
  content: string;
}

export function MessageActions({ content }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the pending "copied" reset when the message unmounts
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard');

      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      resetTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 hover:bg-surface-hover rounded-lg transition-smooth"
      title="Copy response"
    >
      {copied ? (
        <IoCheckmarkOutline className="w-4 h-4 text-green-500" />
      ) : (
        <IoCopyOutline className="w-4 h-4 text-foreground/60 hover:text-foreground" />
      )}
    </button>
  );
}