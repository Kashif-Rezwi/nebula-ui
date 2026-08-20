import type { SystemPromptCardProps } from "@/types";
import { IoChevronForwardOutline, IoCloseOutline, IoDocumentTextOutline } from "react-icons/io5";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { SystemPromptModal } from "./SystemPromptModal";
import { Markdown } from "../common/Markdown";

export function SystemPromptCard({
    systemPrompt,
    onSaveSystemPrompt,
    isSavingSystemPrompt,
    isDraft,
    onClose,
    onToggleCollapse
}: SystemPromptCardProps) {

    return (
        <Card className="relative w-full border border-border bg-surface rounded-2xl overflow-hidden!">
            {/* In-card header: icon + title on the left; draft badge, edit trigger
                and the panel controls on the right (close on mobile drawer,
                collapse on desktop — the reopen pill appears at the screen edge).
                All three controls share the same 28px button treatment + icon size. */}
            <CardHeader className="flex flex-row items-center gap-2.5 px-4 py-3">
                <IoDocumentTextOutline className="w-[15px] h-[15px] text-foreground/60 flex-shrink-0" />
                <h2 className="flex-1 min-w-0 truncate text-[15px] font-medium leading-none text-foreground/80">
                    Instructions
                </h2>

                {isDraft && (
                    <span className="text-xs text-foreground/50 bg-foreground/10 px-2 py-0.5 rounded">
                        Draft
                    </span>
                )}

                <div className="flex items-center gap-1.5">
                    <SystemPromptModal
                        initialInstructions={systemPrompt}
                        onSave={onSaveSystemPrompt}
                        isSaving={isSavingSystemPrompt}
                        isDraft={isDraft}
                    />

                    {/* Mobile close (drawer mode) */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="xl:hidden w-7 h-7 rounded-lg bg-surface-hover/80 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-surface-hover transition-smooth"
                            title="Close panel"
                        >
                            <IoCloseOutline className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Desktop collapse */}
                    {onToggleCollapse && (
                        <button
                            onClick={onToggleCollapse}
                            className="hidden xl:flex w-7 h-7 rounded-lg bg-surface-hover/80 items-center justify-center text-foreground/70 hover:text-foreground hover:bg-surface-hover transition-smooth"
                            title="Hide instructions"
                        >
                            <IoChevronForwardOutline className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </CardHeader>

            {/* Divider between the header and the instructions content */}
            <div className="px-4">
                <Separator />
            </div>

            {/* Full-bleed content: zero horizontal padding so the scrollable area
                spans the entire card width. `relative` anchors the edge fades to
                the content area (below the header), not the card. */}
            <CardContent className="relative h-[200px] p-0">
                {
                    systemPrompt ? (
                        <div className="prose prose-muted max-w-none w-full h-full overflow-y-auto px-4 py-3">
                            <Markdown>
                                {systemPrompt}
                            </Markdown>
                        </div>
                    ) : (
                        <div className="text-sm text-foreground/40 px-4 py-3">No instructions yet</div>
                    )
                }

                {/* Fades so content scrolls out smoothly at both edges */}
                <div className="absolute top-0 left-0 right-0 h-[16px] bg-gradient-to-b from-surface via-surface/80 to-transparent pointer-events-none z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-[16px] bg-gradient-to-t from-surface via-surface/80 to-transparent pointer-events-none z-10" />
            </CardContent>
        </Card>
    )

}