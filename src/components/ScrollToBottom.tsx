interface ScrollToBottomProps {
    onClick: () => void;
    show: boolean;
    isStreaming?: boolean;
  }
  
  export function ScrollToBottom({ onClick, show, isStreaming = false }: ScrollToBottomProps) {
    return (
      <div className="sticky h-[68px] bottom-0 left-0 right-0 flex justify-center pointer-events-none z-10">        
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