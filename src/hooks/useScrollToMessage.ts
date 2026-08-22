import { useCallback } from 'react';

interface UseScrollToMessageOptions {
  offset?: number;
  behavior?: ScrollBehavior;
}

export function useScrollToMessage(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const scrollToMessage = useCallback(
    (messageId: string, options: UseScrollToMessageOptions = {}) => {
      const { offset = 0, behavior = 'smooth' } = options;

      if (!containerRef.current) {
        return;
      }

      const messageElement = containerRef.current.querySelector(
        `[data-message-id="${messageId}"]`
      ) as HTMLElement | null;

      if (!messageElement) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const messageRect = messageElement.getBoundingClientRect();

      const scrollTop =
        containerRef.current.scrollTop +
        (messageRect.top - containerRect.top) -
        offset;

      containerRef.current.scrollTo({
        top: Math.max(0, scrollTop),
        behavior,
      });
    },
    [containerRef]
  );

  return { scrollToMessage };
}