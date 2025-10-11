import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface SidebarProps {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login
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
          onClick={onNewChat}
          className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          + New chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="text-xs font-semibold text-foreground/50 mb-2 px-3">
          Recents
        </div>
        <div className="space-y-1">
          <div className="px-3 py-2 text-sm rounded-lg hover:bg-[#262626] cursor-pointer transition-colors">
            Untitled
          </div>
          <div className="px-3 py-2 text-sm rounded-lg hover:bg-[#262626] cursor-pointer transition-colors">
            React project help
          </div>
          <div className="px-3 py-2 text-sm rounded-lg hover:bg-[#262626] cursor-pointer transition-colors">
            TypeScript questions
          </div>
        </div>
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
          <div className="flex-1 text-left">
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