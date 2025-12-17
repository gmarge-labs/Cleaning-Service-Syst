import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ManagementDashboard } from './dashboards/ManagementDashboard';
import { SupervisorDashboard } from './dashboards/SupervisorDashboard';
import { SupportDashboard } from './dashboards/SupportDashboard';
import { BookingsPage } from './pages/BookingsPage';
import { CleanersPage } from './pages/CleanersPage';
import { CustomersPage } from './pages/CustomersPage';
import { MessagingPage } from './pages/MessagingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InventoryPage } from './pages/InventoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ReviewsPage } from './pages/ReviewsPage';

export type UserRole = 'management' | 'supervisor' | 'support';
export type Page = 'dashboard' | 'bookings' | 'cleaners' | 'customers' | 'messaging' | 'analytics' | 'inventory' | 'settings' | 'users' | 'reviews';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>('management');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderDashboard = () => {
    switch (currentRole) {
      case 'management':
        return <ManagementDashboard onNavigate={setCurrentPage} />;
      case 'supervisor':
        return <SupervisorDashboard />;
      case 'support':
        return <SupportDashboard />;
      default:
        return <ManagementDashboard onNavigate={setCurrentPage} />;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'bookings':
        return <BookingsPage />;
      case 'cleaners':
        return <CleanersPage />;
      case 'customers':
        return <CustomersPage />;
      case 'reviews':
        return <ReviewsPage />;
      case 'messaging':
        return <MessagingPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'users':
        return <UserManagementPage />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        currentRole={currentRole}
        onPageChange={setCurrentPage}
        onRoleChange={setCurrentRole}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          currentRole={currentRole}
          onLogout={onLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}