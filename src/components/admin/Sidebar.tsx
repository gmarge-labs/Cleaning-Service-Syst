import { Sparkles, LayoutDashboard, Calendar, Users, MessageSquare, BarChart3, Package, Settings, ChevronLeft, ChevronRight, Shield, Star } from 'lucide-react';
import { UserRole, Page } from './AdminDashboard';
import { Badge } from '../ui/badge';

interface SidebarProps {
  currentPage: Page;
  currentRole: UserRole;
  onPageChange: (page: Page) => void;
  onRoleChange: (role: UserRole) => void;
  isOpen: boolean;
  onToggle: () => void;
  limitedMenuItems?: { id: string; label: string; icon: string }[];
}

const roleLabels: Record<UserRole, string> = {
  management: 'Management',
  supervisor: 'Supervisor',
  support: 'Support',
};

const menuItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings' as Page, label: 'Bookings', icon: Calendar, badge: 12 },
  { id: 'cleaners' as Page, label: 'Cleaners', icon: Users },
  { id: 'customers' as Page, label: 'Customers', icon: Users },
  { id: 'reviews' as Page, label: 'Reviews', icon: Star, badge: 8 },
  { id: 'users' as Page, label: 'User Management', icon: Shield, adminOnly: true },
  { id: 'messaging' as Page, label: 'Messaging', icon: MessageSquare, badge: 3 },
  { id: 'analytics' as Page, label: 'Analytics', icon: BarChart3 },
  { id: 'inventory' as Page, label: 'Inventory', icon: Package },
  { id: 'settings' as Page, label: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, currentRole, onPageChange, onRoleChange, isOpen, onToggle, limitedMenuItems }: SidebarProps) {
  // Filter menu items based on role and limitedMenuItems prop
  const visibleMenuItems = limitedMenuItems 
    ? menuItems.filter(item => limitedMenuItems.some(limited => limited.id === item.id))
    : menuItems.filter(item => !item.adminOnly || currentRole === 'management');
    
  return (
    <aside
      className={`bg-neutral-900 text-white flex flex-col transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">SparkleVille</div>
                <div className="text-xs text-neutral-400">Admin Portal</div>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors ml-auto"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">JD</span>
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">John Doe</div>
              <div className="text-xs text-neutral-400">{roleLabels[currentRole]}</div>
            </div>
          )}
        </div>

        {/* Role Switcher (Demo Only) */}
        {isOpen && (
          <div className="mt-3 space-y-1">
            <div className="text-xs text-neutral-500 mb-2">Switch Role (Demo)</div>
            <div className="flex flex-wrap gap-1">
              {(['management', 'supervisor', 'support'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    currentRole === role
                      ? 'bg-secondary-500 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {roleLabels[role]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-red-600 text-white border-0 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-800">
        {isOpen && (
          <div className="text-xs text-neutral-500">
            © 2025 SparkleVille
            <br />
            v2.0.1
          </div>
        )}
      </div>
    </aside>
  );
}