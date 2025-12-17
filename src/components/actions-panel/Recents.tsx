import { CgRemove } from "react-icons/cg";
import type { Conversation } from "../../types";
import { SidebarSkeleton } from "../common/Skeleton";
import { format } from "../../utils";

interface RecentsProps {
    loading: boolean;
    conversations: Conversation[];
    currentConversationId: string;
    handleConversationClick: (conversationId: string) => void;
    handleDeleteConversation: (conversationId: string) => void;
}

export function Recents({
    loading,
    conversations,
    currentConversationId,
    handleConversationClick,
    handleDeleteConversation }: RecentsProps) {

    return (
        <div className="p-4 flex flex-col gap-2">
            <div className="text-xs font-medium text-foreground/50 px-2">
                Recents
            </div>

            {/* Wrapper with fade effect */}
            <div className="relative max-h-[calc(100vh-250px)]">
                {/* Top fade overlay - match sidebar bg color */}
                <div className="absolute top-0 left-0 right-0 h-[10px] bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent pointer-events-none z-10" />

                {/* Scrollable content */}
                <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                    {loading ? (
                        <SidebarSkeleton />
                    ) : conversations.length === 0 ? (
                        <div className="px-2 py-2 text-sm text-foreground/50">
                            No conversations yet
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 pt-2 pb-[68px]">
                            {conversations?.map((conv, index) => (
                                <div
                                    key={conv.id}
                                    className={`relative group flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-smooth animate-fade-in ${currentConversationId === conv.id
                                        ? 'bg-[#262626] text-foreground'
                                        : 'hover:bg-[#262626] text-foreground/80'
                                        }`}
                                    style={{ animationDelay: `${index * 0.03}s` }}
                                    onClick={() => handleConversationClick(conv.id)}
                                >
                                    <div className="flex-1 truncate">
                                        {conv.title || 'Untitled'}
                                    </div>

                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 w-full flex items-center justify-end gap-1 group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-[#262626]/90 group-hover:to-[#262626]">
                                        <span className="text-xs text-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {format.formatDate(conv.updatedAt)}
                                        </span>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteConversation(conv.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded transition-smooth"
                                            title="Delete conversation"
                                        >
                                            <CgRemove className="w-5 h-5 text-foreground/80 hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        </div>
    )
};