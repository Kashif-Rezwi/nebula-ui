import type { ActivitiesPanelProps } from "@/types";
import { SystemPromptCard } from "./SystemPromptCard";

export function ActivitiesPanel({
    conversationId,
    systemPrompt,
    draftSystemPrompt,
    onSaveSystemPrompt,
    isSavingSystemPrompt
}: ActivitiesPanelProps) {

    // Determine which system prompt to show
    const displayPrompt = conversationId ? systemPrompt : (draftSystemPrompt || '');
    const isDraft = !conversationId;

    return (
        <aside className="fixed right-4 top-4 bottom-4 w-64 flex flex-col z-10 overflow-hidden">
            <SystemPromptCard
                systemPrompt={displayPrompt}
                onSaveSystemPrompt={onSaveSystemPrompt}
                isSavingSystemPrompt={isSavingSystemPrompt}
                isDraft={isDraft}
            />
        </aside>
    )
};