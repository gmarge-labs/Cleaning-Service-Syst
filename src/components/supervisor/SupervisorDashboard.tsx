import { useState } from 'react';
import { Sidebar } from '../admin/Sidebar';
import { TopBar } from '../admin/TopBar';
import { SupervisorDashboard as SupervisorDashboardView } from '../admin/dashboards/SupervisorDashboard';
import { BookingsPage } from '../admin/pages/BookingsPage';
import { CleanersPage } from '../admin/pages/CleanersPage';
import { MessagingPage } from '../admin/pages/MessagingPage';

export type Page = 'dashboard' | 'bookings' | 'cleaners' | 'messaging';

interface SupervisorDashboardProps {
  onLogout: () => void;
}

export function SupervisorDashboard({ onLogout }: SupervisorDashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <SupervisorDashboardView />;
      case 'bookings':
        return <BookingsPage />;
      case 'cleaners':
        return <CleanersPage />;
      case 'messaging':
        return <MessagingPage />;
      default:
        return <SupervisorDashboardView />;
    }
  };

  // Limited menu items for supervisor role
  const supervisorMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'bookings', label: 'Bookings', icon: 'Calendar' },
    { id: 'cleaners', label: 'Cleaners', icon: 'Users' },
    { id: 'messaging', label: 'Messaging', icon: 'MessageSquare' }
  ];

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar
        currentRole="supervisor"
        currentPage={currentPage}
        onPageChange={(page: string) => setCurrentPage(page as Page)}
        onRoleChange={() => {}} // Supervisor cannot change roles
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        limitedMenuItems={supervisorMenuItems}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          currentRole="supervisor"
          onLogout={onLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
