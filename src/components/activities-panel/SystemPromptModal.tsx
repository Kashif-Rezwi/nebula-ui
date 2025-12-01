import React, { useState } from 'react';
import {
  Dialog,
  DialogFooter,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '../ui/dialog';
import { FiEdit2 } from "react-icons/fi";
import { Button } from '../ui/button';
import type { SystemPromptModalProps } from '@/types';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';

export function SystemPromptModal({
  initialInstructions,
  onSave,
  isSaving = false,
  isDraft = false
}: SystemPromptModalProps) {
  const [instructions, setInstructions] = useState(initialInstructions);
  const maxInputLength = 2000;

  const handleSave = () => {
    onSave(instructions?.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="cursor-pointer">
          <FiEdit2 className="text-foreground/80" />
        </button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-3xl bg-[#1a1a1a] border border-border rounded-2xl!">
        <DialogHeader>
          <DialogTitle>Set project instructions</DialogTitle>
          <DialogDescription>
            Provide relevant instructions and information for chats within this conversation
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 h-[60vh]">
          <Textarea
            defaultValue={initialInstructions}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter instructions for this conversation..."
            className="w-full h-full bg-[#262626] text-foreground rounded-xl p-4 border border-border resize-none font-mono text-sm"
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
            <DialogClose asChild>
              <div className="flex items-center gap-3">
                <Button variant="outline">Cancel</Button>
                <Button
                  type="submit"
                  className='bg-primary/80'
                  onClick={handleSave}
                >
                  {isDraft ? 'Set for New Chat' : 'Save changes'}
                </Button>
              </div>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}