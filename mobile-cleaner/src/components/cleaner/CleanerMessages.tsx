import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, User } from 'lucide-react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { BottomNavigation } from './BottomNavigation';
import { CleanerView } from './BottomNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { messageService, Conversation, Message } from '../../api/message.service';
import { useSocket } from '../../hooks/useSocket';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CleanerMessagesProps {
    currentView: CleanerView;
    onNavigate: (view: CleanerView) => void;
    unreadCount?: number;
}

export function CleanerMessages({ currentView, onNavigate, unreadCount }: CleanerMessagesProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [user, setUser] = useState<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        const loadUser = async () => {
            const userJson = await AsyncStorage.getItem('user');
            if (userJson) {
                setUser(JSON.parse(userJson));
            }
        };
        loadUser();
        loadConversations();
    }, []);

    useEffect(() => {
        if (socket && user) {
            socket.on('receive_message', (message: Message) => {
                if (selectedConversation && (message.senderId === selectedConversation.id || message.receiverId === selectedConversation.id)) {
                    setMessages(prev => [...prev, message]);
                }
                loadConversations();
            });

            return () => {
                socket.off('receive_message');
            };
        }
    }, [socket, selectedConversation, user]);

    const loadConversations = async () => {
        try {
            const data = await messageService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (partnerId: string) => {
        setLoadingMessages(true);
        try {
            const data = await messageService.getMessages(partnerId);
            setMessages(data);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSelectConversation = (conv: Conversation) => {
        setSelectedConversation(conv);
        loadMessages(conv.id);
    };

    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);

    const formatTime = (timeStr: string) => {
        return timeStr; // The backend already formats it as "10:30 AM" or "Yesterday"
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !user) return;

        const messageText = newMessage.trim();
        setNewMessage('');

        try {
            const sentMessage = await messageService.sendMessage(selectedConversation.id, messageText);
            setMessages(prev => [...prev, sentMessage]);

            if (socket && isConnected) {
                socket.emit('send_message', {
                    senderId: user.id,
                    receiverId: selectedConversation.id,
                    text: messageText,
                });
            }

            loadConversations();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (selectedConversation) {
        return (
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                            <Text style={styles.avatarText}>{selectedConversation.role.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.chatTitle}>{selectedConversation.role}</Text>
                        </View>
                    </LinearGradient>

                    {loadingMessages ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.messagesList}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                        >
                            {messages.map((msg) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <View
                                        key={msg.id}
                                        style={[
                                            styles.messageWrapper,
                                            isMe ? styles.myMessageWrapper : styles.theirMessageWrapper
                                        ]}
                                    >
                                        {!isMe && <Text style={styles.senderLabel}>{selectedConversation.role}</Text>}
                                        <View style={[
                                            styles.messageBubble,
                                            isMe ? styles.myBubble : styles.theirBubble
                                        ]}>
                                            <Text style={[
                                                styles.messageText,
                                                isMe ? styles.myMessageText : styles.theirMessageText
                                            ]}>
                                                {msg.text}
                                            </Text>
                                        </View>
                                        <Text style={styles.messageTime}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                );
                            })}
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    )}

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

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <ScrollView style={styles.content}>
                    {conversations.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No messages yet</Text>
                        </View>
                    ) : (
                        conversations.map((conv) => (
                            <TouchableOpacity
                                key={conv.id}
                                style={styles.convCard}
                                onPress={() => handleSelectConversation(conv)}
                            >
                                <View style={styles.convAvatar}>
                                    <Text style={styles.avatarText}>{conv.role.charAt(0)}</Text>
                                </View>
                                <View style={styles.convInfo}>
                                    <View style={styles.convHeader}>
                                        <View style={styles.row}>
                                            <Text style={styles.convName}>{conv.role}</Text>
                                        </View>
                                        <Text style={styles.convTime}>{conv.time}</Text>
                                    </View>
                                    <View style={styles.convFooter}>
                                        <Text style={styles.lastMsg} numberOfLines={1}>{conv.lastMessage}</Text>
                                        {conv.unread > 0 && (
                                            <View style={styles.dotBadge}>
                                                <Text style={styles.dotBadgeText}>{conv.unread}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>
            )}

            <BottomNavigation
                currentView={currentView}
                onNavigate={onNavigate}
                unreadMessages={unreadCount}
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
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.gray,
        textAlign: 'center',
    }
});
