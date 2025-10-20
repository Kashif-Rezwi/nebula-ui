import type { SystemPromptCardProps } from "@/types";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { SystemPromptModal } from "./SystemPromptModal";

export function SystemPromptCard({
    systemPrompt,
    onSaveSystemPrompt,
    isSavingSystemPrompt
}: SystemPromptCardProps) {

    return (
        <Card className="w-full border border-border bg-[#1a1a1a] rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
                <div className="text-foreground/80 m-0">Instructions</div>
                <SystemPromptModal
                    initialInstructions={systemPrompt}
                    onSave={onSaveSystemPrompt}
                    isSaving={isSavingSystemPrompt}
                />
            </CardHeader>

            <div className='px-4'>
                <Separator />
            </div>

            <CardContent className="h-[200px] px-4 py-3">
                {
                    systemPrompt ? (
                        <div className="text-sm text-foreground/40">{systemPrompt}</div>
                    ) : (
                        <div className="text-sm text-foreground/40">No instructions yet</div>
                    )
                }
            </CardContent>
        </Card>
    )

}