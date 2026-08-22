import type { ReactNode } from 'react';
import type { Message } from './chat';

export interface Conversation {
  id: string;
  title: string;
  systemPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface CreateConversationParams {
  title?: string;
  firstMessage: string;
  systemPrompt?: string;
}

export interface CreateConversationResponse {
  id: string;
  title: string;
  systemPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatAreaProps {
  conversationId?: string;
  title?: string;
  draftSystemPrompt?: string;
  onDraftSystemPromptChange?: (prompt: string) => void;
  isLeftPanelCollapsed?: boolean;
  isRightPanelCollapsed?: boolean;
}

export interface ActionsPanelProps {
  currentConversationId?: string;
  onConversationCreated?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface ActivitiesPanelProps {
  conversationId?: string;
  systemPrompt: string;
  draftSystemPrompt?: string;
  onSaveSystemPrompt: (systemPrompt: string) => void;
  isSavingSystemPrompt: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface SystemPromptCardProps {
  systemPrompt: string;
  onSaveSystemPrompt: (systemPrompt: string) => void;
  isSavingSystemPrompt: boolean;
  isDraft?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}

export interface SystemPromptModalProps {
  initialInstructions: string;
  onSave: (systemPrompt: string) => void;
  isSaving?: boolean;
  isDraft?: boolean;
}

export interface ProtectedRouteProps {
  children: ReactNode;
}
