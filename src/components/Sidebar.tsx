import { useAuth } from '../hooks/useAuth';
import { useConversations } from '../hooks/useConversations';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { format } from '../utils';
import { SidebarSkeleton } from './Skeleton';
import type { SidebarProps } from '../types';

export function Sidebar({ currentConversationId }: SidebarProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { getUser, logout } = useAuth();
  const { 
    conversations, 
    loading, 
    creating, 
    createConversation, 
    deleteConversation 
  } = useConversations();
  
  const user = getUser();

  const handleNewChat = async () => {
    await createConversation();
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversation(conversationId, currentConversationId);
  };

  return (
    <aside className="w-64 bg-[#1a1a1a] border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <div className="w-8 h-8 flex items-center justify-center">
          <img 
            src="/src/assets/nebula-logo.png" 
            alt="Nebula Logo" 
            className="w-8 h-8 object-contain"
          />
        </div>
        <h1 className="text-xl font-semibold">Nebula</h1>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button 
          onClick={handleNewChat}
          disabled={creating}
          className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-lg hover:bg-[#262626] transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 hover-lift btn-press">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-primary font-medium">
            {creating ? 'Creating...' : 'New chat'}
          </span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 mt-4">
        <div className="text-xs font-medium text-foreground/50 mb-2 px-3">
          Recents
        </div>

        {loading ? (
          <SidebarSkeleton />
        ) : conversations.length === 0 ? (
          <div className="px-3 py-2 text-sm text-foreground/50">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv, index) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-smooth animate-fade-in ${
                  currentConversationId === conv.id
                    ? 'bg-[#262626] text-foreground'
                    : 'hover:bg-[#262626] text-foreground/80'
                }`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div
                  className="flex-1 truncate"
                  onClick={() => navigate(`/chat/${conv.id}`)}
                >
                  {conv.title || 'Untitled'}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#333333] rounded transition-smooth"
                  title="Delete conversation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-border relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#262626] transition-smooth overflow-hidden"
        >
          <div className="w-8 h-8 rounded-full bg-[#666666] flex items-center justify-center text-sm font-medium flex-shrink-0">
            {user?.email ? format.getInitialFromEmail(user.email) : 'U'}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium truncate">
              {user?.email ? format.getUsernameFromEmail(user.email) : 'User'}
            </div>
            <div className="text-xs text-foreground/50">
              {user?.credits ? `${user.credits.toLocaleString()} credits` : '0 credits'}
            </div>
          </div>
          <svg className="w-4 h-4 text-foreground/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Logout Menu */}
        {showMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#262626] border border-border rounded-lg overflow-hidden animate-scale-in">
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-left text-sm hover:bg-[#333333] transition-smooth"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}