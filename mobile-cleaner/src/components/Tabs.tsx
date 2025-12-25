import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../constants/theme';

interface TabsProps {
    tabs: { id: string; label: string; count?: number }[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const Tabs = ({ tabs, activeTab, onTabChange }: TabsProps) => {
    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => onTabChange(tab.id)}
                        style={[styles.tab, isActive && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                            {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: Colors.secondary,
    },
    tabText: {
        fontSize: 14,
        color: Colors.gray,
        fontWeight: '500',
    },
    activeTabText: {
        color: Colors.secondary,
        fontWeight: '600',
    },
});
