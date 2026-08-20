import { useAuth, useLogout } from '../../hooks/useAuth';
import { useConversations, useDeleteConversation } from '../../hooks/conversations';
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline } from 'react-icons/io5';
import { cn } from '../../lib/utils';
import type { ActionsPanelProps, Conversation, User } from '../../types';
import { Header } from './Header';
import { Features } from './Features';
import { UserProfile } from './UserProfile';
import { Recents } from './Recents';
import { Separator } from '../ui/separator';
import { ROUTES } from '../../constants';

export function ActionsPanel({ currentConversationId, isOpen = false, onClose, isCollapsed = false, onToggleCollapse }: ActionsPanelProps) {
  const navigate = useNavigate();

  // Auth hooks
  const { user } = useAuth();
  const { mutate: logout } = useLogout();

  // Conversations hooks
  const { mutate: deleteConversation } = useDeleteConversation();
  const { data: conversations = [], isLoading } = useConversations();

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversation(conversationId);
  };

  const handleLogout = () => {
    logout();
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(ROUTES.CHAT_WITH_ID(conversationId));
  };

  return (
    <aside
      className={cn(
        'fixed left-4 top-4 bottom-4 w-64 bg-surface rounded-2xl flex flex-col border border-border overflow-hidden transition-all duration-300 ease-out',
        'z-40 lg:z-10 max-lg:shadow-2xl',
        // Mobile drawer (below lg): hidden unless opened
        isOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-[calc(100%+2rem)]',
        // Desktop collapse: slide out of view (reopen pill appears at the edge)
        isCollapsed && 'lg:-translate-x-[calc(100%+2rem)] lg:opacity-0 lg:pointer-events-none lg:z-0'
      )}
    >
      {/* Mobile close button */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-surface-hover transition-smooth"
        title="Close menu"
      >
        <IoCloseOutline className="w-5 h-5" />
      </button>

      <Header onCollapse={onToggleCollapse} />

      <div className='px-4'>
        <Separator />
      </div>

      <Features />

      <Recents
        loading={isLoading}
        conversations={conversations as Conversation[]}
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