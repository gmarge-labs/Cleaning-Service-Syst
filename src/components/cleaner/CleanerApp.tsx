import { useState } from 'react';
import { CleanerLogin } from './CleanerLogin';
import { CleanerDashboard } from './CleanerDashboard';
import { JobDetails } from './JobDetails';
import { JobCompletion } from './JobCompletion';
import { CleanerMessages } from './CleanerMessages';
import { CleanerProfile } from './CleanerProfile';
import { CleanerEarnings } from './CleanerEarnings';
import { CleanerNotifications, Notification } from './CleanerNotifications';
import { useSocket } from '../../hooks/useSocket';

export type CleanerView = 'login' | 'dashboard' | 'job-details' | 'job-completion' | 'messages' | 'profile' | 'earnings' | 'notifications';

export interface Job {
  id: string;
  customer: string;
  address: string;
  unit?: string;
  serviceType: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  payment: number;
  instructions?: string;
  addOns?: string[];
  supplies?: string[];
  photos?: string[];
  lat?: number;
  lng?: number;
  requiredCleaners?: number;
  isAvailableJob?: boolean;
}

interface CleanerAppProps {
  onBack: () => void;
}

export function CleanerApp({ onBack }: CleanerAppProps) {
  const [currentView, setCurrentView] = useState<CleanerView>('login');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isClockIn, setIsClockIn] = useState(false);
  const [claimedJobs, setClaimedJobs] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { socket } = useSocket();

  useState(() => {
    if (socket) {
      socket.on('new_notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
      });
    }
  });

  const handleLogin = () => {
    setCurrentView('dashboard');
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('job-details');
  };

  const handleStartJob = (job: Job) => {
    setSelectedJob(job);
    setIsClockIn(false); // Changed from true - cleaner needs to arrive first
    setCurrentView('job-details');
  };

  const handleClaimJob = (jobId: string) => {
    setClaimedJobs([...claimedJobs, jobId]);
  };

  const handleCompleteJob = () => {
    if (selectedJob) {
      setCurrentView('job-completion');
    }
  };

  const handleJobSubmitted = () => {
    setSelectedJob(null);
    setIsClockIn(false);
    setCurrentView('dashboard');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Get unread count for badge
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-screen bg-neutral-50 overflow-hidden">
      {/* Mobile-First Container */}
      <div className="max-w-md mx-auto h-full bg-white shadow-xl">
        {currentView === 'login' && (
          <CleanerLogin onLogin={handleLogin} />
        )}

        {currentView === 'dashboard' && (
          <CleanerDashboard
            onSelectJob={handleSelectJob}
            onStartJob={handleStartJob}
            onClaimJob={handleClaimJob}
            claimedJobs={claimedJobs}
            onLogout={onBack}
            onNavigateToMessages={() => setCurrentView('messages')}
            onNavigateToProfile={() => setCurrentView('profile')}
            onNavigateToEarnings={() => setCurrentView('earnings')}
            onNavigateToNotifications={() => setCurrentView('notifications')}
          />
        )}

        {currentView === 'job-details' && selectedJob && (
          <JobDetails
            job={selectedJob}
            isClockIn={isClockIn}
            onBack={handleBackToDashboard}
            onCompleteJob={handleCompleteJob}
            onClaimJob={handleClaimJob}
          />
        )}

        {currentView === 'job-completion' && selectedJob && (
          <JobCompletion
            job={selectedJob}
            onSubmit={handleJobSubmitted}
            onBack={handleBackToDashboard}
          />
        )}

        {currentView === 'messages' && (
          <CleanerMessages
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'profile' && (
          <CleanerProfile
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'earnings' && (
          <CleanerEarnings
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'notifications' && (
          <CleanerNotifications
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDeleteNotification={handleDeleteNotification}
          />
        )}
      </div>
    </div>
  );
}