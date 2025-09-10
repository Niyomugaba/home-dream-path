import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Home, User } from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="clay-card mb-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Home className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Homeownership Tracker</h1>
            <p className="text-sm text-muted-foreground">Your path to the perfect home</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {user?.user_metadata?.name || 'User'}
            </span>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;