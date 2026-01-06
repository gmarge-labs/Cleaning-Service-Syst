import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CleanerView } from './CleanerApp';
import { BottomNavigation } from './BottomNavigation';

export interface Notification {
  id: string;
  type: 'new_booking' | 'job_update' | 'message' | 'payment';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  bookingId?: string;
}

interface CleanerNotificationsProps {
  currentView: CleanerView;
  onNavigate: (view: CleanerView) => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
}

export function CleanerNotifications({ 
  currentView, 
  onNavigate, 
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}: CleanerNotificationsProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_booking':
        return '🔔';
      case 'job_update':
        return '📋';
      case 'message':
        return '💬';
      case 'payment':
        return '💰';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_booking':
        return 'from-secondary-500 to-accent-500';
      case 'job_update':
        return 'from-blue-500 to-blue-600';
      case 'message':
        return 'from-purple-500 to-purple-600';
      case 'payment':
        return 'from-green-500 to-green-600';
      default:
        return 'from-neutral-500 to-neutral-600';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-secondary-500 to-accent-500 text-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-white/80">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={onMarkAllAsRead}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">No Notifications</h2>
            <p className="text-neutral-600">
              You're all caught up! We'll notify you when there's something new.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border transition-all ${
                  notification.read
                    ? 'border-neutral-200'
                    : 'border-secondary-300 shadow-md'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getNotificationColor(notification.type)} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-neutral-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge className="bg-secondary-500 text-white border-0 flex-shrink-0">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="text-xs text-secondary-600 hover:text-secondary-700 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteNotification(notification.id)}
                            className="p-1 hover:bg-neutral-100 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-neutral-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentView={currentView}
        onNavigate={onNavigate}
      />
    </div>
  );
}
