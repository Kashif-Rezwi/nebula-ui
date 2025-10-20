import type { ActivitiesPanelProps } from "@/types";
import { SystemPromptCard } from "./SystemPromptCard";

export function ActivitiesPanel({
    conversationId,
    systemPrompt,
    onSaveSystemPrompt,
    isSavingSystemPrompt
}: ActivitiesPanelProps) {

    if (!conversationId) {
        return null;
    }

    return (
        <aside className="fixed right-4 top-4 bottom-4 w-64 flex flex-col z-10 overflow-hidden">
            <SystemPromptCard
                systemPrompt={systemPrompt}
                onSaveSystemPrompt={onSaveSystemPrompt}
                isSavingSystemPrompt={isSavingSystemPrompt}
            />
        </aside>
    )
};