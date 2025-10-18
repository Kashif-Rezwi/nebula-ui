interface InstructionsPanelProps {
  systemPrompt?: string;
  onEdit: () => void;
  conversationId?: string;
}

export function InstructionsPanel({
  systemPrompt,
  onEdit,
  conversationId,
}: InstructionsPanelProps) {

  if (!conversationId) {
    return null;
  }

  return (
    <aside className="fixed right-4 top-4 bottom-4 w-64 border border-border bg-[#1a1a1a] flex flex-col z-10 rounded-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold">Instructions</h3>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-[#262626] rounded-lg transition-smooth"
          title="Edit instructions"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {systemPrompt ? (
          <div className="space-y-3">
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap bg-[#262626] rounded-lg p-4 border border-border">
              {systemPrompt}
            </div>
            <p className="text-xs text-foreground/50">
              These instructions will be prepended to every message in this conversation.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-[#262626] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-foreground/60 mb-3">No instructions yet</p>
            <button
              onClick={onEdit}
              className="text-sm text-primary hover:underline"
            >
              Add instructions
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}