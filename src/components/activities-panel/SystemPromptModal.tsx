import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogFooter,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '../ui/dialog';
import { IoPencil } from 'react-icons/io5';
import { Button } from '../ui/button';
import type { SystemPromptModalProps } from '@/types';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';

export function SystemPromptModal({
  initialInstructions,
  onSave,
  isSaving = false,
  isDraft = false,
}: SystemPromptModalProps) {
  const [open, setOpen] = useState(false);
  const [instructions, setInstructions] = useState(initialInstructions);
  const maxInputLength = 2000;

  // Keep state in sync with external instructions changes
  useEffect(() => {
    setInstructions(initialInstructions);
  }, [initialInstructions, open]);

  const handleSave = () => {
    onSave(instructions.trim());
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="w-7 h-7 rounded-lg bg-surface-hover/80 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-surface-hover transition-smooth cursor-pointer"
          title="Edit instructions"
        >
          <IoPencil className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-2rem)] max-w-3xl bg-surface border border-border rounded-2xl!">
        <DialogHeader>
          <DialogTitle>Set project instructions</DialogTitle>
          <DialogDescription>
            Provide relevant instructions and information for chats within this conversation
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 h-[60vh]">
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter instructions for this conversation..."
            className="w-full h-full bg-surface-hover text-foreground rounded-xl p-4 border border-border resize-none font-mono text-sm"
            maxLength={maxInputLength}
            disabled={isSaving}
            autoFocus
          />
        </div>

        <Separator />

        <DialogFooter>
          <div className="w-full flex items-center justify-between">
            <div className="text-sm text-foreground/60">
              {instructions.length} / {maxInputLength} characters
            </div>
            <div className="flex items-center gap-3">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-primary/80"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : isDraft ? 'Set for New Chat' : 'Save changes'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}