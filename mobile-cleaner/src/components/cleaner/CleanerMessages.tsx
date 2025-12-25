import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, Send, User } from 'lucide-react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { BottomNavigation } from './BottomNavigation';
import { CleanerView } from './BottomNavigation';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
    id: string;
    text: string;
    sender: 'cleaner' | 'admin' | 'supervisor';
    senderName: string;
    timestamp: Date;
    isRead?: boolean;
}

interface Conversation {
    id: string;
    name: string;
    role: 'Admin' | 'Supervisor';
    avatar: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    messages: Message[];
}

interface CleanerMessagesProps {
    currentView: CleanerView;
    onNavigate: (view: CleanerView) => void;
}

const mockConversations: Conversation[] = [
    {
        id: 'CONV-001',
        name: 'Admin Team',
        role: 'Admin',
        avatar: 'AT',
        lastMessage: 'Your weekly earnings have been processed.',
        lastMessageTime: new Date(Date.now() - 3600000),
        unreadCount: 2,
        messages: [
            {
                id: 'MSG-001',
                text: 'Hi Maria! We noticed you completed 5 jobs this week. Great work!',
                sender: 'admin',
                senderName: 'Admin Team',
                timestamp: new Date(Date.now() - 86400000),
            },
            {
                id: 'MSG-002',
                text: 'Thank you! I really enjoy working with the team.',
                sender: 'cleaner',
                senderName: 'Maria Garcia',
                timestamp: new Date(Date.now() - 82800000),
            },
            {
                id: 'MSG-003',
                text: 'We have updated our safety protocols. Please ensure you wear protective gloves when handling chemical cleaners.',
                sender: 'admin',
                senderName: 'Admin Team',
                timestamp: new Date(Date.now() - 7200000),
                isRead: false,
            },
            {
                id: 'MSG-004',
                text: 'Your weekly earnings have been processed and will be deposited within 24 hours. Total: $1,247.50',
                sender: 'admin',
                senderName: 'Admin Team',
                timestamp: new Date(Date.now() - 3600000),
                isRead: false,
            },
        ],
    },
    {
        id: 'CONV-002',
        name: 'Sarah Thompson',
        role: 'Supervisor',
        avatar: 'ST',
        lastMessage: 'Keep up the amazing work!',
        lastMessageTime: new Date(Date.now() - 86400000),
        unreadCount: 0,
        messages: [
            {
                id: 'MSG-005',
                text: 'Hi Maria, I wanted to personally thank you for the excellent work at the Johnson residence!',
                sender: 'supervisor',
                senderName: 'Sarah Thompson',
                timestamp: new Date(Date.now() - 172800000),
            },
            {
                id: 'MSG-006',
                text: 'Thank you so much Sarah! The customers were very kind too.',
                sender: 'cleaner',
                senderName: 'Maria Garcia',
                timestamp: new Date(Date.now() - 169200000),
            },
            {
                id: 'MSG-007',
                text: 'They left a 5-star review and specifically mentioned your attention to detail. Keep up the amazing work!',
                sender: 'supervisor',
                senderName: 'Sarah Thompson',
                timestamp: new Date(Date.now() - 86400000),
            },
        ],
    },
];

export function CleanerMessages({ currentView, onNavigate }: CleanerMessagesProps) {
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / 3600000);
        if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const newMsg: Message = {
            id: `MSG-${Date.now()}`,
            text: newMessage,
            sender: 'cleaner',
            senderName: 'Maria Garcia',
            timestamp: new Date(),
        };

        const updatedConv = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, newMsg],
            lastMessage: newMessage,
            lastMessageTime: new Date(),
        };

        setSelectedConversation(updatedConv);
        setNewMessage('');

        // In a real app, update the conversations list too
        setConversations(prev => prev.map(c => c.id === updatedConv.id ? updatedConv : c));
    };

    if (selectedConversation) {
        return (
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <SafeAreaView style={styles.container}>
                    <LinearGradient
                        colors={[Colors.secondary, Colors.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.chatHeader}
                    >
                        <TouchableOpacity onPress={() => setSelectedConversation(null)} style={styles.backBtn}>
                            <ArrowLeft size={20} color={Colors.white} />
                        </TouchableOpacity>
                        <View style={styles.chatAvatar}>
                            <Text style={styles.avatarText}>{selectedConversation.avatar}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.chatTitle}>{selectedConversation.name}</Text>
                            <Text style={styles.chatSubtitle}>{selectedConversation.role}</Text>
                        </View>
                    </LinearGradient>

                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesList}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    >
                        {selectedConversation.messages.map((msg) => (
                            <View
                                key={msg.id}
                                style={[
                                    styles.messageWrapper,
                                    msg.sender === 'cleaner' ? styles.myMessageWrapper : styles.theirMessageWrapper
                                ]}
                            >
                                {msg.sender !== 'cleaner' && <Text style={styles.senderLabel}>{msg.senderName}</Text>}
                                <View style={[
                                    styles.messageBubble,
                                    msg.sender === 'cleaner' ? styles.myBubble : styles.theirBubble
                                ]}>
                                    <Text style={[
                                        styles.messageText,
                                        msg.sender === 'cleaner' ? styles.myMessageText : styles.theirMessageText
                                    ]}>
                                        {msg.text}
                                    </Text>
                                </View>
                                <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
                            </View>
                        ))}
                        <View style={{ height: 20 }} />
                    </ScrollView>

                    <View style={styles.inputContainer}>
                        <View style={styles.textInputWrapper}>
                            <TextInput
                                style={styles.chatInput}
                                value={newMessage}
                                onChangeText={setNewMessage}
                                placeholder="Type a message..."
                                multiline
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]}
                            onPress={handleSendMessage}
                            disabled={!newMessage.trim()}
                        >
                            <Send size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[Colors.secondary, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <View style={styles.headerTitleRow}>
                    <View>
                        <Text style={styles.headerTitle}>Messages</Text>
                        <Text style={styles.headerSubtitle}>
                            {totalUnread > 0 ? `${totalUnread} unread messages` : 'All caught up!'}
                        </Text>
                    </View>
                    {totalUnread > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{totalUnread}</Text>
                        </View>
                    )}
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {conversations.map((conv) => (
                    <TouchableOpacity
                        key={conv.id}
                        style={styles.convCard}
                        onPress={() => setSelectedConversation(conv)}
                    >
                        <View style={styles.convAvatar}>
                            <Text style={styles.avatarText}>{conv.avatar}</Text>
                        </View>
                        <View style={styles.convInfo}>
                            <View style={styles.convHeader}>
                                <View style={styles.row}>
                                    <Text style={styles.convName}>{conv.name}</Text>
                                    <Badge variant="neutral">{conv.role}</Badge>
                                </View>
                                <Text style={styles.convTime}>{formatTime(conv.lastMessageTime)}</Text>
                            </View>
                            <View style={styles.convFooter}>
                                <Text style={styles.lastMsg} numberOfLines={1}>{conv.lastMessage}</Text>
                                {conv.unreadCount > 0 && (
                                    <View style={styles.dotBadge}>
                                        <Text style={styles.dotBadgeText}>{conv.unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomNavigation
                currentView={currentView}
                onNavigate={onNavigate}
                unreadMessages={totalUnread}
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
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    unreadBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    unreadBadgeText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    convCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        gap: 12,
    },
    convAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    convInfo: {
        flex: 1,
    },
    convHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    convName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
    },
    convTime: {
        fontSize: 11,
        color: Colors.gray,
    },
    convFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMsg: {
        fontSize: 13,
        color: Colors.gray,
        flex: 1,
        marginRight: 8,
    },
    dotBadge: {
        backgroundColor: Colors.error,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    dotBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    chatHeader: {
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    chatAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
    },
    chatSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    messagesList: {
        flex: 1,
        padding: 16,
    },
    messageWrapper: {
        marginBottom: 16,
        maxWidth: '80%',
    },
    myMessageWrapper: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    theirMessageWrapper: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    senderLabel: {
        fontSize: 11,
        color: Colors.gray,
        marginBottom: 4,
        marginLeft: 4,
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    myBubble: {
        backgroundColor: Colors.secondary,
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderBottomLeftRadius: 4,
    },
    myMessageText: {
        color: Colors.white,
    },
    theirMessageText: {
        color: Colors.black,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    messageTime: {
        fontSize: 10,
        color: Colors.gray,
        marginTop: 4,
    },
    inputContainer: {
        padding: 12,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    },
    textInputWrapper: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    chatInput: {
        fontSize: 14,
        color: Colors.black,
        maxHeight: 100,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnDisabled: {
        opacity: 0.5,
    },
    backBtn: {
        padding: 8,
    }
});
