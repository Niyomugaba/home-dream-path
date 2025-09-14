import { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Bell, TrendingUp, AlertCircle } from 'lucide-react';

interface AlertBannerProps {
  type: 'milestone' | 'goal' | 'warning' | 'success';
  title: string;
  message: string;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

const AlertBanner = ({ 
  type, 
  title, 
  message, 
  onDismiss, 
  actionLabel, 
  onAction 
}: AlertBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getAlertStyles = () => {
    switch (type) {
      case 'milestone':
        return 'gradient-card-violet text-white border-none';
      case 'goal':
        return 'gradient-card-teal text-white border-none';
      case 'warning':
        return 'gradient-card-orange text-white border-none';
      case 'success':
        return 'gradient-card-green text-white border-none';
      default:
        return 'bg-card text-card-foreground';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'milestone':
        return <Bell className="h-5 w-5" />;
      case 'goal':
        return <TrendingUp className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      case 'success':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <Alert className={`${getAlertStyles()} animate-fade-in mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div>
            <h4 className="font-semibold mb-1">{title}</h4>
            <AlertDescription className="text-sm opacity-90">
              {message}
            </AlertDescription>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {actionLabel && onAction && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAction}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              {actionLabel}
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="p-1 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default AlertBanner;