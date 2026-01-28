import { useCallback, useRef, useState } from 'react';
import { ModeSelector } from './ModeSelector';
import { AttachmentPreview } from './AttachmentPreview';
import { useModePreference } from '../../hooks/useModePreference';
import type { Attachment } from '@/types';

interface InputAreaProps {
  message: string;
  setMessage: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  showModeSelector?: boolean;
  // Attachment props
  attachments?: Attachment[];
  onAttachmentAdd?: (file: File) => void;
  onAttachmentRemove?: (id: string) => void;
  isUploading?: boolean;
}

export function Composer({
  message,
  setMessage,
  onSend,
  onKeyDown,
  disabled = false,
  isStreaming = false,
  textareaRef,
  showModeSelector = false,
  attachments = [],
  onAttachmentAdd,
  onAttachmentRemove,
  isUploading = false,
}: InputAreaProps) {
  // Use centralized mode preference hook
  const { mode: selectedMode, setMode: setSelectedMode } = useModePreference();

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Callback ref that focuses whenever the element is attached/updated
  const callbackRef = useCallback((node: HTMLTextAreaElement | null) => {
    if (node) node.focus();

    // Also assign to the forwarded ref
    if (textareaRef && 'current' in textareaRef) {
      (textareaRef as React.RefObject<HTMLTextAreaElement | null>).current = node;
    };
  }, [isStreaming, disabled, textareaRef]);

  // Handle drag and drop
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Handle multiple files
      Array.from(e.dataTransfer.files).forEach(file => {
        if (onAttachmentAdd) {
            onAttachmentAdd(file);
        }
      });
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAttachmentAdd) {
      onAttachmentAdd(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="relative px-4 bt-0 pb-4">
      <div className="max-w-3xl mx-auto z-10">
        <div 
          className={`bg-[#1a1a1a] rounded-2xl border transition-colors shadow-sm ${
            isDragging ? 'border-primary bg-primary/10' : 'border-[#2a2a2a]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Wrapper with opacity transition - maintains dimensions */}
          <div
            className="transition-opacity duration-300 opacity-100 pointer-events-auto"
          >
            {/* Attachment Previews - Show only if attachments exist */}
            {attachments.length > 0 && (
              <div className="p-4 pb-0">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment) => (
                    <AttachmentPreview
                      key={attachment.id}
                      attachment={attachment}
                      onRemove={onAttachmentRemove || (() => { })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Input Field */}
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
              />
            </div>

            {/* Action Section - Bottom Section */}
            <div className="flex items-center justify-between px-4 pb-4">
              {/* Left Side - 2 Buttons */}
              <div className="flex items-center gap-2">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Attach Button - Now enabled */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || disabled}
                  className="w-8 h-8 rounded-lg border border-[#2a2a2a] hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                  title="Attach file (Image, PDF, DOCX)"
                >
                  <svg className="w-5 h-5 text-[#cccccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
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
                {/* Mode Selector */}
                {showModeSelector && (
                  <ModeSelector
                    currentMode={selectedMode}
                    onModeChange={setSelectedMode}
                    disabled={disabled || isStreaming}
                  />
                )}

                {/* Send Button with Status Indicator */}
                <div className="relative">
                  {/* Status Indicator */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-teal-400 rounded-full"></div>

                  {/* Send Button */}
                  <button
                    onClick={onSend}
                    className="w-8 h-8 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={(!message.trim() && attachments.length === 0) || isStreaming || disabled}
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