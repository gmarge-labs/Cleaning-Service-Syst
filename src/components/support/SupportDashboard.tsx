import { useState } from 'react';
import { Sidebar } from '../admin/Sidebar';
import { TopBar } from '../admin/TopBar';
import { SupportDashboard as SupportDashboardView } from '../admin/dashboards/SupportDashboard';
import { BookingsPage } from '../admin/pages/BookingsPage';
import { CustomersPage } from '../admin/pages/CustomersPage';
import { MessagingPage } from '../admin/pages/MessagingPage';

export type Page = 'dashboard' | 'bookings' | 'customers' | 'messaging';

interface SupportDashboardProps {
  onLogout: () => void;
}

export function SupportDashboard({ onLogout }: SupportDashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <SupportDashboardView />;
      case 'bookings':
        return <BookingsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'messaging':
        return <MessagingPage />;
      default:
        return <SupportDashboardView />;
    }
  };

  // Limited menu items for support role
  const supportMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'bookings', label: 'Bookings', icon: 'Calendar' },
    { id: 'customers', label: 'Customers', icon: 'Users' },
    { id: 'messaging', label: 'Messaging', icon: 'MessageSquare' }
  ];

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar
        currentRole="support"
        currentPage={currentPage}
        onPageChange={(page: string) => setCurrentPage(page as Page)}
        onRoleChange={() => {}} // Support cannot change roles
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        limitedMenuItems={supportMenuItems}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          currentRole="support"
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
