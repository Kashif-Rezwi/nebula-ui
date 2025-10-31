import { useCallback } from 'react';

interface UseScrollToMessageOptions {
  offset?: number;
  behavior?: ScrollBehavior;
}

// Hook for scrolling to a specific message in a scrollable container
export function useScrollToMessage(
  containerRef: React.RefObject<HTMLDivElement>
) {
  const scrollToMessage = useCallback(
    (messageId: string, options: UseScrollToMessageOptions = {}) => {
      const { offset = 0, behavior = 'smooth' } = options;
      
      // Ensure container exists
      if (!containerRef.current) {
        console.warn('Container ref is not available');
        return;
      }

      // Find the message element by its data-message-id attribute
      const messageElement = containerRef.current.querySelector(
        `[data-message-id="${messageId}"]`
      ) as HTMLElement;

      if (!messageElement) {
        console.warn(`Message with ID "${messageId}" not found in the DOM`);
        return;
      }

      // Get positions
      const containerRect = containerRef.current.getBoundingClientRect();
      const messageRect = messageElement.getBoundingClientRect();
      
      // Calculate scroll position to position message at top with offset
      // Formula: current scroll position + message position relative to container - offset
      const scrollTop = 
        containerRef.current.scrollTop + 
        (messageRect.top - containerRect.top) - 
        offset;

      // Perform the scroll
      containerRef.current.scrollTo({
        top: Math.max(0, scrollTop), // Ensure we don't scroll to negative values
        behavior,
      });
    },
    [containerRef]
  );

  return { scrollToMessage };
}