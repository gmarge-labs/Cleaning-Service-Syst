import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Calendar, Clock, DollarSign, MapPin, ChevronRight, User, LogOut, Bell, Users, Star } from 'lucide-react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Tabs } from '../Tabs';
import { BottomNavigation, CleanerView } from './BottomNavigation';

import { jobService, Booking } from '../../api/job.service';
import { User as UserType } from '../../api/auth.service';

interface CleanerDashboardProps {
    user: UserType | null;
    onSelectJob: (job: Booking) => void;
    onStartJob: (job: Booking) => void;
    onClaimJob: (jobId: string) => void;
    onLogout: () => void;
    onNavigateToMessages: () => void;
    onNavigateToProfile: () => void;
    onNavigateToEarnings: () => void;
    onNavigateToNotifications: () => void;
    unreadCount?: number;
}

import { LinearGradient } from 'expo-linear-gradient';
import { RefreshControl } from 'react-native';

export function CleanerDashboard({
    user,
    onSelectJob,
    onStartJob,
    onClaimJob,
    onLogout,
    onNavigateToMessages,
    onNavigateToProfile,
    onNavigateToEarnings,
    onNavigateToNotifications,
    unreadCount = 0
}: CleanerDashboardProps) {
    const [activeTab, setActiveTab] = useState('available');
    const [availableJobs, setAvailableJobs] = useState<Booking[]>([]);
    const [myJobs, setMyJobs] = useState<Booking[]>([]);
    const [completedJobs, setCompletedJobs] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const [available, assigned] = await Promise.all([
                jobService.getAvailableJobs(),
                jobService.getAssignedJobs(user.id)
            ]);
            setAvailableJobs(available);
            setMyJobs(assigned);

            // Also fetch history if on completed tab, or just fetch it here
            const history = await jobService.getJobHistory(user.id);
            setCompletedJobs(history);
        } catch (error) {
            console.error('Fetch dashboard data error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [user?.id]);

    React.useEffect(() => {
        fetchData();
    }, [user?.id]);

    const handleClaim = async (jobId: string) => {
        if (!user?.id) return;
        try {
            await jobService.claimJob(jobId, user.id);
            onClaimJob(jobId);
            fetchData(); // Refresh data
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[Colors.secondary, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.profileInfo} onPress={onNavigateToProfile}>
                        <View style={styles.avatar}>
                            <User size={24} color={Colors.white} />
                        </View>
                        <View>
                            <Text style={styles.userName}>{user?.name || 'Cleaner'}</Text>
                            <Text style={styles.userRole}>{user?.role || 'Professional Cleaner'}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconBtn} onPress={onNavigateToNotifications}>
                            <Bell size={20} color={Colors.white} />
                            {unreadCount > 0 && (
                                <View style={styles.notifBadge}>
                                    <Text style={styles.notifCount}>{unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={onLogout}>
                            <LogOut size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <StatCard icon={<Calendar size={16} color={Colors.white} />} label="Today" value={availableJobs.length.toString()} sub="Jobs" />
                    <StatCard icon={<DollarSign size={16} color={Colors.white} />} label="Week" value="$498" sub="Earned" />
                    <StatCard icon={<Star size={16} color={Colors.white} />} label="Rating" value="4.9" sub="Average" />
                </View>
            </LinearGradient>

            <Tabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={[
                    { id: 'available', label: 'Available', count: availableJobs.length },
                    { id: 'upcoming', label: 'My Jobs', count: myJobs.length },
                    { id: 'completed', label: 'Completed' },
                ]}
            />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.secondary]} />
                }
            >
                {activeTab === 'available' && (
                    availableJobs.length > 0 ? (
                        availableJobs.map(job => (
                            <AvailableJobCard key={job.id} job={job} onViewDetails={onSelectJob} onClaim={handleClaim} />
                        ))
                    ) : (
                        <EmptyState icon={<Calendar size={64} color={Colors.lightGray} />} title="No Available Jobs" description="Check back soon for new opportunities!" />
                    )
                )}

                {activeTab === 'upcoming' && (
                    myJobs.length > 0 ? (
                        myJobs.map(job => (
                            <JobCard key={job.id} job={job} onSelect={onSelectJob} onStart={onStartJob} showStartButton />
                        ))
                    ) : (
                        <EmptyState icon={<Calendar size={64} color={Colors.lightGray} />} title="No Jobs Yet" description="Claim a job from the Available tab!" />
                    )
                )}

                {activeTab === 'completed' && (
                    completedJobs.map(job => (
                        <JobCard key={job.id} job={job} onSelect={onSelectJob} onStart={onStartJob} />
                    ))
                )}
            </ScrollView>

            <BottomNavigation
                currentView="dashboard"
                onNavigate={(view) => {
                    if (view === 'messages') onNavigateToMessages();
                    else if (view === 'profile') onNavigateToProfile();
                    else if (view === 'earnings') onNavigateToEarnings();
                    else if (view === 'notifications') onNavigateToNotifications();
                }}
                unreadMessages={unreadCount}
            />
        </SafeAreaView>
    );
}

const StatCard = ({ icon, label, value, sub }: any) => (
    <View style={styles.statCard}>
        <View style={styles.statHeader}>
            {icon}
            <Text style={styles.statLabel}>{label}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statSub}>{sub}</Text>
    </View>
);

const EmptyState = ({ icon, title, description }: any) => (
    <View style={styles.emptyContainer}>
        {icon}
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyDesc}>{description}</Text>
    </View>
);

const JobCard = ({ job, onSelect, onStart, showStartButton }: any) => {
    const isCompleted = job.status === 'COMPLETED';
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.jobId}>{job.id}</Text>
                    <Text style={styles.serviceType}>{job.serviceType}</Text>
                </View>
                <Badge variant={isCompleted ? 'success' : 'secondary'}>
                    {isCompleted ? 'Completed' : job.status === 'IN_PROGRESS' ? 'In Progress' : 'Upcoming'}
                </Badge>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.jobInfoItem}>
                    <MapPin size={16} color={Colors.gray} />
                    <Text style={styles.jobInfoText}>{job.address}</Text>
                </View>
                <View style={styles.jobInfoRow}>
                    <View style={styles.jobInfoItem}>
                        <Clock size={16} color={Colors.gray} />
                        <Text style={styles.jobInfoText}>{job.time}</Text>
                    </View>
                    <View style={styles.jobInfoItem}>
                        <Calendar size={16} color={Colors.gray} />
                        <Text style={styles.jobInfoText}>{new Date(job.date).toLocaleDateString()}</Text>
                    </View>
                </View>
                <View style={styles.cardFooter}>
                    <Text style={styles.paymentText}>${Number(job.totalAmount).toFixed(2)}</Text>
                    <View style={styles.actions}>
                        {showStartButton && !isCompleted && (
                            <Button title="Start" onPress={() => onStart(job)} variant="gradient" style={styles.startBtn} />
                        )}
                        <TouchableOpacity onPress={() => onSelect(job)} style={styles.detailsBtn}>
                            <Text style={styles.detailsText}>Details</Text>
                            <ChevronRight size={16} color={Colors.gray} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const AvailableJobCard = ({ job, onViewDetails, onClaim }: any) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.jobId}>{job.serviceType}</Text>
                    <Text style={styles.serviceType}>{job.id}</Text>
                </View>
                <Badge variant="default">Available</Badge>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.jobInfoItem}>
                    <MapPin size={16} color={Colors.gray} />
                    <Text style={styles.jobInfoText}>{job.address}</Text>
                </View>
                <View style={styles.jobInfoRow}>
                    <View style={styles.jobInfoItem}>
                        <Clock size={16} color={Colors.gray} />
                        <Text style={styles.jobInfoText}>{job.time}</Text>
                    </View>
                    <View style={styles.jobInfoItem}>
                        <Users size={16} color={Colors.gray} />
                        <Text style={styles.jobInfoText}>{job.cleanerCount || 1} cleaners</Text>
                    </View>
                </View>
                <View style={styles.cardFooter}>
                    <Text style={styles.paymentText}>${Number(job.totalAmount).toFixed(2)}</Text>
                    <View style={styles.actions}>
                        <Button title="Claim" onPress={() => onClaim(job.id)} variant="gradient" style={styles.startBtn} />
                        <TouchableOpacity onPress={() => onViewDetails(job)} style={styles.detailsBtn}>
                            <Text style={styles.detailsText}>Details</Text>
                            <ChevronRight size={16} color={Colors.gray} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        backgroundColor: Colors.primary,
        padding: Spacing.lg,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
    },
    userRole: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        padding: Spacing.sm,
        marginLeft: Spacing.sm,
    },
    notifBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Colors.error,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifCount: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: Spacing.sm,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4,
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    statSub: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.black,
        marginTop: Spacing.md,
    },
    emptyDesc: {
        fontSize: 14,
        color: Colors.gray,
        marginTop: 4,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        marginBottom: Spacing.md,
        padding: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    jobId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
    },
    serviceType: {
        fontSize: 12,
        color: Colors.gray,
    },
    cardContent: {
        gap: Spacing.sm,
    },
    jobInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    jobInfoRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    jobInfoText: {
        fontSize: 14,
        color: '#475569',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
        paddingTop: Spacing.sm,
        marginTop: Spacing.xs,
    },
    paymentText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.black,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    startBtn: {
        height: 36,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    detailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    detailsText: {
        fontSize: 14,
        color: Colors.gray,
        fontWeight: '500',
        marginRight: 4,
    },
});
