import type { SystemPromptCardProps } from "@/types";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { SystemPromptModal } from "./SystemPromptModal";
import ReactMarkdown from 'react-markdown';

export function SystemPromptCard({
    systemPrompt,
    onSaveSystemPrompt,
    isSavingSystemPrompt,
    isDraft
}: SystemPromptCardProps) {

    return (
        <Card className="w-full border border-border bg-[#1a1a1a] rounded-2xl overflow-hidden!">
            <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="text-foreground/80 m-0">Instructions</div>
                    {isDraft && (
                        <span className="text-xs text-foreground/50 bg-foreground/10 px-2 py-0.5 rounded">
                            Draft
                        </span>
                    )}
                </div>
                <SystemPromptModal
                    initialInstructions={systemPrompt}
                    onSave={onSaveSystemPrompt}
                    isSaving={isSavingSystemPrompt}
                    isDraft={isDraft}
                />
            </CardHeader>

            <div className='px-4'>
                <Separator />
            </div>

            <CardContent className="relative h-[200px] px-4 py-2">
                <div className="absolute top-0 left-0 right-0 h-[16px] bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent pointer-events-none z-10" />
                {
                    systemPrompt ? (
                        <div className="w-full h-full text-[12px] text-foreground/40 overflow-y-auto py-1">
                            <ReactMarkdown>
                                {systemPrompt}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <div className="text-sm text-foreground/40">No instructions yet</div>
                    )
                }
                <div className="absolute bottom-0 left-0 right-0 h-[16px] bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent pointer-events-none z-10" />
            </CardContent>
        </Card>
    )

}