import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal, TextInput, Linking, Platform } from 'react-native';
import { ArrowLeft, MapPin, Clock, DollarSign, Navigation, CheckCircle, AlertCircle, Package, Shield, Send, Key, IdCard, ListChecks, ChevronRight, Users, Wrench, Info, Home } from 'lucide-react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input } from '../Input';
import { jobService, Booking, calculateEarnings } from '../../api/job.service';
import { LinearGradient } from 'expo-linear-gradient';

interface JobDetailsProps {
    job: Booking;
    user: any; // Using any for simplicity as User type isn't exported here
    onBack: () => void;
    onCompleteJob: () => void;
    onClaimJob: (jobId: string) => void;
}

export function JobDetails({ job, user, onBack, onCompleteJob, onClaimJob }: JobDetailsProps) {
    const isClaimedByMe = job.claimedBy?.some(c => c.id === user?.id) || 
                         job.cleanerId === user?.id;
    const [isClockedIn, setIsClockedIn] = useState(job.status === 'IN_PROGRESS');
    const [startTime, setStartTime] = useState<Date | null>(job.status === 'IN_PROGRESS' ? new Date() : null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [arrivalNotified, setArrivalNotified] = useState(job.status === 'ARRIVED' || job.status === 'IN_PROGRESS');
    const [securityCodeInput, setSecurityCodeInput] = useState('');
    const [cleanerIdInput, setCleanerIdInput] = useState('');
    const [showTaskList, setShowTaskList] = useState(job.status === 'IN_PROGRESS');
    const [completedTasks, setCompletedTasks] = useState<string[]>([]);
    const [elapsedTime, setElapsedTime] = useState('0:00');

    const cleanerId = user?.id || 'CLN-12845';
    const jobSecurityCode = job.securityCode || job.id.slice(-4).toUpperCase();

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

    const handleArrival = async () => {
        try {
            await jobService.notifyArrival(job.id, user.id);
            setArrivalNotified(true);
            setShowVerificationModal(true);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleStartClick = () => {
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
                        <Text style={styles.headerTitle}>Job Details</Text>
                        <Text style={styles.headerSubtitle}>{job.id}</Text>
                    </View>
                    <Badge variant={job.status === 'COMPLETED' ? 'success' : isClockedIn ? 'info' : 'outline'} style={{ borderColor: Colors.white }}>
                        {job.status === 'COMPLETED' ? 'Completed' : isClockedIn ? 'In Progress' : 'Not Started'}
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
                            {job.status !== 'COMPLETED' && (
                                <Button title="Get Directions" onPress={handleGetDirections} variant="outline" style={styles.mapBtn} />
                            )}
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
                                    <Text style={styles.value}>{new Date(job.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}</Text>
                                </View>
                                <View>
                                    <Text style={styles.label}>Start Time</Text>
                                    <Text style={styles.value}>{job.time}</Text>
                                </View>
                                <View>
                                    <Text style={styles.label}>Frequency</Text>
                                    <Text style={styles.value}>{job.frequency || 'One-time'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Property Details */}
                        <View style={styles.detailCard}>
                            <View style={styles.detailHeader}>
                                <Home size={20} color={Colors.secondary} />
                                <Text style={styles.detailTitle}>Property Details</Text>
                            </View>
                            <Text style={[styles.label, { marginBottom: 8 }]}>Type: <Text style={styles.value}>{job.propertyType}</Text></Text>
                            <View style={styles.propertyGrid}>
                                <View style={styles.propertyItem}>
                                    <Text style={styles.propertyLabel}>Bedrooms</Text>
                                    <Text style={styles.propertyValue}>{job.bedrooms}</Text>
                                </View>
                                <View style={styles.propertyItem}>
                                    <Text style={styles.propertyLabel}>Bathrooms</Text>
                                    <Text style={styles.propertyValue}>{job.bathrooms}</Text>
                                </View>
                                {job.toilets !== undefined && (
                                    <View style={styles.propertyItem}>
                                        <Text style={styles.propertyLabel}>Toilets</Text>
                                        <Text style={styles.propertyValue}>{job.toilets}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Additional Rooms */}
                            {job.rooms && typeof job.rooms === 'object' && !Array.isArray(job.rooms) && Object.keys(job.rooms).length > 0 ? (
                                <View style={{ marginTop: 12 }}>
                                    <Text style={styles.label}>Additional Rooms:</Text>
                                    <View style={styles.badgeContainer}>
                                        {Object.entries(job.rooms).map(([room, count]: [string, any]) =>
                                            count > 0 ? (
                                                <Badge key={room} variant="outline">
                                                    {room.replace(/([A-Z])/g, ' $1').replace(/-/g, ' ')} x{count}
                                                </Badge>
                                            ) : null
                                        )}
                                    </View>
                                </View>
                            ) : null}
                        </View>

                        {/* Service & Add-ons */}
                        <View style={styles.detailCard}>
                            <View style={styles.detailHeader}>
                                <Package size={20} color={Colors.secondary} />
                                <Text style={styles.detailTitle}>Service & Add-ons</Text>
                            </View>
                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <Text style={styles.value}>{job.serviceType}</Text>
                                <View style={styles.row}>
                                    <DollarSign size={16} color={Colors.success} />
                                    <Text style={[styles.value, { color: Colors.success }]}>
                                        {calculateEarnings(job).toFixed(2)}
                                    </Text>
                                </View>
                            </View>

                            {job.addOns && job.addOns.length > 0 ? (
                                <View style={{ marginTop: 12 }}>
                                    <Text style={styles.label}>Add-ons:</Text>
                                    <View style={styles.badgeContainer}>
                                        {job.addOns.map((addon: any, index: number) => (
                                            <Badge key={index} variant="secondary">
                                                {typeof addon === 'string' ? addon : addon.name}
                                                {addon.quantity && addon.quantity > 1 ? ` x${addon.quantity}` : ''}
                                            </Badge>
                                        ))}
                                    </View>
                                </View>
                            ) : null}

                            {/* Kitchen Add-ons */}
                            {job.kitchenAddOns && typeof job.kitchenAddOns === 'object' && Object.keys(job.kitchenAddOns).length > 0 ? (
                                <View style={{ marginTop: 12 }}>
                                    <Text style={styles.label}>Kitchen Add-ons:</Text>
                                    {Object.entries(job.kitchenAddOns).map(([kitchenIndex, addons]: [string, any]) => (
                                        addons && addons.length > 0 ? (
                                            <View key={kitchenIndex} style={{ marginTop: 4 }}>
                                                <Text style={[styles.label, { fontSize: 10 }]}>Kitchen #{parseInt(kitchenIndex) + 1}</Text>
                                                <View style={styles.badgeContainer}>
                                                    {addons.map((addon: string, idx: number) => (
                                                        <Badge key={idx} variant="outline">{addon}</Badge>
                                                    ))}
                                                </View>
                                            </View>
                                        ) : null
                                    ))}
                                </View>
                            ) : null}

                            {/* Laundry Details */}
                            {job.laundryRoomDetails && typeof job.laundryRoomDetails === 'object' && Object.keys(job.laundryRoomDetails).length > 0 ? (
                                <View style={{ marginTop: 12 }}>
                                    <Text style={styles.label}>Laundry Details:</Text>
                                    {Object.entries(job.laundryRoomDetails).map(([laundryIndex, details]: [string, any]) => (
                                        details ? (
                                            <View key={laundryIndex} style={{ marginTop: 4 }}>
                                                <Text style={[styles.label, { fontSize: 10 }]}>Laundry Room #{parseInt(laundryIndex) + 1}</Text>
                                                <Text style={styles.detailText}>Baskets: {details.baskets}, Rounds: {details.rounds}</Text>
                                            </View>
                                        ) : null
                                    ))}
                                </View>
                            ) : null}
                        </View>

                        {/* Pets */}
                        {job.hasPet ? (
                            <View style={styles.detailCard}>
                                <View style={styles.detailHeader}>
                                    <Info size={20} color={Colors.secondary} />
                                    <Text style={styles.detailTitle}>Pets Information</Text>
                                </View>
                                <View style={styles.badgeContainer}>
                                    {job.petDetails?.dog ? <Badge variant="secondary" style={styles.petBadge}>Dogs</Badge> : null}
                                    {job.petDetails?.cat ? <Badge variant="secondary" style={styles.petBadge}>Cats</Badge> : null}
                                    {job.petDetails?.other ? <Badge variant="secondary" style={styles.petBadge}>Other Pets</Badge> : null}
                                </View>
                                {job.petDetails?.customPets && job.petDetails.customPets.length > 0 ? (
                                    <Text style={[styles.detailText, { marginTop: 8 }]}>Other types: {job.petDetails.customPets.join(', ')}</Text>
                                ) : null}
                                <Text style={[styles.detailText, { marginTop: 4 }]}>
                                    Presence: {job.petDetails?.petPresent ? 'Pets will be home' : 'Pets will be away'}
                                </Text>
                                {job.petDetails?.petInstructions ? (
                                    <View style={styles.instructionBox}>
                                        <Text style={styles.instructionText}>"{job.petDetails.petInstructions}"</Text>
                                    </View>
                                ) : null}
                            </View>
                        ) : null}

                        {/* Special Instructions */}
                        {job.specialInstructions ? (
                            <View style={styles.detailCard}>
                                <View style={styles.detailHeader}>
                                    <Wrench size={20} color={Colors.secondary} />
                                    <Text style={styles.detailTitle}>Special Instructions</Text>
                                </View>
                                <View style={styles.instructionBox}>
                                    <Text style={styles.instructionText}>"{job.specialInstructions}"</Text>
                                </View>
                            </View>
                        ) : null}
                    </View>
                )}
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
                {!isClaimedByMe ? (
                    <Button title="Start" onPress={() => onClaimJob(job.id)} variant="gradient" />
                ) : job.status === 'COMPLETED' ? (
                    <View style={{ alignItems: 'center', padding: Spacing.sm }}>
                        <Text style={{ color: Colors.success, fontWeight: 'bold' }}>Job Completed</Text>
                    </View>
                ) : !isClockedIn ? (
                    !arrivalNotified ? (
                        <Button title="Arrive" onPress={handleArrival} variant="gradient" />
                    ) : (
                        <Button title="Start" onPress={handleStartClick} variant="gradient" />
                    )
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
                                <Text style={styles.codeLabel}>Job Security Code</Text>
                                <View style={styles.codeRow}>
                                    <Key size={24} color={Colors.white} style={{ marginRight: 8 }} />
                                    <Text style={styles.codeValue}>{jobSecurityCode}</Text>
                                </View>
                            </View>
                            <View style={styles.codeDivider} />
                            <View style={styles.codeItem}>
                                <Text style={styles.codeLabel}>Your Cleaner ID</Text>
                                <View style={styles.codeRow}>
                                    <IdCard size={24} color={Colors.white} style={{ marginRight: 8 }} />
                                    <Text style={styles.codeValue}>{cleanerId}</Text>
                                </View>
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
    propertyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginTop: 8,
    },
    propertyItem: {
        flex: 1,
        minWidth: '28%',
        backgroundColor: 'rgba(32, 201, 151, 0.05)',
        padding: Spacing.sm,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(32, 201, 151, 0.1)',
    },
    propertyLabel: {
        fontSize: 10,
        color: Colors.gray,
        marginBottom: 2,
    },
    propertyValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    instructionBox: {
        backgroundColor: 'rgba(32, 201, 151, 0.05)',
        padding: Spacing.md,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.secondary,
        marginTop: 8,
    },
    instructionText: {
        fontSize: 14,
        color: Colors.black,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    petBadge: {
        backgroundColor: Colors.black,
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
        backgroundColor: Colors.primary,
        borderRadius: 24,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    codeItem: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    codeLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    codeValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.white,
        letterSpacing: 2,
    },
    codeDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: Spacing.md,
    },
    inputSection: {
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    modalActions: {
        gap: Spacing.sm,
    },
});
