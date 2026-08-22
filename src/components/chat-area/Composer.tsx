import { useCallback, useRef, useState } from 'react';
import { IoArrowUpOutline, IoAttachOutline } from 'react-icons/io5';
import { ModeSelector } from './ModeSelector';
import { AttachmentPreview } from './AttachmentPreview';
import { useModePreference } from '../../hooks/useModePreference';
import type { Attachment } from '@/types';

interface ComposerProps {
  message: string;
  setMessage: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  showModeSelector?: boolean;
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
}: ComposerProps) {
  const { mode: selectedMode, setMode: setSelectedMode } = useModePreference();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const callbackRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      if (node) {
        node.focus();
      }

      if (textareaRef && 'current' in textareaRef) {
        (textareaRef as React.RefObject<HTMLTextAreaElement | null>).current = node;
      }
    },
    [textareaRef]
  );

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
      Array.from(e.dataTransfer.files).forEach((file) => {
        if (onAttachmentAdd) {
          onAttachmentAdd(file);
        }
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAttachmentAdd) {
      onAttachmentAdd(file);
    }
    e.target.value = '';
  };

  return (
    <div className="relative px-4 pb-4">
      <div className="max-w-3xl mx-auto z-10">
        <div
          className={`bg-surface rounded-2xl border transition-colors shadow-sm ${
            isDragging ? 'border-primary bg-primary/10' : 'border-border'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="transition-opacity duration-300 opacity-100 pointer-events-auto">
            {/* Attachment Previews */}
            {attachments.length > 0 && (
              <div className="p-4 pb-0">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment) => (
                    <AttachmentPreview
                      key={attachment.id}
                      attachment={attachment}
                      onRemove={onAttachmentRemove || (() => {})}
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
                className="w-full bg-transparent text-[15px] text-foreground focus:outline-none resize-none overflow-y-auto placeholder:text-foreground/40 leading-6"
                rows={1}
                style={{ minHeight: '24px', maxHeight: '200px' }}
              />
            </div>

            {/* Action Section */}
            <div className="flex items-center justify-between px-4 pb-4">
              {/* Left Side: Attach File */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || disabled}
                  className="w-8 h-8 rounded-lg border border-border hover:bg-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                  title="Attach file (Image, PDF, DOCX)"
                >
                  <IoAttachOutline className="w-5 h-5 text-foreground/80" />
                </button>
              </div>

              {/* Right Side: Mode Selector + Send */}
              <div className="flex items-center gap-2">
                {showModeSelector && (
                  <ModeSelector
                    currentMode={selectedMode}
                    onModeChange={setSelectedMode}
                    disabled={disabled || isStreaming}
                  />
                )}

                <button
                  type="button"
                  onClick={onSend}
                  className="w-8 h-8 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                  disabled={(!message.trim() && attachments.length === 0) || isStreaming || disabled}
                  title="Send message"
                >
                  <IoArrowUpOutline className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}