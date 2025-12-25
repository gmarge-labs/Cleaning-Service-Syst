import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Sparkles, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing } from '../../constants/theme';
import { Button } from '../Button';
import { Input } from '../Input';

import { authService, User } from '../../api/auth.service';

interface CleanerLoginProps {
    onLogin: (user: User) => void;
}

export function CleanerLogin({ onLogin }: CleanerLoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('maria.garcia@Sparkleville.com');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const user = await authService.login(email, password);
            onLogin(user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[Colors.secondary, Colors.accent]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoIcon}>
                                <Sparkles size={36} color={Colors.white} />
                            </View>
                            <View>
                                <Text style={styles.logoText}>Sparkleville</Text>
                                <Text style={styles.logoSubtext}>Cleaner App</Text>
                            </View>
                        </View>

                        {/* Login Card */}
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Welcome Back!</Text>
                                <Text style={styles.subtitle}>Sign in to start your day</Text>
                            </View>

                            {error && (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            <View style={styles.form}>
                                <Input
                                    label="Email Address"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="your.email@example.com"
                                    keyboardType="email-address"
                                />

                                <View>
                                    <Input
                                        label="Password"
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Enter your password"
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} color={Colors.gray} />
                                        ) : (
                                            <Eye size={20} color={Colors.gray} />
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.forgotBtn}>
                                    <Text style={styles.forgotText}>Forgot Password?</Text>
                                </TouchableOpacity>

                                <Button
                                    title={isLoading ? "Signing In..." : "Sign In"}
                                    onPress={handleSubmit}
                                    variant="gradient"
                                    style={styles.loginBtn}
                                    loading={isLoading}
                                    disabled={isLoading}
                                />

                                <View style={styles.demoBox}>
                                    <Text style={styles.demoText}>
                                        <Text style={styles.demoBold}>Demo Mode:</Text> Click "Sign In" to continue
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Need help? Contact support</Text>
                            <Text style={styles.copyright}>© 2025 Sparkleville</Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: Spacing.lg,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.xl,
        marginBottom: Spacing.xl * 1.5,
    },
    logoIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
    },
    logoSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 32,
        padding: Spacing.xl,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.gray,
    },
    form: {
        flex: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        top: 36, // Adjust based on label height
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: Spacing.xl,
    },
    forgotText: {
        color: Colors.secondary,
        fontWeight: '600',
        fontSize: 14,
    },
    loginBtn: {
        height: 56,
    },
    demoBox: {
        marginTop: Spacing.lg,
        padding: Spacing.md,
        backgroundColor: 'rgba(236, 72, 153, 0.05)',
        borderRadius: 12,
    },
    demoText: {
        textAlign: 'center',
        color: Colors.secondary,
        fontSize: 14,
    },
    demoBold: {
        fontWeight: 'bold',
    },
    footer: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    copyright: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        marginTop: Spacing.xs,
    },
    errorBox: {
        backgroundColor: 'rgba(255, 0, 0, 0.05)',
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 0, 0.1)',
    },
    errorText: {
        color: '#dc3545',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
});
