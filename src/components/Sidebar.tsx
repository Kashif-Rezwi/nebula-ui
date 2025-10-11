interface SidebarProps {
    onNewChat: () => void;
  }
  
  export function Sidebar({ onNewChat }: SidebarProps) {
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
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#262626] cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium">
              U
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">User</div>
              <div className="text-xs text-foreground/50">Free Plan</div>
            </div>
          </div>
        </div>
      </aside>
    );
  }