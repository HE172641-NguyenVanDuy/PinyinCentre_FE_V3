import api from './api';

const notificationService = {
    getNotifications: async () => {
        try {
            const response = await api.get('/notifications');
            return response.result;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    getUnreadCount: async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            return response.result;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    },

    markAsRead: async (id) => {
        try {
            await api.post(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    markAllAsRead: async () => {
        try {
            await api.post('/notifications/read-all');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
};

export default notificationService;
