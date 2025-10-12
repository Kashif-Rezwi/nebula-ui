interface ScrollToBottomProps {
    onClick: () => void;
    show: boolean;
    isStreaming?: boolean;
  }
  
  export function ScrollToBottom({ onClick, show, isStreaming = false }: ScrollToBottomProps) {
    return (
      <div className="sticky bottom-0 left-0 right-0 flex justify-center pointer-events-none z-10">
        {/* Gradient fade background - always visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent h-18"></div>
        
        {/* Button - toggles visibility - smaller size */}
        {show && (
          <div className="relative py-4 animate-fade-in">
            <button
              onClick={onClick}
              className={`pointer-events-auto p-2 rounded-full shadow-lg transition-all ${
                isStreaming
                  ? 'bg-primary text-white animate-pulse-subtle'
                  : 'bg-[#2a2a2a] hover:bg-[#333333] text-foreground/80'
              }`}
              title="Scroll to bottom"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }