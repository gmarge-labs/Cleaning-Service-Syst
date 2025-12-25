import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing } from '../constants/theme';

interface InputProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    error?: string;
    style?: ViewStyle;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    error,
    style,
    autoCapitalize = 'none',
    keyboardType = 'default',
}: InputProps) => {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                style={[styles.input, error && styles.inputError]}
                placeholderTextColor={Colors.gray}
                autoCapitalize={autoCapitalize}
                keyboardType={keyboardType}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: 14,
        color: Colors.black,
        marginBottom: Spacing.xs,
        fontWeight: '500',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
        color: Colors.black,
        backgroundColor: Colors.white,
    },
    inputError: {
        borderColor: Colors.error,
    },
    errorText: {
        color: Colors.error,
        fontSize: 12,
        marginTop: Spacing.xs,
    },
    // The following styles were added from the instruction, assuming they are intended for this file's StyleSheet.
    // If they belong to a different component (e.g., JobCompletion.tsx), they should be moved there.
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    scheduleGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
});
