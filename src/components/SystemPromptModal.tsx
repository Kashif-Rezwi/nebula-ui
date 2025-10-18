import { useState, useEffect } from 'react';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (systemPrompt: string) => void;
  initialValue: string;
  isSaving?: boolean;
}

export function SystemPromptModal({
  isOpen,
  onClose,
  onSave,
  initialValue,
  isSaving = false,
}: SystemPromptModalProps) {
  const [value, setValue] = useState(initialValue);
  const maxLength = 2000;

  // Sync with initialValue when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSave = () => {
    onSave(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    // Escape to cancel
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
      <div className="w-full max-w-3xl h-[90vh] bg-[#1a1a1a] border border-border rounded-2xl flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Set project instructions</h2>
            <p className="text-sm text-foreground/60 mt-1">
              Provide Claude with relevant instructions and information for chats within this conversation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#262626] rounded-lg transition-smooth"
            disabled={isSaving}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter instructions for this conversation..."
            className="w-full h-full bg-[#262626] text-foreground rounded-lg p-4 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm leading-relaxed"
            maxLength={maxLength}
            disabled={isSaving}
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          {/* Character count */}
          <div className="text-sm text-foreground/60">
            {value.length} / {maxLength} characters
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm hover:bg-[#262626] rounded-lg transition-smooth"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || value.trim() === initialValue.trim()}
              className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save instructions'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}