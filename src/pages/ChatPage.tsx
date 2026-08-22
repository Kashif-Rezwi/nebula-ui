import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { IoDocumentTextOutline, IoMenuOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { ActionsPanel } from '../components/actions-panel/ActionsPanel';
import { ChatArea } from '../components/chat-area/ChatArea';
import { useConversation, useUpdateSystemPrompt } from '../hooks/conversations';
import { ActivitiesPanel } from '../components/activities-panel/ActivitiesPanel';
import { usePanelState } from '../hooks/ui/usePanelState';

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();

  // Fetch conversation data to get system prompt
  const { data: conversation } = useConversation(conversationId);

  // Mutation for updating system prompt
  const { mutate: updateSystemPrompt, isPending: isSaving } = useUpdateSystemPrompt();

  // Draft system prompt state (for /new route)
  const [draftSystemPrompt, setDraftSystemPrompt] = useState('');

  // Panel state hook (handles desktop collapse, mobile drawers, and escape key)
  const {
    isActionsOpen,
    setIsActionsOpen,
    isActivitiesOpen,
    setIsActivitiesOpen,
    isLeftCollapsed,
    isRightCollapsed,
    toggleLeftPanel,
    toggleRightPanel,
  } = usePanelState(conversationId);

  const handleSaveSystemPrompt = (systemPrompt: string) => {
    if (!conversationId) {
      setDraftSystemPrompt(systemPrompt);
      return;
    }

    updateSystemPrompt({ id: conversationId, systemPrompt });
  };

  return (
    <div className="relative h-screen">
      {/* Main Content - Full width */}
      <ChatArea
        key={conversationId}
        conversationId={conversationId}
        title={conversation?.title}
        draftSystemPrompt={draftSystemPrompt}
        onDraftSystemPromptChange={setDraftSystemPrompt}
        isLeftPanelCollapsed={isLeftCollapsed}
        isRightPanelCollapsed={isRightCollapsed}
      />

      {/* Mobile toggle - Left panel */}
      <button
        onClick={() => setIsActionsOpen(true)}
        className="fixed left-4 top-4 z-20 lg:hidden w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground/80 hover:bg-surface-hover transition-smooth cursor-pointer"
        title="Open menu"
      >
        <IoMenuOutline className="w-5 h-5" />
      </button>

      {/* Mobile toggle - Right panel */}
      <button
        onClick={() => setIsActivitiesOpen(true)}
        className="fixed right-4 top-4 z-20 xl:hidden w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground/80 hover:bg-surface-hover transition-smooth cursor-pointer"
        title="Open instructions"
      >
        <IoDocumentTextOutline className="w-5 h-5" />
      </button>

      {/* Backdrops for mobile drawers */}
      {isActionsOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden animate-fade-in"
          onClick={() => setIsActionsOpen(false)}
        />
      )}
      {isActivitiesOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 xl:hidden animate-fade-in"
          onClick={() => setIsActivitiesOpen(false)}
        />
      )}

      {/* Left Sidebar - Floating overlay */}
      <ActionsPanel
        currentConversationId={conversationId}
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        isCollapsed={isLeftCollapsed}
        onToggleCollapse={toggleLeftPanel}
      />

      {/* Reopen pills on desktop */}
      {isLeftCollapsed && (
        <button
          onClick={toggleLeftPanel}
          className="hidden lg:flex fixed left-4 top-4 z-20 w-10 h-10 rounded-xl bg-surface border border-border items-center justify-center text-foreground/80 hover:bg-surface-hover transition-smooth animate-fade-in cursor-pointer"
          title="Show menu"
        >
          <IoChevronForwardOutline className="w-5 h-5" />
        </button>
      )}
      {isRightCollapsed && (
        <button
          onClick={toggleRightPanel}
          className="hidden xl:flex fixed right-4 top-4 z-20 w-10 h-10 rounded-xl bg-surface border border-border items-center justify-center text-foreground/80 hover:bg-surface-hover transition-smooth animate-fade-in cursor-pointer"
          title="Show instructions"
        >
          <IoChevronForwardOutline className="w-5 h-5 rotate-180" />
        </button>
      )}

      {/* Right Sidebar - Instructions */}
      <ActivitiesPanel
        systemPrompt={conversation?.systemPrompt || ''}
        draftSystemPrompt={draftSystemPrompt}
        conversationId={conversationId}
        onSaveSystemPrompt={handleSaveSystemPrompt}
        isSavingSystemPrompt={isSaving}
        isOpen={isActivitiesOpen}
        onClose={() => setIsActivitiesOpen(false)}
        isCollapsed={isRightCollapsed}
        onToggleCollapse={toggleRightPanel}
      />
    </div>
  );
}

export default ChatPage;