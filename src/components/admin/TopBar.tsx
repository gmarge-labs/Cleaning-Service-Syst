import { Search, Bell, User, LogOut, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { UserRole } from './AdminDashboard';
import { Badge } from '../ui/badge';
import { useState } from 'react';

interface TopBarProps {
  currentRole: UserRole;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: 'cleaner_application',
    title: 'New Cleaner Application',
    message: 'Sarah Martinez submitted an application',
    time: '5 min ago',
    unread: true,
  },
  {
    id: 2,
    type: 'cleaner_application',
    title: 'New Cleaner Application',
    message: 'David Johnson submitted an application',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 3,
    type: 'booking',
    title: 'New Booking',
    message: 'Emma Wilson booked a Deep Cleaning service',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 4,
    type: 'review',
    title: 'New Review',
    message: 'Michael Chen left a 5-star review',
    time: '3 hours ago',
    unread: false,
  },
  {
    id: 5,
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of $189.00 received',
    time: '5 hours ago',
    unread: false,
  },
];

export function TopBar({ currentRole, onLogout, onToggleSidebar }: TopBarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = mockNotifications.filter(n => n.unread).length;

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
              onClick={() => setNotificationsOpen(!notificationsOpen)}
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
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.unread ? 'bg-blue-600' : 'bg-neutral-300'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-sm ${notification.unread ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'}`}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-neutral-500 whitespace-nowrap">
                                {notification.time}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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
          <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-neutral-900">John Doe</div>
              <div className="text-xs text-neutral-500 capitalize">{currentRole}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-semibold">JD</span>
            </div>
          </div>

          {/* Logout */}
          <Button
            onClick={onLogout}
            variant="outline"
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}