import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ChatArea } from '../components/ChatArea';
import { InstructionsPanel } from '../components/InstructionsPanel';
import { SystemPromptModal } from '../components/SystemPromptModal';
import { useConversation, useUpdateSystemPrompt } from '../hooks/useConversations';

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch conversation data to get system prompt
  const { data: conversation } = useConversation(conversationId);
  
  // Mutation for updating system prompt
  const { mutate: updateSystemPrompt, isPending: isSaving } = useUpdateSystemPrompt();

  const handleSaveSystemPrompt = (systemPrompt: string) => {
    if (!conversationId) return;
    
    updateSystemPrompt(
      { id: conversationId, systemPrompt },
      {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      }
    );
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="relative h-screen">
      {/* Main Content - Full width */}
      <ChatArea 
        key={conversationId} 
        conversationId={conversationId} 
      />
      
      {/* Left Sidebar - Floating overlay */}
      <Sidebar currentConversationId={conversationId} />
      
      {/* Right Sidebar - Floating overlay */}
      <InstructionsPanel
        systemPrompt={conversation?.systemPrompt}
        onEdit={handleOpenModal}
        conversationId={conversationId}
      />

      {/* System Prompt Modal */}
      <SystemPromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSystemPrompt}
        initialValue={conversation?.systemPrompt || ''}
        isSaving={isSaving}
      />
    </div>
  );
}