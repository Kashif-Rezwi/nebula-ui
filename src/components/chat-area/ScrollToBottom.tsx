import { IoArrowDownOutline } from 'react-icons/io5';

interface ScrollToBottomProps {
  onClick: () => void;
  show: boolean;
  isStreaming?: boolean;
}

export function ScrollToBottom({ onClick, show, isStreaming = false }: ScrollToBottomProps) {
  // Always render the fade band above the composer so messages sliding under it
  // keep a consistent faded look (matching the top). It sits at a small baseline
  // height when idle and cleanly grows to a full fade (revealing the scroll
  // button) when chat content is actually behind the composer / streaming.
  return (
    <div
      className={`pointer-events-none sticky bottom-0 left-0 right-0 flex justify-center transition-all duration-300 ease-out bg-gradient-to-t from-background via-background/80 to-transparent ${show ? 'h-[68px]' : 'h-8'}`}
    >
      <div className={`relative transition-all duration-300 ${show ? 'py-4 pointer-events-auto' : 'py-1 pointer-events-none'}`}>
        {show && (
          <button
            onClick={onClick}
            className={`p-2 rounded-full shadow-lg transition-all ${isStreaming
                ? 'bg-primary text-white animate-pulse-subtle'
                : 'bg-secondary hover:bg-surface-hover text-foreground/80'
              }`}
            title="Scroll to bottom"
          >
            <IoArrowDownOutline className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}