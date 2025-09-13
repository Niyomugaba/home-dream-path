import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="clay-card mb-6 p-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
            <img src={logo} alt="HomePath Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">HomePath</h1>
            <p className="text-sm text-muted-foreground">Your Journey to Homeownership</p>
          </div>
        </Link>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground hidden md:block">
            Welcome, {user?.user_metadata?.name || user?.email}
          </span>
          <Link to="/settings">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={signOut}
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;