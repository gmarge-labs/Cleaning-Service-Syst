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
    rooms?: any;
    addOns?: any[];
    kitchenAddOns?: any;
    laundryRoomDetails?: any;
    hasPet?: boolean;
    petDetails?: any;
    specialInstructions?: string;
    frequency?: string;
    estimatedDuration?: number;
    cleanerCount?: number;
    paymentPerHour?: number;
    date: string;
    time: string;
    tipAmount?: number;
    totalAmount: number;
    status: string;
    distance?: string;
    cleanerId?: string;
    claimedBy?: Array<{
        id: string;
        name: string;
        phone: string;
        email: string;
    }>;
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
            // Fetch jobs that are published (BOOKED, CONFIRMED, RESCHEDULED, or PENDING)
            const response = await api.get('/bookings', {
                params: { status: 'BOOKED,CONFIRMED,RESCHEDULED,PENDING' }
            });
            // The server already filters for jobs that need more cleaners
            return response.data;
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

    getJobDetails: async (jobId: string): Promise<Booking> => {
        try {
            const response = await api.get(`/bookings/${jobId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch job details');
        }
    },

    updateJobStatus: async (jobId: string, status: string, _completionData?: any) => {
        try {
            const response = await api.patch(`/bookings/${jobId}`, { status });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update job status');
        }
    },

    completeJob: async (jobId: string, data: { status: string, notes: string, issues: string, photos: string[] }) => {
        try {
            const response = await api.patch(`/bookings/${jobId}/complete`, data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to complete job');
        }
    }
};

/**
 * Calculates the cleaner's actual earnings for a job.
 * Formula: (Payment Per Hour * (Duration in Minutes / 60)) + Tip
 */
export const calculateEarnings = (job: Booking): number => {
    const rate = job.paymentPerHour ? Number(job.paymentPerHour) : 20;
    const duration = job.estimatedDuration || 120;
    const hours = duration / 60;
    const basePay = rate * hours;
    const tip = job.tipAmount ? Number(job.tipAmount) : 0;
    return basePay + tip;
};
