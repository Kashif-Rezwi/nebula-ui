import { useAuth, useLogout } from '../../hooks/useAuth';
import { useConversationsManager } from '../../hooks/useConversations';
import { useNavigate } from 'react-router-dom';
import type { ActionsPanelProps, User } from '../../types';
import { Header } from './Header';
import { Features } from './Features';
import { UserProfile } from './UserProfile';
import { Recents } from './Recents';
import { Separator } from '../ui/separator';

export function ActionsPanel({ currentConversationId }: ActionsPanelProps) {
    const navigate = useNavigate();
    
    // Auth hooks
    const { user } = useAuth();
    const { mutate: logout } = useLogout();
    
    // Conversations hooks
    const { 
      conversations, 
      loading, 
      creating, 
      createConversation, 
      deleteConversation 
    } = useConversationsManager();
  
    const handleNewChat = () => {
      createConversation();
    };
  
    const handleDeleteConversation = (conversationId: string) => {
      deleteConversation(conversationId);
    };
  
    const handleLogout = () => {
      logout();
    };
  
    const handleConversationClick = (conversationId: string) => {
      navigate(`/chat/${conversationId}`);
    };
  
    return (
      <aside className="fixed left-4 top-4 bottom-4 w-64 bg-[#1a1a1a] rounded-2xl flex flex-col z-10 border border-border overflow-hidden">
        <Header />

        <div className='px-4'>
          <Separator />
        </div>
  
        <Features
          creating={creating}
          handleNewChat={handleNewChat}
        />
  
        <Recents 
          loading={loading} 
          conversations={conversations} 
          currentConversationId={currentConversationId as string} 
          handleConversationClick={handleConversationClick} 
          handleDeleteConversation={handleDeleteConversation} 
        />
  
        <UserProfile
          user={user as User}
          handleLogout={handleLogout}
        />
      </aside>
    );
  };