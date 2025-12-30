import api from './api';

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    isRead: boolean;
    createdAt: string;
}

export interface Conversation {
    id: string;
    name: string;
    role: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
}

export const messageService = {
    getConversations: async () => {
        const response = await api.get<Conversation[]>('/messages/conversations');
        return response.data;
    },

    getMessages: async (partnerId: string) => {
        const response = await api.get<Message[]>(`/messages/${partnerId}`);
        return response.data;
    },

    getContacts: async () => {
        const response = await api.get<any[]>('/messages/contacts');
        return response.data;
    },

    sendMessage: async (receiverId: string, text: string) => {
        const response = await api.post<Message>('/messages', { receiverId, text });
        return response.data;
    }
};
