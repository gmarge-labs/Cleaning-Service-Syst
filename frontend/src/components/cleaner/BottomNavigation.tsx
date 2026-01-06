import { Home, TrendingUp, MessageSquare, User } from 'lucide-react';
import { Badge } from '../ui/badge';
import { CleanerView } from './CleanerApp';

interface BottomNavigationProps {
  currentView: CleanerView;
  onNavigate: (view: CleanerView) => void;
  unreadMessages?: number;
}

export function BottomNavigation({ currentView, onNavigate, unreadMessages = 2 }: BottomNavigationProps) {
  const navItems = [
    {
      id: 'dashboard' as CleanerView,
      icon: Home,
      label: 'Home',
    },
    {
      id: 'earnings' as CleanerView,
      icon: TrendingUp,
      label: 'Earnings',
    },
    {
      id: 'messages' as CleanerView,
      icon: MessageSquare,
      label: 'Messages',
      badge: unreadMessages,
    },
    {
      id: 'profile' as CleanerView,
      icon: User,
      label: 'Profile',
    },
  ];

  return (
    <nav className="bg-white border-t border-neutral-200 px-4 py-3">
      <div className="grid grid-cols-4 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative ${
                isActive
                  ? 'bg-secondary-50 text-secondary-500'
                  : 'hover:bg-neutral-50 text-neutral-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && !isActive && (
                <Badge className="absolute top-1 right-2 w-5 h-5 flex items-center justify-center p-0 bg-red-600 text-white border-0 text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
