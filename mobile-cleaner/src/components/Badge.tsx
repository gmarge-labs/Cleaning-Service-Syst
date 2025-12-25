import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/theme';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'secondary' | 'success' | 'outline' | 'info' | 'warning' | 'neutral' | 'error';
    style?: ViewStyle;
}

export const Badge = ({ children, variant = 'default', style }: BadgeProps) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return { bg: 'rgba(236, 72, 153, 0.1)', text: Colors.secondary };
            case 'success':
                return { bg: 'rgba(32, 201, 151, 0.1)', text: Colors.success };
            case 'info':
                return { bg: 'rgba(124, 211, 222, 0.1)', text: Colors.accent };
            case 'warning':
                return { bg: 'rgba(255, 184, 77, 0.1)', text: Colors.warning };
            case 'error':
                return { bg: 'rgba(199, 21, 133, 0.1)', text: Colors.error };
            case 'neutral':
                return { bg: Colors.lightGray, text: Colors.gray };
            case 'outline':
                return { bg: 'transparent', text: Colors.gray, border: 1 };
            default:
                return { bg: Colors.lightGray, text: Colors.black };
        }
    };

    const { bg, text, border } = getVariantStyles();

    return (
        <View style={[
            styles.badge,
            { backgroundColor: bg, borderColor: text, borderWidth: border || 0 },
            style
        ]}>
            <Text style={[styles.text, { color: text }]}>{children}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 99,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
    },
});
