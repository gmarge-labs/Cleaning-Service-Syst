import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, TrendingUp, MessageSquare, User } from 'lucide-react-native';
import { Colors, Spacing } from '../../constants/theme';

export type CleanerView = 'login' | 'dashboard' | 'job-details' | 'job-completion' | 'messages' | 'profile' | 'earnings' | 'notifications';

interface BottomNavigationProps {
    currentView: CleanerView;
    onNavigate: (view: CleanerView) => void;
    unreadMessages?: number;
}

export function BottomNavigation({ currentView, onNavigate, unreadMessages = 2 }: BottomNavigationProps) {
    const navItems = [
        {
            id: 'dashboard' as CleanerView,
            icon: Home,
            label: 'Home',
        },
        {
            id: 'earnings' as CleanerView,
            icon: TrendingUp,
            label: 'Earnings',
        },
        {
            id: 'messages' as CleanerView,
            icon: MessageSquare,
            label: 'Messages',
            badge: unreadMessages,
        },
        {
            id: 'profile' as CleanerView,
            icon: User,
            label: 'Profile',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.navContent}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id || (currentView === 'dashboard' && item.id === 'dashboard');

                    return (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => onNavigate(item.id)}
                            style={[
                                styles.navItem,
                                isActive && styles.activeNavItem
                            ]}
                        >
                            <View>
                                <Icon size={22} color={isActive ? Colors.secondary : Colors.gray} />
                                {item.badge && item.badge > 0 && !isActive && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{item.badge}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.label, isActive && styles.activeLabel]}>{item.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
        paddingBottom: Spacing.md, // Safe area padding
        paddingTop: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    navContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    navItem: {
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: 12,
        minWidth: 70,
    },
    activeNavItem: {
        backgroundColor: 'rgba(32, 201, 151, 0.05)',
    },
    label: {
        fontSize: 10,
        marginTop: 4,
        color: Colors.gray,
        fontWeight: '500',
    },
    activeLabel: {
        color: Colors.secondary,
        fontWeight: '600',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -8,
        backgroundColor: Colors.error,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});
