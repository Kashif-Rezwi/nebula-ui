import type { ActivitiesPanelProps } from '@/types';
import { cn } from '../../utils/cn';
import { SystemPromptCard } from './SystemPromptCard';

export function ActivitiesPanel({
  conversationId,
  systemPrompt,
  draftSystemPrompt,
  onSaveSystemPrompt,
  isSavingSystemPrompt,
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: ActivitiesPanelProps) {
  const displayPrompt = conversationId ? systemPrompt : draftSystemPrompt || '';
  const isDraft = !conversationId;

  return (
    <aside
      className={cn(
        'fixed right-4 top-4 bottom-4 w-64 flex flex-col z-40 xl:z-10 transition-all duration-300 ease-out',
        isOpen ? 'max-xl:translate-x-0 overflow-hidden' : 'max-xl:translate-x-[calc(100%+2rem)] overflow-hidden',
        isCollapsed && 'xl:translate-x-[calc(100%+2rem)] xl:opacity-0 xl:pointer-events-none xl:z-0'
      )}
    >
      <SystemPromptCard
        systemPrompt={displayPrompt}
        onSaveSystemPrompt={onSaveSystemPrompt}
        isSavingSystemPrompt={isSavingSystemPrompt}
        isDraft={isDraft}
        onClose={onClose}
        onToggleCollapse={onToggleCollapse}
      />
    </aside>
  );
}