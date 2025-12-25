import api from './api';

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export const notificationService = {
    getUserNotifications: async (userId: string, page = 1, limit = 20): Promise<Notification[]> => {
        try {
            const response = await api.get(`/notifications/${userId}`, {
                params: { page, limit }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    getUnreadCount: async (userId: string): Promise<number> => {
        try {
            const response = await api.get(`/notifications/${userId}/unread-count`);
            return response.data.unreadCount;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    },

    markAsRead: async (notificationId: string) => {
        try {
            const response = await api.patch(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    markAllAsRead: async (userId: string) => {
        try {
            const response = await api.patch(`/notifications/${userId}/read-all`);
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    deleteNotification: async (notificationId: string) => {
        try {
            const response = await api.delete(`/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
};
