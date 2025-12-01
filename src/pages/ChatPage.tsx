import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ActionsPanel } from '../components/actions-panel/ActionsPanel';
import { ChatArea } from '../components/chat-area/ChatArea';
import { useConversation, useUpdateSystemPrompt } from '../hooks/conversations';
import { ActivitiesPanel } from '../components/activities-panel/ActivitiesPanel';

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();

  // Fetch conversation data to get system prompt
  const { data: conversation } = useConversation(conversationId);
  console.log("conversation", { conversation })

  // Mutation for updating system prompt
  const { mutate: updateSystemPrompt, isPending: isSaving } = useUpdateSystemPrompt();

  // Draft system prompt state (for /new route)
  const [draftSystemPrompt, setDraftSystemPrompt] = useState('');

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
        draftSystemPrompt={draftSystemPrompt}
        onDraftSystemPromptChange={setDraftSystemPrompt}
      />

      {/* Left Sidebar - Floating overlay */}
      <ActionsPanel currentConversationId={conversationId} />

      {/* Right Sidebar - Floating overlay */}
      <ActivitiesPanel
        systemPrompt={conversation?.systemPrompt || ""}
        draftSystemPrompt={draftSystemPrompt}
        conversationId={conversationId}
        onSaveSystemPrompt={handleSaveSystemPrompt}
        isSavingSystemPrompt={isSaving}
      />
    </div>
  );
}