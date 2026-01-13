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
    securityCode?: string;
    cleanerProvidedCode?: string;
    completionNotes?: string;
    completionIssues?: string;
    completionPhotos?: string[];
    revisionReason?: string;
    revisionPhotos?: string[];
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

    updateJobStatus: async (jobId: string, status: string, completionData?: any) => {
        try {
            const response = await api.patch(`/bookings/${jobId}`, { 
                status,
                ...completionData
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update job status');
        }
    },

    notifyArrival: async (jobId: string, cleanerId: string, securityCode?: string) => {
        try {
            const response = await api.post(`/bookings/${jobId}/arrive`, { cleanerId, securityCode });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to notify arrival');
        }
    }
};

/**
 * Formats the duration for display to the cleaner/customer.
 * Rounds to the nearest 0.5 hour per cleaner.
 * Each cleaner handles up to 4 hours of work.
 */
export function formatDisplayHours(estimatedHours: number, cleanerCount: number) {
    if (cleanerCount <= 0) {
        return estimatedHours;
    }

    // Calculate hours per cleaner (each cleaner can handle up to 4 hours)
    const hoursPerCleaner = estimatedHours / cleanerCount;
    
    // Round to nearest 0.5 hour
    // 0-0.24 rounds to 0, 0.25-0.74 rounds to 0.5, 0.75+ rounds to next whole number
    const roundedHours = Math.round(hoursPerCleaner * 2) / 2;
    
    return roundedHours;
}

/**
 * Calculates the cleaner's actual earnings for a job.
 * Formula: (Payment Per Hour * Hours Shown to Customer) + (Tip / Cleaner Count)
 */
export const calculateEarnings = (job: Booking): number => {
    const rate = job.paymentPerHour ? Number(job.paymentPerHour) : 20;
    const cleanerCount = job.cleanerCount || 1;
    const totalDurationHours = (job.estimatedDuration || 120) / 60;
    
    // Use hours shown to customer (clock time per cleaner)
    const hoursPerCleaner = formatDisplayHours(totalDurationHours, cleanerCount);
    
    const basePay = rate * hoursPerCleaner;
    const tip = job.tipAmount ? Number(job.tipAmount) : 0;
    
    // Split tip among cleaners
    return basePay + (tip / cleanerCount);
};
