import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "../ui/dropdown-menu";
  import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
  import type { User } from "../../types";
  import { format } from "../../utils";
  import { IoChevronDownCircleOutline, IoLogOutOutline, IoMailOutline } from "react-icons/io5";
  
  interface UserProfileProps {
    user: User;
    handleLogout: () => void;
  }
  
  export function UserProfile({ user, handleLogout }: UserProfileProps) {
    return (
      <div className="absolute bottom-0 left-0 right-0 p-2">
         
        {/* Bottom fade overlay - match sidebar bg color */}
        <div className="h-8 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/90 to-transparent pointer-events-none z-10" />
           
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="border border-border transition-smooth group outline-none focus:outline-none focus:ring-0">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] transition-smooth group">
              {/* Avatar */}
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" className="rounded-2xl" />
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {user?.email ? format.getInitialFromEmail(user.email) : "D"}
                </AvatarFallback>
              </Avatar>
  
              {/* User Info */}
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {user?.email ? format.getUsernameFromEmail(user.email) : "User"}
                </div>
                <div className="text-xs text-foreground/50">
                  {user?.credits ? `${user.credits.toLocaleString()} credits` : "0 credits"}
                </div>
              </div>
              <IoChevronDownCircleOutline className="w-6 h-6 text-foreground/80" />
            </button>
          </DropdownMenuTrigger>
  
          <DropdownMenuContent 
            className="w-[238px] bg-[#1a1a1a] border border-border rounded-lg" 
            align="start"
            side="top"
            sideOffset={8}
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-xs text-foreground/60 font-medium">
              My Account
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-border" />
            
            <DropdownMenuItem className="flex items-center justify-left gap-3 px-2 py-2 text-sm rounded-md hover:bg-[#262626] cursor-pointer focus:bg-[#262626] outline-none">
               <IoMailOutline className="w-5 h-5 text-foreground/80" />
               <div className="text-sm truncate">
                {user?.email}
               </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={handleLogout}
              className="flex items-center justify-left gap-3 px-2 py-2 text-sm rounded-md hover:bg-red-500/10 text-red-500 cursor-pointer focus:bg-red-500/10 outline-none"
            >
              <IoLogOutOutline className="w-5 h-5 text-foreground/80 text-red-500" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }