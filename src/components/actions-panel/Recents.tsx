import { useState } from 'react';
import { IoTrashOutline } from 'react-icons/io5';
import type { Conversation } from '../../types';
import { SidebarSkeleton } from '../common/Skeleton';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { format } from '../../utils';

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
  handleDeleteConversation,
}: RecentsProps) {
  // Conversation awaiting delete confirmation
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const requestDeleteConversation = (conv: Conversation) => {
    setConversationToDelete(conv);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      handleDeleteConversation(conversationToDelete.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const conversationList = Array.isArray(conversations) ? conversations : [];

  return (
    <div className="p-4 flex flex-col gap-2">
      <div className="text-xs font-medium text-foreground/50 px-2">
        Recents
      </div>

      {/* Wrapper with fade effect */}
      <div className="relative max-h-[calc(100vh-250px)]">
        {/* Top fade overlay */}
        <div className="absolute top-0 left-0 right-0 h-[10px] bg-gradient-to-b from-surface via-surface/80 to-transparent pointer-events-none z-10" />

        {/* Scrollable content */}
        <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
          {loading ? (
            <SidebarSkeleton />
          ) : conversationList.length === 0 ? (
            <div className="px-2 py-2 text-sm text-foreground/50">
              No conversations yet
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2 pb-[68px]">
              {conversationList.map((conv, index) => (
                <div
                  key={conv.id}
                  className={`relative group flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-smooth animate-fade-in ${
                    currentConversationId === conv.id
                      ? 'bg-surface-hover text-foreground'
                      : 'hover:bg-surface-hover text-foreground/80'
                  }`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                  onClick={() => handleConversationClick(conv.id)}
                >
                  <div className="flex-1 truncate">
                    {conv.title || 'Untitled'}
                  </div>

                  <div className="absolute right-1 top-1/2 -translate-y-1/2 w-full flex items-center justify-end gap-1 group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-surface-hover/90 group-hover:to-surface-hover">
                    <span className="text-xs text-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity">
                      {format.formatDate(conv.updatedAt)}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDeleteConversation(conv);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded transition-smooth cursor-pointer"
                      title="Delete conversation"
                    >
                      <IoTrashOutline className="w-4 h-4 text-foreground/80 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete conversation"
        description={`Are you sure you want to delete "${conversationToDelete?.title || 'Untitled'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}