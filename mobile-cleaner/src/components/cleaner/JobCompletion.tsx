import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, TextInput } from 'react-native';
import { ArrowLeft, Camera, X, CheckCircle, Upload, AlertTriangle } from 'lucide-react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Button } from '../Button';
import { Input } from '../Input';
import { jobService, Booking } from '../../api/job.service';
import { LinearGradient } from 'expo-linear-gradient';

import * as ImagePicker from 'expo-image-picker';

interface JobCompletionProps {
    job: Booking;
    onSubmit: () => void;
    onBack: () => void;
}

export function JobCompletion({ job, onSubmit, onBack }: JobCompletionProps) {
    const [photos, setPhotos] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [issues, setIssues] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePhotoUpload = async () => {
        // Request permissions
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("You've refused to allow this app to access your camera!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await jobService.updateJobStatus(job.id, 'COMPLETED');
            onSubmit();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = photos.length >= 2 && notes.trim().length > 0;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[Colors.secondary, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <ArrowLeft size={24} color={Colors.white} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Complete Job</Text>
                    <Text style={styles.headerSubtitle}>{job.guestName || 'Customer'}</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Photos Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <View style={styles.row}>
                                <Camera size={20} color={Colors.secondary} />
                                <Text style={styles.cardTitle}>Job Photos</Text>
                            </View>
                            <Text style={styles.cardSubtitle}>Upload at least 2 photos</Text>
                        </View>
                        <Text style={styles.countText}>{photos.length}/10</Text>
                    </View>

                    {photos.length > 0 && (
                        <View style={styles.photoGrid}>
                            {photos.map((photo, index) => (
                                <View key={index} style={styles.photoWrapper}>
                                    <Image source={{ uri: photo }} style={styles.photo} />
                                    <TouchableOpacity onPress={() => removePhoto(index)} style={styles.removePhotoBtn}>
                                        <X size={12} color={Colors.white} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    <Button
                        title={photos.length === 0 ? "Upload Photos" : "Add More"}
                        variant="outline"
                        onPress={handlePhotoUpload}
                        style={styles.uploadBtn}
                    />
                </View>

                {/* Notes */}
                <View style={styles.card}>
                    <Text style={styles.label}>Completion Notes *</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Describe what was completed..."
                        textAlignVertical="top"
                    />
                </View>

                {/* Issues */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <AlertTriangle size={20} color={Colors.warning} />
                        <Text style={styles.label}>Issues or Concerns</Text>
                    </View>
                    <TextInput
                        style={[styles.textArea, { height: 80 }]}
                        multiline
                        numberOfLines={3}
                        value={issues}
                        onChangeText={setIssues}
                        placeholder="Report any problems (optional)"
                        textAlignVertical="top"
                    />
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Job Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Service:</Text>
                        <Text style={styles.summaryValue}>{job.serviceType}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Earnings:</Text>
                        <Text style={styles.summaryValue}>${Number(job.totalAmount).toFixed(2)}</Text>
                    </View>
                </View>

                {!canSubmit && (
                    <View style={styles.warningBox}>
                        <AlertTriangle size={16} color={Colors.error} />
                        <Text style={styles.warningText}>
                            {photos.length < 2 ? "• Upload 2+ photos " : ""}
                            {notes.trim().length === 0 ? "• Add notes" : ""}
                        </Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={isSubmitting ? "Submitting..." : "Submit Completion"}
                    onPress={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    loading={isSubmitting}
                    variant="gradient"
                />
                <Text style={styles.footerNote}>Payment processed after submission</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        backgroundColor: Colors.success,
        padding: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    backBtn: {
        padding: Spacing.sm,
        marginRight: Spacing.sm,
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
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
    },
    cardSubtitle: {
        fontSize: 12,
        color: Colors.gray,
        marginTop: 2,
    },
    countText: {
        fontSize: 14,
        color: Colors.secondary,
        fontWeight: 'bold',
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: Spacing.md,
    },
    photoWrapper: {
        width: 100,
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    removePhotoBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: Colors.error,
        borderRadius: 10,
        padding: 4,
    },
    uploadBtn: {
        borderStyle: 'dashed',
        height: 50,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: Spacing.sm,
    },
    textArea: {
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: 12,
        padding: Spacing.md,
        height: 120,
        fontSize: 14,
        color: Colors.black,
    },
    summaryCard: {
        backgroundColor: 'rgba(236, 72, 153, 0.05)',
        borderRadius: 20,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(236, 72, 153, 0.1)',
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: Spacing.sm,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: Colors.gray,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.black,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    warningText: {
        fontSize: 12,
        color: Colors.error,
        fontWeight: '500',
    },
    footer: {
        padding: Spacing.lg,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    footerNote: {
        textAlign: 'center',
        fontSize: 12,
        color: Colors.gray,
        marginTop: Spacing.sm,
    },
});
