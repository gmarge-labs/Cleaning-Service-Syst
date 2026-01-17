import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { CleanerLogin } from './src/components/cleaner/CleanerLogin';
import { CleanerDashboard } from './src/components/cleaner/CleanerDashboard';
import { JobDetails } from './src/components/cleaner/JobDetails';
import { JobCompletion } from './src/components/cleaner/JobCompletion';
import { CleanerEarnings } from './src/components/cleaner/CleanerEarnings';
import { CleanerNotifications, Notification } from './src/components/cleaner/CleanerNotifications';
import { CleanerProfile } from './src/components/cleaner/CleanerProfile';
import { CleanerMessages } from './src/components/cleaner/CleanerMessages';
import { authService, User as UserType } from './src/api/auth.service';
import { jobService, Booking as BookingType } from './src/api/job.service';
import { messageService } from './src/api/message.service';
import { socketService } from './src/api/socket.service';
import { pushNotificationService } from './src/api/push-notification.service';
import { notificationService } from './src/api/notification.service';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CleanerView = 'login' | 'dashboard' | 'job-details' | 'job-completion' | 'messages' | 'profile' | 'earnings' | 'notifications';

export default function App() {
    const [currentView, setCurrentView] = useState<CleanerView>('login');
    const [activeTab, setActiveTab] = useState('available');
    const [user, setUser] = useState<UserType | null>(null);
    const [claimedJobs, setClaimedJobs] = useState<string[]>([]);
    const [selectedJob, setSelectedJob] = useState<BookingType | null>(null);
    const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
    const [unreadMessages, setUnreadMessages] = useState<number>(0);
    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const notificationListener = React.useRef<Notifications.Subscription>();
    const responseListener = React.useRef<Notifications.Subscription>();

    const fetchUnreadMessagesCount = async () => {
        try {
            const conversations = await messageService.getConversations();
            const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);
            setUnreadMessages(totalUnread);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
        }
    };

    React.useEffect(() => {
        const checkUser = async () => {
            const savedUser = await authService.getCurrentUser();
            if (savedUser) {
                setUser(savedUser);
                socketService.connect(savedUser.id, savedUser.role);
                const notifCount = await notificationService.getUnreadCount(savedUser.id);
                setUnreadNotifications(notifCount);
                await fetchUnreadMessagesCount();
                setCurrentView('dashboard');
            }
        };
        checkUser();

        // Register for push notifications
        pushNotificationService.registerForPushNotificationsAsync().then(token => setExpoPushToken(token ?? ''));

        // Listeners
        notificationListener.current = pushNotificationService.addNotificationReceivedListener(notification => {
            setExpoPushToken(token => token); // Just to force re-render if needed or log
            console.log('Notification Received:', notification);
        });

        responseListener.current = pushNotificationService.addNotificationResponseReceivedListener(response => {
            console.log('Notification Response:', response);
            // Handle navigation based on notification here if needed
            const data = response.notification.request.content.data;
            if (data?.bookingId) {
                // Logic to navigate to job details could go here
                // For now just logging
            }
            setCurrentView('notifications');
        });

        // Socket listeners for both notifications and messages
        const socket = socketService.getSocket();
        if (socket) {
            socket.on('new_notification', () => {
                setUnreadNotifications(prev => prev + 1);
            });
            socket.on('receive_message', () => {
                fetchUnreadMessagesCount();
            });
        }

        return () => {
            socketService.disconnect();
            if (notificationListener.current) pushNotificationService.removeNotificationSubscription(notificationListener.current);
            if (responseListener.current) pushNotificationService.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    // Sync push token with backend when user is available and token is ready
    React.useEffect(() => {
        if (user && expoPushToken) {
            authService.updatePushToken(user.id, expoPushToken);
        }
    }, [user, expoPushToken]);

    const handleLogin = async (loggedInUser: UserType) => {
        setUser(loggedInUser);
        socketService.connect(loggedInUser.id, loggedInUser.role);
        const notifCount = await notificationService.getUnreadCount(loggedInUser.id);
        setUnreadNotifications(notifCount);
        await fetchUnreadMessagesCount();
        setCurrentView('dashboard');
    };

    const handleLogout = async () => {
        socketService.disconnect();
        await authService.logout();
        setUser(null);
        setCurrentView('login');
    };

    const handleSelectJob = (booking: BookingType) => {
        setSelectedJob(booking);
        setCurrentView('job-details');
    };

    const handleStartJob = (booking: BookingType) => {
        setSelectedJob(booking);
        setCurrentView('job-details');
    };

    const handleClaimJob = async (jobId: string) => {
        if (!user) return;
        try {
            await jobService.claimJob(jobId, user.id);
            setClaimedJobs([...claimedJobs, jobId]);
            // Refresh unread count if needed or just notifications
            setCurrentView('dashboard');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const unreadCount = unreadNotifications;

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} hidden={false} />

                {currentView === 'login' && (
                    <CleanerLogin onLogin={handleLogin} />
                )}

                {currentView === 'dashboard' && (
                    <CleanerDashboard
                        user={user}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onSelectJob={handleSelectJob}
                        onStartJob={handleStartJob}
                        onClaimJob={handleClaimJob}
                        onLogout={handleLogout}
                        onNavigateToMessages={() => setCurrentView('messages')}
                        onNavigateToProfile={() => setCurrentView('profile')}
                        onNavigateToEarnings={() => setCurrentView('earnings')}
                        onNavigateToNotifications={() => setCurrentView('notifications')}
                        unreadCount={unreadNotifications}
                        unreadMessages={unreadMessages}
                    />
                )}

                {currentView === 'job-details' && selectedJob && (
                    <JobDetails
                        job={selectedJob}
                        user={user}
                        onBack={() => setCurrentView('dashboard')}
                        onCompleteJob={() => setCurrentView('job-completion')}
                        onClaimJob={handleClaimJob}
                    />
                )}

                {currentView === 'job-completion' && selectedJob && (
                    <JobCompletion
                        job={selectedJob}
                        onBack={() => setCurrentView('job-details')}
                        onSubmit={() => {
                            setCurrentView('dashboard');
                        }}
                    />
                )}

                {currentView === 'earnings' && (
                    <CleanerEarnings
                        currentView={currentView}
                        onNavigate={(view) => setCurrentView(view)}
                        user={user}
                        unreadCount={unreadNotifications}
                    />
                )}

                {currentView === 'notifications' && (
                    <CleanerNotifications
                        currentView={currentView}
                        onNavigate={(view) => {
                            if (view === 'dashboard') {
                                // Refresh unread count when returning to dashboard
                                if (user) notificationService.getUnreadCount(user.id).then(setUnreadNotifications);
                            }
                            setCurrentView(view);
                        }}
                        userId={user?.id}
                        unreadCount={unreadNotifications}
                    />
                )}

                {currentView === 'profile' && (
                    <CleanerProfile
                        currentView={currentView}
                        onNavigate={(view) => setCurrentView(view)}
                        user={user}
                        onUpdateUser={(u) => setUser(u)}
                        unreadCount={unreadNotifications}
                    />
                )}

                {currentView === 'messages' && (
                    <CleanerMessages
                        currentView={currentView}
                        onNavigate={(view) => setCurrentView(view)}
                        unreadCount={unreadMessages}
                    />
                )}
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
