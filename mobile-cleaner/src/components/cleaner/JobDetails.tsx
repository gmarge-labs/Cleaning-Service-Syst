import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal, TextInput, Linking, Platform } from 'react-native';
import { ArrowLeft, MapPin, Clock, DollarSign, Navigation, CheckCircle, AlertCircle, Package, Shield, Send, Key, IdCard, ListChecks, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input } from '../Input';
import { jobService, Booking } from '../../api/job.service';
import { LinearGradient } from 'expo-linear-gradient';

interface JobDetailsProps {
    job: Booking;
    onBack: () => void;
    onCompleteJob: () => void;
    onClaimJob: (jobId: string) => void;
}

export function JobDetails({ job, onBack, onCompleteJob, onClaimJob }: JobDetailsProps) {
    const [isClockedIn, setIsClockedIn] = useState(job.status === 'IN_PROGRESS');
    const [startTime, setStartTime] = useState<Date | null>(job.status === 'IN_PROGRESS' ? new Date() : null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [securityCodeInput, setSecurityCodeInput] = useState('');
    const [cleanerIdInput, setCleanerIdInput] = useState('');
    const [showTaskList, setShowTaskList] = useState(job.status === 'IN_PROGRESS');
    const [completedTasks, setCompletedTasks] = useState<string[]>([]);
    const [elapsedTime, setElapsedTime] = useState('0:00');

    const cleanerId = 'CLN-12845';
    const jobSecurityCode = '4738';

    const cleaningTasks = [
        'Dust all surfaces',
        'Vacuum all floors',
        'Mop hard floors',
        'Empty trash bins',
        'Wipe down light switches',
        'Clean countertops',
        'Clean sink and faucet',
        'Sanitize toilet',
        'Clean mirrors',
    ];

    useEffect(() => {
        let interval: any;
        if (isClockedIn && startTime) {
            interval = setInterval(() => {
                const now = new Date();
                const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                const hours = Math.floor(diff / 3600);
                const minutes = Math.floor((diff % 3600) / 60);
                setElapsedTime(`${hours}:${minutes.toString().padStart(2, '0')}`);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isClockedIn, startTime]);

    const handleArrival = () => {
        setShowVerificationModal(true);
    };

    const handleVerify = async () => {
        if (securityCodeInput === jobSecurityCode && cleanerIdInput === cleanerId) {
            try {
                await jobService.updateJobStatus(job.id, 'IN_PROGRESS');
                setIsClockedIn(true);
                setStartTime(new Date());
                setShowTaskList(true);
                setShowVerificationModal(false);
            } catch (error: any) {
                alert(error.message);
            }
        } else {
            alert('Invalid Security Code or Cleaner ID');
        }
    };

    const handleGetDirections = () => {
        const encodedAddress = encodeURIComponent(job.address);

        // URL Schemes for Google Maps
        const googleMapsUrl = Platform.select({
            ios: `comgooglemaps://?q=${encodedAddress}`,
            android: `google.navigation:q=${encodedAddress}`,
        });

        // Web Fallback (Google Maps)
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

        if (googleMapsUrl) {
            Linking.canOpenURL(googleMapsUrl).then(supported => {
                if (supported) {
                    Linking.openURL(googleMapsUrl);
                } else {
                    Linking.openURL(webUrl);
                }
            }).catch(() => {
                Linking.openURL(webUrl);
            });
        } else {
            Linking.openURL(webUrl);
        }
    };

    const toggleTask = (task: string) => {
        if (completedTasks.includes(task)) {
            setCompletedTasks(completedTasks.filter(t => t !== task));
        } else {
            setCompletedTasks([...completedTasks, task]);
        }
    };

    const allTasksCompleted = completedTasks.length === cleaningTasks.length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[Colors.secondary, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                        <ArrowLeft size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>{job.guestName || 'Customer'}</Text>
                        <Text style={styles.headerSubtitle}>{job.id}</Text>
                    </View>
                    <Badge variant={isClockedIn ? 'success' : 'outline'} style={{ borderColor: Colors.white }}>
                        {isClockedIn ? 'In Progress' : 'Not Started'}
                    </Badge>
                </View>

                {isClockedIn && (
                    <View style={styles.timerCard}>
                        <Text style={styles.timerLabel}>Time Elapsed</Text>
                        <Text style={styles.timerValue}>{elapsedTime}</Text>
                        <Text style={styles.timerTarget}>Expected: {job.propertyType}</Text>
                    </View>
                )}
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {showTaskList ? (
                    <View style={styles.taskSection}>
                        <View style={styles.progressCard}>
                            <View style={styles.progressHeader}>
                                <View style={styles.row}>
                                    <ListChecks size={20} color={Colors.success} />
                                    <Text style={styles.progressTitle}>Task Progress</Text>
                                </View>
                                <Text style={styles.progressCount}>{completedTasks.length}/{cleaningTasks.length}</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${(completedTasks.length / cleaningTasks.length) * 100}%` }]} />
                            </View>
                        </View>

                        <View style={styles.taskListContainer}>
                            <Text style={styles.sectionTitle}>Checklist</Text>
                            <View style={styles.taskGrid}>
                                {cleaningTasks.map((task, index) => {
                                    const isDone = completedTasks.includes(task);
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.taskItem, isDone && styles.taskItemDone]}
                                            onPress={() => toggleTask(task)}
                                        >
                                            <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
                                                {isDone && <CheckCircle size={14} color={Colors.white} />}
                                            </View>
                                            <Text style={[styles.taskText, isDone && styles.taskTextDone]}>{task}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.detailsSection}>
                        {/* Location */}
                        <View style={styles.detailCard}>
                            <View style={styles.detailHeader}>
                                <MapPin size={20} color={Colors.secondary} />
                                <Text style={styles.detailTitle}>Location</Text>
                            </View>
                            <Text style={styles.detailText}>{job.address}</Text>
                            <Button title="Get Directions" onPress={handleGetDirections} variant="outline" style={styles.mapBtn} />
                        </View>

                        {/* Schedule */}
                        <View style={styles.detailCard}>
                            <View style={styles.detailHeader}>
                                <Clock size={20} color={Colors.secondary} />
                                <Text style={styles.detailTitle}>Schedule</Text>
                            </View>
                            <View style={styles.scheduleGrid}>
                                <View>
                                    <Text style={styles.label}>Scheduled Date</Text>
                                    <Text style={styles.value}>{new Date(job.date).toLocaleDateString()}</Text>
                                </View>
                                <View>
                                    <Text style={styles.label}>Start Time</Text>
                                    <Text style={styles.value}>{job.time}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Service */}
                        <View style={styles.detailCard}>
                            <Text style={styles.detailTitle}>Service Details</Text>
                            <View style={[styles.row, { marginTop: 8 }]}>
                                <Text style={styles.label}>Type: </Text>
                                <Text style={styles.value}>{job.serviceType}</Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <DollarSign size={20} color={Colors.success} />
                                <Text style={styles.paymentValue}>${Number(job.totalAmount).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
                {!job.cleanerId ? (
                    <Button title="Claim Job" onPress={() => onClaimJob(job.id)} variant="gradient" />
                ) : !isClockedIn ? (
                    <Button title="Arrive and Verify" onPress={handleArrival} variant="gradient" />
                ) : (
                    <Button
                        title="Complete Job"
                        onPress={onCompleteJob}
                        disabled={!allTasksCompleted}
                        variant="gradient"
                        style={!allTasksCompleted ? { opacity: 0.5 } : {}}
                    />
                )}
            </View>

            {/* Verification Modal */}
            <Modal visible={showVerificationModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <SafeAreaView style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Shield size={48} color={Colors.secondary} />
                            <Text style={styles.modalTitle}>Arrival Verification</Text>
                            <Text style={styles.modalSubtitle}>Enter codes to start timer</Text>
                        </View>

                        <LinearGradient
                            colors={[Colors.secondary, Colors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.codeCard}
                        >
                            <View style={styles.codeItem}>
                                <Text style={styles.codeLabel}>Security Code</Text>
                                <Text style={styles.codeValue}>{jobSecurityCode}</Text>
                            </View>
                            <View style={styles.codeDivider} />
                            <View style={styles.codeItem}>
                                <Text style={styles.codeLabel}>Cleaner ID</Text>
                                <Text style={styles.codeValue}>{cleanerId}</Text>
                            </View>
                        </LinearGradient>

                        <View style={styles.inputSection}>
                            <Input
                                label="Enter Security Code"
                                value={securityCodeInput}
                                onChangeText={setSecurityCodeInput}
                                placeholder="4-digit code"
                                keyboardType="numeric"
                            />
                            <Input
                                label="Enter Cleaner ID"
                                value={cleanerIdInput}
                                onChangeText={setCleanerIdInput}
                                placeholder="CLN-XXXXX"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <Button title="Verify & Start" onPress={handleVerify} variant="gradient" />
                            <Button title="Cancel" variant="outline" onPress={() => setShowVerificationModal(false)} />
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

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
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    backBtn: {
        padding: Spacing.sm,
        marginRight: Spacing.sm,
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
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    timerCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    timerLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    timerValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.white,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginVertical: 4,
    },
    timerTarget: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    content: {
        flex: 1,
    },
    taskSection: {
        padding: Spacing.md,
    },
    progressCard: {
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
        borderRadius: 20,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.success,
    },
    progressCount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.success,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.success,
        borderRadius: 4,
    },
    taskListContainer: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: Spacing.md,
        color: Colors.black,
    },
    taskGrid: {
        gap: Spacing.sm,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    taskItemDone: {
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
        borderColor: Colors.success,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.lightGray,
        marginRight: Spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxDone: {
        backgroundColor: Colors.success,
        borderColor: Colors.success,
    },
    taskText: {
        fontSize: 14,
        color: Colors.black,
    },
    taskTextDone: {
        color: Colors.gray,
        textDecorationLine: 'line-through',
    },
    detailsSection: {
        padding: Spacing.md,
    },
    detailCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.sm,
    },
    detailTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
    },
    detailText: {
        fontSize: 14,
        color: Colors.gray,
        lineHeight: 20,
    },
    mapBtn: {
        marginTop: Spacing.md,
        height: 40,
    },
    scheduleGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    label: {
        fontSize: 12,
        color: Colors.gray,
        marginBottom: 2,
    },
    value: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.black,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.md,
        gap: 4,
    },
    paymentValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.black,
    },
    footer: {
        padding: Spacing.lg,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderRadius: 32,
        padding: Spacing.xl,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: Spacing.md,
    },
    modalSubtitle: {
        fontSize: 16,
        color: Colors.gray,
    },
    codeCard: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: Spacing.md,
        marginBottom: Spacing.xl,
    },
    codeItem: {
        flex: 1,
        alignItems: 'center',
    },
    codeLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    codeValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    codeDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    inputSection: {
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    modalActions: {
        gap: Spacing.sm,
    },
});
