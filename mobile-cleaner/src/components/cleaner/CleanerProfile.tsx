import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Switch, Platform, Image } from 'react-native';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Clock, Save, Edit2, IdCard, CheckCircle, X, Settings, Star, Camera } from 'lucide-react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { BottomNavigation } from './BottomNavigation';
import { CleanerView } from './BottomNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { authService, User as UserType } from '../../api/auth.service';
import { LogOut } from 'lucide-react-native';

interface CleanerProfileProps {
    currentView: CleanerView;
    onNavigate: (view: CleanerView) => void;
    user: UserType | null;
    onUpdateUser: (user: UserType) => void;
}

interface ProfileData {
    name: string;
    cleanerId: string;
    email: string;
    phone: string;
    address: string;
    preferredWorkingDays: string[];
    preferredWorkingShift: string;
    isActive: boolean;
    joinDate: string;
    rating: number;
    completedJobs: number;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const shifts = ['Morning (6 AM - 12 PM)', 'Afternoon (12 PM - 6 PM)', 'Evening (6 PM - 12 AM)', 'Flexible'];

export function CleanerProfile({ currentView, onNavigate, user, onUpdateUser }: CleanerProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [profile, setProfile] = useState<ProfileData>({
        name: user?.name || 'Cleaner',
        cleanerId: user?.id || 'ID-PENDING',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || 'No address provided',
        preferredWorkingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        preferredWorkingShift: 'Morning (6 AM - 12 PM)',
        isActive: true,
        joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
        rating: 4.8,
        completedJobs: 0,
    });

    const [editedProfile, setEditedProfile] = useState<ProfileData>(profile);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedProfile(profile);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProfile(profile);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // In a real app, we'd call an API to update the user
            // const updated = await authService.updateProfile(user.id, editedProfile);
            setProfile(editedProfile);
            if (user) {
                onUpdateUser({
                    ...user,
                    name: editedProfile.name,
                    email: editedProfile.email,
                    phone: editedProfile.phone,
                    address: editedProfile.address,
                });
            }
            setIsEditing(false);
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            onNavigate('login' as any); // Type cast as CleanerView doesn't include login in Navigation context
        } catch (error) {
            alert('Failed to logout');
        }
    };

    const toggleWorkingDay = (day: string) => {
        if (editedProfile.preferredWorkingDays.includes(day)) {
            setEditedProfile({
                ...editedProfile,
                preferredWorkingDays: editedProfile.preferredWorkingDays.filter(d => d !== day),
            });
        } else {
            setEditedProfile({
                ...editedProfile,
                preferredWorkingDays: [...editedProfile.preferredWorkingDays, day],
            });
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
                        <Text style={styles.headerTitle}>My Profile</Text>
                        <Text style={styles.headerSubtitle}>Manage your information</Text>
                    </View>
                    {!isEditing && (
                        <TouchableOpacity onPress={handleEdit} style={styles.editBtn}>
                            <Edit2 size={16} color={Colors.white} />
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.profileCard}>
                    <View style={styles.profileMain}>
                        <View style={styles.avatarContainer}>
                            <User size={32} color={Colors.white} />
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>{profile.name}</Text>
                            <View style={styles.idRow}>
                                <IdCard size={14} color="rgba(255, 255, 255, 0.8)" />
                                <Text style={styles.idText}>{profile.cleanerId}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile.rating}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile.completedJobs}</Text>
                            <Text style={styles.statLabel}>Jobs Done</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>8</Text>
                            <Text style={styles.statLabel}>Months</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Availability */}
                <View style={styles.card}>
                    <Text style={styles.cardSectionTitle}>Availability Status</Text>
                    <View style={styles.statusRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.statusLabel}>Accept New Jobs</Text>
                            <Text style={styles.statusDesc}>
                                {isEditing
                                    ? (editedProfile.isActive ? 'Online for jobs' : 'Offline for jobs')
                                    : (profile.isActive ? 'Online for jobs' : 'Offline for jobs')}
                            </Text>
                        </View>
                        {isEditing ? (
                            <Switch
                                value={editedProfile.isActive}
                                onValueChange={(val) => setEditedProfile({ ...editedProfile, isActive: val })}
                                trackColor={{ false: Colors.lightGray, true: Colors.success }}
                                thumbColor={Colors.white}
                            />
                        ) : (
                            <Badge
                                variant={profile.isActive ? 'success' : 'neutral'}
                            >
                                {profile.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        )}
                    </View>
                </View>

                {/* Logout Button */}
                <View style={[styles.card, { marginTop: Spacing.md }]}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <LogOut size={20} color={Colors.error} />
                        <Text style={styles.logoutText}>Logout from Account</Text>
                    </TouchableOpacity>
                </View>

                {/* Contact info */}
                <View style={styles.card}>
                    <Text style={styles.cardSectionTitle}>Contact Information</Text>
                    <View style={styles.inputGroup}>
                        <View style={styles.inputLabelRow}>
                            <Mail size={14} color={Colors.gray} />
                            <Text style={styles.inputLabel}>Email Address</Text>
                        </View>
                        {isEditing ? (
                            <TextInput
                                style={styles.textInput}
                                value={editedProfile.email}
                                onChangeText={(text) => setEditedProfile({ ...editedProfile, email: text })}
                                keyboardType="email-address"
                            />
                        ) : (
                            <Text style={styles.valueText}>{profile.email}</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputLabelRow}>
                            <Phone size={14} color={Colors.gray} />
                            <Text style={styles.inputLabel}>Phone Number</Text>
                        </View>
                        {isEditing ? (
                            <TextInput
                                style={styles.textInput}
                                value={editedProfile.phone}
                                onChangeText={(text) => setEditedProfile({ ...editedProfile, phone: text })}
                                keyboardType="phone-pad"
                            />
                        ) : (
                            <Text style={styles.valueText}>{profile.phone}</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputLabelRow}>
                            <MapPin size={14} color={Colors.gray} />
                            <Text style={styles.inputLabel}>Home Address</Text>
                        </View>
                        {isEditing ? (
                            <TextInput
                                style={[styles.textInput, { height: 80 }]}
                                value={editedProfile.address}
                                onChangeText={(text) => setEditedProfile({ ...editedProfile, address: text })}
                                multiline
                                textAlignVertical="top"
                            />
                        ) : (
                            <Text style={styles.valueText}>{profile.address}</Text>
                        )}
                    </View>
                </View>

                {/* Work preferences */}
                <View style={styles.card}>
                    <Text style={styles.cardSectionTitle}>Work Preferences</Text>
                    <View style={styles.inputGroup}>
                        <View style={styles.inputLabelRow}>
                            <Calendar size={14} color={Colors.gray} />
                            <Text style={styles.inputLabel}>Working Days</Text>
                        </View>
                        {isEditing ? (
                            <View style={styles.daysGrid}>
                                {daysOfWeek.map((day) => (
                                    <TouchableOpacity
                                        key={day}
                                        onPress={() => toggleWorkingDay(day)}
                                        style={[
                                            styles.dayBtn,
                                            editedProfile.preferredWorkingDays.includes(day) && styles.dayBtnActive
                                        ]}
                                    >
                                        <Text style={[
                                            styles.dayBtnText,
                                            editedProfile.preferredWorkingDays.includes(day) && styles.dayBtnTextActive
                                        ]}>
                                            {day.substring(0, 3)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.badgeRow}>
                                {profile.preferredWorkingDays.map((day) => (
                                    <Badge key={day} variant="info" style={styles.profileBadge}>{day}</Badge>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputLabelRow}>
                            <Clock size={14} color={Colors.gray} />
                            <Text style={styles.inputLabel}>Preferred Shift</Text>
                        </View>
                        {isEditing ? (
                            <View style={styles.shiftList}>
                                {shifts.map((shift) => (
                                    <TouchableOpacity
                                        key={shift}
                                        onPress={() => setEditedProfile({ ...editedProfile, preferredWorkingShift: shift })}
                                        style={[
                                            styles.shiftBtn,
                                            editedProfile.preferredWorkingShift === shift && styles.shiftBtnActive
                                        ]}
                                    >
                                        <Text style={[
                                            styles.shiftBtnText,
                                            editedProfile.preferredWorkingShift === shift && styles.shiftBtnTextActive
                                        ]}>
                                            {shift}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <Badge variant="info">{profile.preferredWorkingShift}</Badge>
                        )}
                    </View>
                </View>

                {isEditing && (
                    <View style={styles.actionRow}>
                        <Button
                            title="Save Changes"
                            variant="gradient"
                            onPress={handleSave}
                            style={styles.saveBtn}
                        />
                        <Button
                            title="Cancel"
                            variant="outline"
                            onPress={handleCancel}
                            style={styles.cancelBtn}
                        />
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
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    backBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 12,
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
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    editBtnText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '500',
    },
    profileCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: Spacing.md,
    },
    profileMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameContainer: {
        flex: 1,
    },
    nameText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    idRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    idText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    statsRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingTop: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    statLabel: {
        fontSize: 10,
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
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    cardSectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.black,
    },
    statusDesc: {
        fontSize: 12,
        color: Colors.gray,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    inputLabel: {
        fontSize: 12,
        color: Colors.gray,
        fontWeight: '500',
    },
    valueText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.black,
        paddingLeft: 20,
    },
    textInput: {
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: Colors.black,
        backgroundColor: Colors.background,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%',
    },
    dayBtnActive: {
        borderColor: Colors.secondary,
        backgroundColor: 'rgba(32, 201, 151, 0.1)',
    },
    dayBtnText: {
        fontSize: 12,
        color: Colors.gray,
        fontWeight: '500',
    },
    dayBtnTextActive: {
        color: Colors.secondary,
        fontWeight: 'bold',
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    profileBadge: {
        marginBottom: 4,
    },
    shiftList: {
        gap: 8,
    },
    shiftBtn: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    shiftBtnActive: {
        borderColor: Colors.secondary,
        backgroundColor: 'rgba(32, 201, 151, 0.1)',
    },
    shiftBtnText: {
        fontSize: 13,
        color: Colors.gray,
    },
    shiftBtnTextActive: {
        color: Colors.secondary,
        fontWeight: 'bold',
    },
    actionRow: {
        gap: 12,
        marginTop: 8,
    },
    saveBtn: {
        // backgroundColor handled by variant="gradient"
    },
    cancelBtn: {
        borderColor: Colors.gray,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    logoutText: {
        color: Colors.error,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
