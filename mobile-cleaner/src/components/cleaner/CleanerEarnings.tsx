import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Clock, CheckCircle, Award } from 'lucide-react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Badge } from '../Badge';
import { BottomNavigation } from './BottomNavigation';
import { CleanerView } from './BottomNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { jobService, Booking } from '../../api/job.service';
import { authService, User as UserType } from '../../api/auth.service';
import { RefreshControl } from 'react-native';

interface CleanerEarningsProps {
    currentView: CleanerView;
    onNavigate: (view: CleanerView) => void;
    user: UserType | null;
}

interface EarningRecord {
    id: string;
    jobId: string;
    customer: string;
    serviceType: string;
    date: Date;
    duration: string;
    amount: number;
    status: 'paid' | 'pending' | 'processing';
}

const earningsData: EarningRecord[] = [
    {
        id: 'E-001',
        jobId: 'JOB-245',
        customer: 'Sarah Johnson',
        serviceType: 'Deep Cleaning',
        date: new Date(Date.now() - 86400000),
        duration: '3 hours',
        amount: 189.00,
        status: 'paid',
    },
    {
        id: 'E-002',
        jobId: 'JOB-244',
        customer: 'Michael Chen',
        serviceType: 'Standard Cleaning',
        date: new Date(Date.now() - 172800000),
        duration: '2 hours',
        amount: 120.00,
        status: 'paid',
    },
    {
        id: 'E-003',
        jobId: 'JOB-243',
        customer: 'Emily Rodriguez',
        serviceType: 'Move In/Out',
        date: new Date(Date.now() - 259200000),
        duration: '5 hours',
        amount: 249.00,
        status: 'paid',
    },
    {
        id: 'E-004',
        jobId: 'JOB-242',
        customer: 'David Wilson',
        serviceType: 'Deep Cleaning',
        date: new Date(Date.now() - 345600000),
        duration: '3 hours',
        amount: 189.00,
        status: 'paid',
    },
    {
        id: 'E-005',
        jobId: 'JOB-241',
        customer: 'Lisa Anderson',
        serviceType: 'Standard Cleaning',
        date: new Date(Date.now() - 432000000),
        duration: '2 hours',
        amount: 120.00,
        status: 'processing',
    },
    {
        id: 'E-006',
        jobId: 'JOB-240',
        customer: 'James Taylor',
        serviceType: 'Deep Cleaning',
        date: new Date(Date.now() - 518400000),
        duration: '4 hours',
        amount: 210.00,
        status: 'paid',
    },
    {
        id: 'E-007',
        jobId: 'JOB-239',
        customer: 'Maria Santos',
        serviceType: 'Standard Cleaning',
        date: new Date(Date.now() - 604800000),
        duration: '2 hours',
        amount: 120.00,
        status: 'paid',
    },
];

export function CleanerEarnings({ currentView, onNavigate, user }: CleanerEarningsProps) {
    const [earningsData, setEarningsData] = React.useState<Booking[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchData = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const history = await jobService.getJobHistory(user.id);
            setEarningsData(history);
        } catch (error) {
            console.error('Fetch earnings error:', error);
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

    const totalEarnings = earningsData.reduce((sum, record) => sum + Number(record.totalAmount), 0);
    const weeklyEarnings = earningsData
        .filter(record => new Date(record.date).getTime() > Date.now() - 7 * 86400000)
        .reduce((sum, record) => sum + Number(record.totalAmount), 0);
    const monthlyEarnings = earningsData
        .filter(record => new Date(record.date).getTime() > Date.now() - 30 * 86400000)
        .reduce((sum, record) => sum + Number(record.totalAmount), 0);

    const totalJobs = earningsData.length;
    const totalHours = earningsData.length * 3; // Placeholder until real duration is stored
    const averagePerJob = totalJobs > 0 ? totalEarnings / totalJobs : 0;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge variant="success">Paid</Badge>;
            default:
                return <Badge variant="warning">{status}</Badge>;
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
                    <TouchableOpacity onPress={() => onNavigate('dashboard')} style={styles.backBtn}>
                        <ArrowLeft size={20} color={Colors.white} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>My Earnings</Text>
                        <Text style={styles.headerSubtitle}>Track your income and performance</Text>
                    </View>
                </View>

                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total Earnings (All Time)</Text>
                    <View style={styles.totalAmountRow}>
                        <DollarSign size={28} color={Colors.white} />
                        <Text style={styles.totalAmount}>{totalEarnings.toFixed(2)}</Text>
                    </View>

                    <View style={styles.miniStats}>
                        <View style={styles.miniStatItem}>
                            <Text style={styles.miniStatValue}>${weeklyEarnings.toFixed(0)}</Text>
                            <Text style={styles.miniStatLabel}>This Week</Text>
                        </View>
                        <View style={[styles.miniStatItem, styles.miniStatBorder]}>
                            <Text style={styles.miniStatValue}>${monthlyEarnings.toFixed(0)}</Text>
                            <Text style={styles.miniStatLabel}>This Month</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.secondary]} />
                }
            >
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <View style={[styles.statIcon, { backgroundColor: 'rgba(0, 150, 136, 0.1)' }]}>
                            <CheckCircle size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.statValue}>{totalJobs}</Text>
                        <Text style={styles.statLabel}>Jobs Done</Text>
                    </View>

                    <View style={styles.statBox}>
                        <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 184, 77, 0.1)' }]}>
                            <Clock size={20} color={Colors.warning} />
                        </View>
                        <Text style={styles.statValue}>{totalHours.toFixed(0)}</Text>
                        <Text style={styles.statLabel}>Hours</Text>
                    </View>

                    <View style={styles.statBox}>
                        <View style={[styles.statIcon, { backgroundColor: 'rgba(124, 211, 222, 0.1)' }]}>
                            <TrendingUp size={20} color={Colors.accent} />
                        </View>
                        <Text style={styles.statValue}>${averagePerJob.toFixed(0)}</Text>
                        <Text style={styles.statLabel}>Avg/Job</Text>
                    </View>
                </View>

                {/* Professional Advancement Card */}
                <LinearGradient
                    colors={[Colors.secondary, Colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.bonusBanner}
                >
                    <View style={styles.bonusIcon}>
                        <Award size={24} color={Colors.white} />
                    </View>
                    <View style={styles.bonusInfo}>
                        <Text style={styles.bonusTitle}>Professional Advancement</Text>
                        <Text style={styles.bonusSubtitle}>Level 1 (Entry) → Level 2 (Professional)</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '66%', backgroundColor: Colors.white }]} />
                        </View>
                        <View style={styles.progressText}>
                            <Text style={styles.progressCount}>4 / 6 months worked</Text>
                            <Text style={styles.progressPercent}>66%</Text>
                        </View>
                        <Text style={[styles.bonusSubtitle, { marginTop: 4, fontWeight: 'bold' }]}>
                            Next level: 15% hourly rate increase!
                        </Text>
                    </View>
                </LinearGradient>

                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>Recent Earnings</Text>
                    <Text style={styles.sectionSubtitle}>Your payment history from completed jobs</Text>

                    {earningsData.length > 0 ? (
                        earningsData.map((record) => (
                            <View key={record.id} style={styles.recordCard}>
                                <View style={styles.recordHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.row}>
                                            <Text style={styles.customerName}>{record.guestName || record.user?.name || 'Customer'}</Text>
                                            {getStatusBadge(record.status)}
                                        </View>
                                        <Text style={styles.serviceType}>{record.serviceType}</Text>
                                        <Text style={styles.recordId}>Booking ID: {record.id}</Text>
                                    </View>
                                    <View style={styles.amountContainer}>
                                        <DollarSign size={16} color={Colors.secondary} />
                                        <Text style={styles.amountText}>{Number(record.totalAmount).toFixed(2)}</Text>
                                    </View>
                                </View>

                                <View style={styles.recordFooter}>
                                    <View style={styles.footerItem}>
                                        <Calendar size={14} color={Colors.gray} />
                                        <Text style={styles.footerText}>{formatDate(new Date(record.date))}</Text>
                                    </View>
                                    <View style={styles.footerItem}>
                                        <Clock size={14} color={Colors.gray} />
                                        <Text style={styles.footerText}>{record.time}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <DollarSign size={48} color={Colors.lightGray} />
                            <Text style={styles.emptyText}>No earnings yet. Complete your first job!</Text>
                        </View>
                    )}
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Earnings are processed weekly and deposited every Friday. Processing time: 1-2 business days.
                    </Text>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomNavigation
                currentView={currentView}
                onNavigate={onNavigate}
            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: Spacing.md,
    },
    backBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    totalCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: Spacing.md,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    totalAmountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 16,
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.white,
    },
    miniStats: {
        flexDirection: 'row',
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingTop: 12,
    },
    miniStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    miniStatBorder: {
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    },
    miniStatValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
    },
    miniStatLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: Spacing.md,
    },
    statBox: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.black,
    },
    statLabel: {
        fontSize: 10,
        color: Colors.gray,
    },
    bonusBanner: {
        flexDirection: 'row',
        backgroundColor: Colors.secondary,
        borderRadius: 20,
        padding: Spacing.md,
        gap: 12,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    bonusIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bonusInfo: {
        flex: 1,
    },
    bonusTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.white,
    },
    bonusSubtitle: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.white,
        borderRadius: 3,
    },
    progressText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressCount: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    progressPercent: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.white,
    },
    historySection: {
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: Colors.gray,
        marginBottom: 12,
    },
    recordCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    customerName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.black,
    },
    serviceType: {
        fontSize: 13,
        color: Colors.gray,
    },
    recordId: {
        fontSize: 11,
        color: Colors.gray,
        marginTop: 2,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    amountText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    recordFooter: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        color: Colors.gray,
    },
    infoBox: {
        backgroundColor: 'rgba(0, 150, 136, 0.05)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 150, 136, 0.1)',
    },
    infoText: {
        fontSize: 11,
        color: Colors.primary,
        textAlign: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: Spacing.xl,
        marginTop: Spacing.xl,
    },
    emptyText: {
        color: Colors.gray,
        marginTop: Spacing.md,
        fontSize: 14,
        textAlign: 'center',
    },
});
