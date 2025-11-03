import { useCallback } from 'react';

interface InputAreaProps {
  message: string;
  setMessage: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function Composer({
  message,
  setMessage,
  onSend,
  onKeyDown,
  disabled = false,
  isStreaming = false,
  textareaRef,
}: InputAreaProps) {
  // Callback ref that focuses whenever the element is attached/updated
  const callbackRef = useCallback((node: HTMLTextAreaElement | null) => {
    if (node) node.focus();

    // Also assign to the forwarded ref
    if (textareaRef && 'current' in textareaRef) {
      (textareaRef as React.RefObject<HTMLTextAreaElement | null>).current = node;
    };
  }, [isStreaming, disabled, textareaRef]);

  return (
    <div className="relative px-4 bt-0 pb-4">
      <div className="max-w-3xl mx-auto z-10">
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-sm">
          {/* Wrapper with opacity transition - maintains dimensions */}
          <div
            className="transition-opacity duration-300 opacity-100 pointer-events-auto}"
          >
            {/* Input Field - Top Section */}
            <div className="p-4">
              <textarea
                autoFocus
                ref={callbackRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                onKeyDown={onKeyDown}
                placeholder="Reply to better DEV..."
                className="w-full bg-transparent text-[15px] text-white focus:outline-none resize-none overflow-y-auto placeholder:text-[#666666] leading-6"
                rows={1}
                style={{ minHeight: '24px', maxHeight: '200px' }}
                // disabled={disabled || isStreaming}
              />
            </div>

            {/* Action Section - Bottom Section */}
            <div className="flex items-center justify-between px-4 pb-4">
              {/* Left Side - 2 Buttons */}
              <div className="flex items-center gap-2">
                {/* Plus Button */}
                <button
                  disabled
                  className="w-8 h-8 rounded-lg border border-[#2a2a2a] hover:bg-white/10 transition-colors disabled:cursor-not-allowed flex items-center justify-center"
                  title="Attach (Coming soon)"
                >
                  <svg className="w-5 h-5 text-[#cccccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                {/* Filter/Settings Button */}
                <button
                  disabled
                  className="w-8 h-8 rounded-lg border border-[#2a2a2a] hover:bg-white/10 transition-colors disabled:cursor-not-allowed flex items-center justify-center"
                  title="Settings (Coming soon)"
                >
                  <svg className="w-5 h-5 text-[#cccccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    <circle cx="8" cy="6" r="2" fill="currentColor" />
                    <circle cx="16" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="18" r="2" fill="currentColor" />
                  </svg>
                </button>
              </div>

              {/* Right Side - 2 Buttons */}
              <div className="flex items-center gap-2">
                {/* Model Selector */}
                <button
                  disabled
                  className="h-8 px-3 rounded-lg text-sm text-[#cccccc] hover:bg-white/10 transition-colors flex items-center gap-1 disabled:cursor-not-allowed"
                  title="Model (Coming soon)"
                >
                  Llama-3.1-8b-instant
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Send Button with Status Indicator */}
                <div className="relative">
                  {/* Status Indicator */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-teal-400 rounded-full"></div>
                  
                  {/* Send Button */}
                  <button
                    onClick={onSend}
                    className="w-8 h-8 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={!message.trim() || isStreaming || disabled}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}