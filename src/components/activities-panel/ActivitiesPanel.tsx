import type { ActivitiesPanelProps } from "@/types";
import { cn } from "../../lib/utils";
import { SystemPromptCard } from "./SystemPromptCard";

export function ActivitiesPanel({
    conversationId,
    systemPrompt,
    draftSystemPrompt,
    onSaveSystemPrompt,
    isSavingSystemPrompt,
    isOpen = false,
    onClose,
    isCollapsed = false,
    onToggleCollapse
}: ActivitiesPanelProps) {

    // Determine which system prompt to show
    const displayPrompt = conversationId ? systemPrompt : (draftSystemPrompt || '');
    const isDraft = !conversationId;

    return (
        <aside
            className={cn(
                "fixed right-4 top-4 bottom-4 w-64 flex flex-col z-40 xl:z-10 transition-all duration-300 ease-out",
                // Mobile drawer (below xl): hidden unless opened; overflow hidden keeps the slide clean
                isOpen ? "max-xl:translate-x-0 overflow-hidden" : "max-xl:translate-x-[calc(100%+2rem)] overflow-hidden",
                // Desktop collapse: slide out of view (reopen pill appears at the edge)
                isCollapsed && "xl:translate-x-[calc(100%+2rem)] xl:opacity-0 xl:pointer-events-none xl:z-0"
            )}
        >
            {/* The card owns its header (title, edit trigger, close/collapse controls) */}
            <SystemPromptCard
                systemPrompt={displayPrompt}
                onSaveSystemPrompt={onSaveSystemPrompt}
                isSavingSystemPrompt={isSavingSystemPrompt}
                isDraft={isDraft}
                onClose={onClose}
                onToggleCollapse={onToggleCollapse}
            />
        </aside>
    )
};