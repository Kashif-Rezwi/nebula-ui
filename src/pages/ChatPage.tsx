import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IoDocumentTextOutline, IoMenuOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { ActionsPanel } from '../components/actions-panel/ActionsPanel';
import { ChatArea } from '../components/chat-area/ChatArea';
import { useConversation, useUpdateSystemPrompt } from '../hooks/conversations';
import { ActivitiesPanel } from '../components/activities-panel/ActivitiesPanel';

// Persist panel collapse state across sessions
const PANEL_STATE_KEY = 'betterdev.panelState';

interface PanelState {
  left?: boolean;
  right?: boolean;
}

function loadPanelState(): PanelState {
  try {
    const raw = localStorage.getItem(PANEL_STATE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);

    // Only accept a plain object with boolean flags — anything else
    // (e.g. "null", a string, a number) is treated as corrupt state
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const { left, right } = parsed as Record<string, unknown>;
      return {
        ...(typeof left === 'boolean' ? { left } : {}),
        ...(typeof right === 'boolean' ? { right } : {}),
      };
    }
  } catch {
    // ignore parse/storage errors and fall back to defaults
  }
  return {};
}

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();

  // Fetch conversation data to get system prompt
  const { data: conversation } = useConversation(conversationId);

  // Mutation for updating system prompt
  const { mutate: updateSystemPrompt, isPending: isSaving } = useUpdateSystemPrompt();

  // Draft system prompt state (for /new route)
  const [draftSystemPrompt, setDraftSystemPrompt] = useState('');

  // Mobile drawer state for the floating panels
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);

  // Desktop collapse state for the static panels (toggle lives in the panel header)
  const [panelState, setPanelState] = useState<PanelState>(loadPanelState);
  const isLeftCollapsed = panelState.left ?? false;
  const isRightCollapsed = panelState.right ?? false;

  // Functional updates so rapid toggles never read a stale captured state
  const toggleLeftPanel = () => setPanelState((s) => ({ ...s, left: !(s.left ?? false) }));
  const toggleRightPanel = () => setPanelState((s) => ({ ...s, right: !(s.right ?? false) }));

  useEffect(() => {
    try {
      localStorage.setItem(PANEL_STATE_KEY, JSON.stringify(panelState));
    } catch {
      // ignore storage errors (private mode etc.)
    }
  }, [panelState]);

  // Close drawers when navigating between conversations
  useEffect(() => {
    setIsActionsOpen(false);
    setIsActivitiesOpen(false);
  }, [conversationId]);

  // Close drawers on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsActionsOpen(false);
        setIsActivitiesOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSaveSystemPrompt = (systemPrompt: string) => {
    if (!conversationId) {
      // At /new - just update local draft state
      setDraftSystemPrompt(systemPrompt);
      return;
    }

    updateSystemPrompt(
      { id: conversationId, systemPrompt }
    );
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
        className="fixed left-4 top-4 z-20 lg:hidden w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground/80 hover:bg-surface-hover transition-smooth"
        title="Open menu"
      >
        <IoMenuOutline className="w-5 h-5" />
      </button>

      {/* Mobile toggle - Right panel */}
      <button
        onClick={() => setIsActivitiesOpen(true)}
        className="fixed right-4 top-4 z-20 xl:hidden w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground/80 hover:bg-surface-hover transition-smooth"
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

      {/* Left Sidebar - Floating overlay (drawer below lg, collapsible on desktop) */}
      <ActionsPanel
        currentConversationId={conversationId}
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        isCollapsed={isLeftCollapsed}
        onToggleCollapse={toggleLeftPanel}
      />

      {/* Reopen pills — shown on desktop while a panel is collapsed */}
      {isLeftCollapsed && (
        <button
          onClick={toggleLeftPanel}
          className="hidden lg:flex fixed left-4 top-4 z-20 w-10 h-10 rounded-xl bg-surface border border-border items-center justify-center text-foreground/80 hover:bg-surface-hover transition-smooth animate-fade-in"
          title="Show menu"
        >
          <IoChevronForwardOutline className="w-5 h-5" />
        </button>
      )}
      {isRightCollapsed && (
        <button
          onClick={toggleRightPanel}
          className="hidden xl:flex fixed right-4 top-4 z-20 w-10 h-10 rounded-xl bg-surface border border-border items-center justify-center text-foreground/80 hover:bg-surface-hover transition-smooth animate-fade-in"
          title="Show instructions"
        >
          <IoChevronForwardOutline className="w-5 h-5 rotate-180" />
        </button>
      )}

      {/* Right Sidebar - Floating overlay (drawer below xl, collapsible on desktop) */}
      <ActivitiesPanel
        systemPrompt={conversation?.systemPrompt || ""}
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