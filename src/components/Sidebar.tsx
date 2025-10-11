import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { conversationsApi, type Conversation } from '../lib/conversations';

interface SidebarProps {
  currentConversationId?: string;
  onConversationCreated?: () => void;
}

export function Sidebar({ currentConversationId, onConversationCreated }: SidebarProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await conversationsApi.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      setCreating(true);
      const newConversation = await conversationsApi.createConversation('New Chat');
      
      // Reload conversations list
      await loadConversations();
      
      // Navigate to the new conversation
      navigate(`/chat/${newConversation.id}`);
      
      onConversationCreated?.();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }
  
    try {
      await conversationsApi.deleteConversation(conversationId);
      
      // Reload conversations list
      await loadConversations();
      
      // If we deleted the current conversation, navigate to /chat
      if (conversationId === currentConversationId) {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#1a1a1a] border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold">Nebula</h1>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button 
          onClick={handleNewChat}
          disabled={creating}
          className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? 'Creating...' : '+ New chat'}
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="text-xs font-semibold text-foreground/50 mb-2 px-3">
          Recents
        </div>

        {loading ? (
          <div className="px-3 py-2 text-sm text-foreground/50">
            Loading...
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-3 py-2 text-sm text-foreground/50">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${currentConversationId === conv.id
                    ? 'bg-[#262626] text-foreground'
                    : 'hover:bg-[#262626] text-foreground/80'
                  }`}
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
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#333333] rounded transition-opacity"
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
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#262626] cursor-pointer transition-colors overflow-hidden"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium overflow-hidden flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium truncate">
              {user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-xs text-foreground/50">
              Credits: {user?.credits || 0}
            </div>
          </div>
        </button>

        {/* Logout Menu */}
        {showMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#262626] border border-border rounded-lg overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm hover:bg-[#333333] transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}