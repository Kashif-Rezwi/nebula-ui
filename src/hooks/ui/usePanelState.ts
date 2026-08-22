import { useState, useEffect, useCallback } from 'react';
import { safeStorage } from '../../utils/storage';

const PANEL_STATE_KEY = 'betterdev.panelState';

interface PanelState {
  left?: boolean;
  right?: boolean;
}

function loadPanelState(): PanelState {
  const raw = safeStorage.getItem(PANEL_STATE_KEY);
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const { left, right } = parsed as Record<string, unknown>;
      return {
        ...(typeof left === 'boolean' ? { left } : {}),
        ...(typeof right === 'boolean' ? { right } : {}),
      };
    }
  } catch {
    // Ignore JSON parse errors
  }
  return {};
}

export function usePanelState(conversationId?: string) {
  // Mobile drawer state
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);

  // Desktop collapse state
  const [panelState, setPanelState] = useState<PanelState>(loadPanelState);
  const isLeftCollapsed = panelState.left ?? false;
  const isRightCollapsed = panelState.right ?? false;

  const toggleLeftPanel = useCallback(() => {
    setPanelState((s) => ({ ...s, left: !(s.left ?? false) }));
  }, []);

  const toggleRightPanel = useCallback(() => {
    setPanelState((s) => ({ ...s, right: !(s.right ?? false) }));
  }, []);

  // Persist collapse state to localStorage
  useEffect(() => {
    safeStorage.setItem(PANEL_STATE_KEY, JSON.stringify(panelState));
  }, [panelState]);

  // Close drawers when navigating between conversations
  useEffect(() => {
    setIsActionsOpen(false);
    setIsActivitiesOpen(false);
  }, [conversationId]);

  // Close drawers on Escape key press
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

  return {
    isActionsOpen,
    setIsActionsOpen,
    isActivitiesOpen,
    setIsActivitiesOpen,
    isLeftCollapsed,
    isRightCollapsed,
    toggleLeftPanel,
    toggleRightPanel,
  };
}
