import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { User } from '../../types';
import { format } from '../../utils';
import { IoChevronDownCircleOutline, IoLogOutOutline, IoMailOutline } from 'react-icons/io5';

interface UserProfileProps {
  user?: User | null;
  handleLogout: () => void;
}

export function UserProfile({ user, handleLogout }: UserProfileProps) {
  const email = user?.email || '';
  const initial = email ? format.getInitialFromEmail(email) : 'U';
  const username = email ? format.getUsernameFromEmail(email) : 'User';
  const credits = user?.credits != null ? `${user.credits.toLocaleString()} credits` : '0 credits';

  return (
    <div className="absolute bottom-0 left-0 right-0 p-2">
      {/* Bottom fade overlay */}
      <div className="h-4 bg-gradient-to-t from-surface via-surface/90 to-transparent pointer-events-none z-10" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild className="border border-border transition-smooth group outline-none focus:outline-none focus:ring-0">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover transition-smooth group">
            {/* Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground font-medium text-xs">
                {initial}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {username}
              </div>
              <div className="text-xs text-foreground/50">
                {credits}
              </div>
            </div>
            <IoChevronDownCircleOutline className="w-5 h-5 text-foreground/80" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[238px] bg-surface border border-border rounded-lg"
          align="start"
          side="top"
          sideOffset={8}
        >
          <DropdownMenuLabel className="px-2 py-1.5 text-xs text-foreground/60 font-medium">
            My Account
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-border" />

          <DropdownMenuItem className="flex items-center justify-start gap-3 px-2 py-2 text-sm rounded-md hover:bg-surface-hover cursor-pointer focus:bg-surface-hover outline-none">
            <IoMailOutline className="w-5 h-5 text-foreground/80 flex-shrink-0" />
            <div className="text-sm truncate">{email || 'Not logged in'}</div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center justify-start gap-3 px-2 py-2 text-sm rounded-md hover:bg-red-500/10 text-red-500 cursor-pointer focus:bg-red-500/10 outline-none"
          >
            <IoLogOutOutline className="w-5 h-5 text-red-500 flex-shrink-0" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}