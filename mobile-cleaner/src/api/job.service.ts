import api from './api';

export interface Booking {
    id: string;
    userId?: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    address?: string;
    serviceType: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    toilets: number;
    date: string;
    time: string;
    totalAmount: number;
    status: string;
    distance?: string;
    cleanerId?: string;
    cleaner?: {
        name: string;
        phone: string;
    };
    user?: {
        name: string;
        phone: string;
        email: string;
    };
}

export const jobService = {
    getAvailableJobs: async (): Promise<Booking[]> => {
        try {
            // Unassigned jobs (status BOOKED and cleanerId is null)
            const response = await api.get('/bookings', { params: { status: 'BOOKED' } });
            // Filter locally for now if server doesn't support thorough filtering
            return response.data.filter((b: any) => !b.cleanerId);
        } catch (error) {
            console.error('Error fetching available jobs:', error);
            return [];
        }
    },

    getAssignedJobs: async (cleanerId: string): Promise<Booking[]> => {
        try {
            const response = await api.get('/bookings', { params: { cleanerId } });
            return response.data.filter((b: any) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
        } catch (error) {
            console.error('Error fetching assigned jobs:', error);
            return [];
        }
    },

    getJobHistory: async (cleanerId: string): Promise<Booking[]> => {
        try {
            const response = await api.get('/bookings', { params: { cleanerId } });
            return response.data.filter((b: any) => b.status === 'COMPLETED');
        } catch (error) {
            console.error('Error fetching job history:', error);
            return [];
        }
    },

    claimJob: async (jobId: string, cleanerId: string) => {
        try {
            const response = await api.patch(`/bookings/${jobId}/claim`, { cleanerId });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to claim job');
        }
    },

    updateJobStatus: async (jobId: string, status: string) => {
        try {
            const response = await api.patch(`/bookings/${jobId}`, { status });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update job status');
        }
    }
};
