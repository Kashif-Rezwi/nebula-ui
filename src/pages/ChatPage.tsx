import { useParams } from 'react-router-dom';
import { ActionsPanel } from '../components/actions-panel/ActionsPanel';
import { ChatArea } from '../components/ChatArea';
import { useConversation, useUpdateSystemPrompt } from '../hooks/useConversations';
import { ActivitiesPanel } from '../components/activities-panel/ActivitiesPanel';

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  
  // Fetch conversation data to get system prompt
  const { data: conversation } = useConversation(conversationId);
  console.log("conversation", {conversation})
  
  // Mutation for updating system prompt
  const { mutate: updateSystemPrompt, isPending: isSaving } = useUpdateSystemPrompt();

  const handleSaveSystemPrompt = (systemPrompt: string) => {
    if (!conversationId) return;
    
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
      />
      
      {/* Left Sidebar - Floating overlay */}
      <ActionsPanel currentConversationId={conversationId} />
      
      {/* Right Sidebar - Floating overlay */}
      <ActivitiesPanel
        systemPrompt={conversation?.systemPrompt || ""}
        conversationId={conversationId}
        onSaveSystemPrompt={handleSaveSystemPrompt}
        isSavingSystemPrompt={isSaving}
      />
    </div>
  );
}