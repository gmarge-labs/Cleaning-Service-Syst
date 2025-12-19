import { Search, Bell, User, LogOut, Menu, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useState, useEffect } from 'react';
import { UserRole } from './AdminDashboard';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface User {
  id: string;
  name: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface TopBarProps {
  currentRole: UserRole;
  onLogout: () => void;
  onToggleSidebar: () => void;
  user?: User | null;
  onProfileUpdate?: () => void;
}

export function TopBar({ currentRole, onLogout, onToggleSidebar, user, onProfileUpdate }: TopBarProps) {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (authUser?.id) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [authUser?.id]);

  const fetchNotifications = async () => {
    if (!authUser?.id) return;
    
    try {
      setIsLoadingNotifications(true);
      const response = await fetch(
        `http://localhost:4000/api/notifications/${authUser.id}?limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        setUnreadCount(data.data?.filter((n: Notification) => !n.isRead).length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`http://localhost:4000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      setNotifications(
        notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Generate initials from user name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-neutral-600" />
          </button>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Search bookings, cleaners, customers..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Actions Dropdown */}
          <Button variant="outline" size="sm">
            Quick Actions
          </Button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                if (!notificationsOpen) {
                  fetchNotifications();
                }
              }}
              className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-neutral-600" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-600 text-white border-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setNotificationsOpen(false)}
                />
                
                {/* Dropdown Panel */}
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-neutral-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <Badge className="bg-red-100 text-red-700 border-0">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto flex-1">
                    {isLoadingNotifications ? (
                      <div className="p-4 text-center text-neutral-500">
                        Loading notifications...
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors ${
                            !notification.isRead ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              !notification.isRead ? 'bg-blue-600' : 'bg-neutral-300'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`text-sm ${!notification.isRead ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'}`}>
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-neutral-500 whitespace-nowrap">
                                  {formatTime(notification.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-600 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-neutral-500">
                        No notifications yet
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-neutral-200 bg-neutral-50">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50"
                    >
                      View All Notifications
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-3 border-l border-neutral-200 relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-neutral-900">{user?.name || authUser?.name || 'User'}</div>
                <div className="text-xs text-neutral-500 capitalize">{currentRole}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-semibold">{user?.name ? getInitials(user.name) : authUser?.name ? getInitials(authUser.name) : 'U'}</span>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setUserMenuOpen(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      onProfileUpdate?.();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 transition-colors border-b border-neutral-100"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Update Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onLogout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
