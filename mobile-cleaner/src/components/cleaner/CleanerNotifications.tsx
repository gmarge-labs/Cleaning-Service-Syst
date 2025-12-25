import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { ArrowLeft, Bell, Calendar, Clock, Check, MoreVertical, Trash2, CheckCircle2 } from 'lucide-react-native';
import { Colors, Spacing } from '../../constants/theme';
import { BottomNavigation } from './BottomNavigation';
import { CleanerView } from './BottomNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { notificationService, Notification as NotificationType } from '../../api/notification.service';
import { RefreshControl } from 'react-native';
import { socketService } from '../../api/socket.service';

export interface Notification {
    id: string;
    type: 'new_booking' | 'job_update' | 'payment_received' | 'rating_received';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    bookingId?: string;
}

interface CleanerNotificationsProps {
    currentView: CleanerView;
    onNavigate: (view: CleanerView) => void;
    userId: string | undefined;
}

export function CleanerNotifications({
    currentView,
    onNavigate,
    userId,
}: CleanerNotificationsProps) {
    const [notifications, setNotifications] = React.useState<NotificationType[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchData = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const data = await notificationService.getUserNotifications(userId);
            setNotifications(data);
        } catch (error) {
            console.error('Fetch notifications error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();

        const socket = socketService.getSocket();
        if (socket) {
            socket.on('new_notification', (notification: NotificationType) => {
                setNotifications(prev => [notification, ...prev]);
            });

            return () => {
                socket.off('new_notification');
            };
        }
    }, [userId]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [userId]);

    const onMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            alert('Failed to mark notification as read');
        }
    };

    const onMarkAllAsRead = async () => {
        if (!userId) return;
        try {
            await notificationService.markAllAsRead(userId);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            alert('Failed to mark all as read');
        }
    };

    const onDeleteNotification = async (id: string) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            alert('Failed to delete notification');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getNotificationColor = (type: Notification['type']): [string, string] => {
        switch (type) {
            case 'new_booking':
                return [Colors.secondary, Colors.accent];
            case 'job_update':
                return ['#3b82f6', '#2563eb'];
            case 'rating_received':
                return ['#a855f7', '#9333ea'];
            case 'payment_received':
                return ['#22c55e', '#16a34a'];
            default:
                return ['#94a3b8', '#64748b'];
        }
    };

    const getEmojiIcon = (type: Notification['type']) => {
        switch (type) {
            case 'new_booking':
                return '🔔';
            case 'job_update':
                return '📋';
            case 'rating_received':
                return '💬';
            case 'payment_received':
                return '💰';
            default:
                return '✨';
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
                        <Text style={styles.headerTitle}>Notifications</Text>
                        {unreadCount > 0 && (
                            <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
                        )}
                    </View>
                    {notifications.length > 0 && unreadCount > 0 && (
                        <TouchableOpacity style={styles.markAllBtn} onPress={onMarkAllAsRead}>
                            <Check size={16} color={Colors.white} />
                            <Text style={styles.markAllText}>Mark all read</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.secondary]} />
                }
            >
                {notifications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Bell size={40} color={Colors.gray} />
                        </View>
                        <Text style={styles.emptyTitle}>No Notifications</Text>
                        <Text style={styles.emptyDesc}>You're all caught up! We'll notify you when there's something new.</Text>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {notifications.map((notification) => (
                            <View
                                key={notification.id}
                                style={[
                                    styles.notificationCard,
                                    !notification.isRead && styles.unreadCard
                                ]}
                            >
                                <View style={styles.cardContent}>
                                    <LinearGradient
                                        colors={getNotificationColor(notification.type as any)}
                                        style={styles.iconContainer}
                                    >
                                        <Text style={styles.typeIcon}>{getEmojiIcon(notification.type as any)}</Text>
                                    </LinearGradient>

                                    <View style={styles.notifInfo}>
                                        <View style={styles.notifHeader}>
                                            <Text style={[styles.notifTitle, !notification.isRead && styles.unreadTitle]}>
                                                {notification.title}
                                            </Text>
                                            <Text style={styles.notifTime}>{formatTime(new Date(notification.createdAt))}</Text>
                                        </View>
                                        <Text style={styles.notifMessage} numberOfLines={2}>{notification.message}</Text>

                                        <View style={styles.notifActions}>
                                            <View style={styles.leftActions}>
                                                {!notification.isRead && (
                                                    <TouchableOpacity onPress={() => onMarkAsRead(notification.id)} style={styles.actionBtn}>
                                                        <Text style={styles.actionText}>Mark read</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            <TouchableOpacity onPress={() => onDeleteNotification(notification.id)} style={styles.deleteBtn}>
                                                <Trash2 size={14} color={Colors.gray} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                {!notification.isRead && <View style={styles.unreadDot} />}
                            </View>
                        ))}
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomNavigation
                currentView={currentView}
                onNavigate={onNavigate}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: Spacing.md,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
    markAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    markAllText: {
        fontSize: 11,
        color: Colors.white,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 14,
        color: Colors.gray,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    list: {
        gap: 12,
    },
    notificationCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        position: 'relative',
    },
    unreadCard: {
        borderColor: 'rgba(0, 150, 136, 0.2)',
        backgroundColor: 'rgba(0, 150, 136, 0.02)',
    },
    cardContent: {
        flexDirection: 'row',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    typeIcon: {
        fontSize: 20,
    },
    notifInfo: {
        flex: 1,
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.black,
        flex: 1,
        marginRight: 8,
    },
    unreadTitle: {
        color: Colors.primary,
    },
    notifTime: {
        fontSize: 11,
        color: Colors.gray,
    },
    notifMessage: {
        fontSize: 13,
        color: Colors.gray,
        marginBottom: 12,
        lineHeight: 18,
    },
    notifActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: 'rgba(0, 150, 136, 0.1)',
        borderRadius: 6,
    },
    actionText: {
        fontSize: 11,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    deleteBtn: {
        padding: 6,
    },
    unreadDot: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
});
