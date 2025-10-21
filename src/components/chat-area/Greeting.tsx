import betterDevLogo from '../../assets/dev-logo-light.png';
import { useAuth } from '../../hooks/useAuth';
import { format } from '../../utils';

export function Greeting() {
  const { getUser } = useAuth();
  const user = getUser();
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const username = user?.email ? format.getUsernameFromEmail(user.email) : 'there';

  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <img 
            src={betterDevLogo} 
            alt="better DEV" 
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-4xl font-light text-foreground/90">
            {getGreeting()}, {username}
          </h1>
        </div>
      </div>
    </div>
  );
}