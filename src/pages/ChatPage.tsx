import { useParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { ChatArea } from '../components/ChatArea';

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();

  return (
    <div className="flex h-screen">
      <Sidebar currentConversationId={conversationId} />
      <ChatArea key={conversationId} conversationId={conversationId} />
    </div>
  );
}