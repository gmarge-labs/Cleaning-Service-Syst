import { useState } from 'react';
import { DashboardOverview } from './DashboardOverview';
import { UpcomingBookings } from './UpcomingBookings';
import { PastBookings } from './PastBookings';
import { ProfileSettings } from './ProfileSettings';
import { ActiveJob } from './ActiveJob';
import { Sparkles, LayoutDashboard, Calendar, History, User, LogOut, Briefcase } from 'lucide-react';
import { Button } from '../ui/button';
import logo from '../../images/logo/Sparkleville1(1).png';

interface CustomerDashboardProps {
  onNavigateHome: () => void;
  onStartBooking: () => void;
  onRescheduleBooking: (booking: any) => void;
  onLogout: () => void;
}

type Tab = 'overview' | 'active' | 'upcoming' | 'past' | 'profile';

export function CustomerDashboard({ onNavigateHome, onStartBooking, onRescheduleBooking, onLogout }: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'active' as Tab, label: 'Active Job', icon: Briefcase },
    { id: 'upcoming' as Tab, label: 'Upcoming', icon: Calendar },
    { id: 'past' as Tab, label: 'History', icon: History },
    { id: 'profile' as Tab, label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={onNavigateHome} className="flex items-center gap-2">
              <img src={logo} alt="Sparkleville Logo" className="h-10 w-auto" />
              <div>
                <div className="font-bold text-xl text-neutral-900">Sparkleville</div>
                <div className="text-xs text-neutral-500">Customer Dashboard</div>
              </div>
            </button>

            <div className="flex items-center gap-4">
              <Button onClick={onStartBooking} className="bg-secondary-500 hover:bg-secondary-600">
                + New Booking
              </Button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${isActive
                      ? 'border-secondary-500 text-secondary-500'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
        {activeTab === 'overview' && <DashboardOverview onStartBooking={onStartBooking} onRescheduleBooking={onRescheduleBooking} />}
        {activeTab === 'active' && <ActiveJob />}
        {activeTab === 'upcoming' && <UpcomingBookings onReschedule={onRescheduleBooking} />}
        {activeTab === 'past' && <PastBookings />}
        {activeTab === 'profile' && <ProfileSettings />}
      </div>
    </div>
  );
}