import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, Spacing } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const Button = ({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) => {
    const isOutline = variant === 'outline';
    const isSecondary = variant === 'secondary';
    const isGradient = variant === 'gradient';

    const content = loading ? (
        <ActivityIndicator color={isOutline ? Colors.primary : Colors.white} />
    ) : (
        <Text style={[styles.text, isOutline && styles.outlineText]}>{title}</Text>
    );

    if (isGradient && !disabled) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                style={[styles.button, { paddingHorizontal: 0 }, style]}
            >
                <LinearGradient
                    colors={[Colors.secondary, Colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradient, loading && { opacity: 0.7 }]}
                >
                    {content}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                isOutline && styles.outlineButton,
                isSecondary && styles.secondaryButton,
                disabled && styles.disabledButton,
                style,
            ]}
        >
            {content}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.primary,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
    },
    secondaryButton: {
        backgroundColor: Colors.secondary,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    disabledButton: {
        backgroundColor: Colors.lightGray,
    },
    text: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    outlineText: {
        color: Colors.primary,
    },
    gradient: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
});
