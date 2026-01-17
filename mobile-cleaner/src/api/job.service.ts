import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
            const response = await api.get('/bookings', {
                params: { status: 'BOOKED,CONFIRMED,RESCHEDULED,PENDING' }
            });
            try {
                // Limit to 50 items to avoid storage full
                const dataToCache = response.data.slice(0, 50);
                await AsyncStorage.setItem('cached_available_jobs', JSON.stringify(dataToCache));
            } catch (storageError: any) {
                console.error('Storage error (available):', storageError);
                if (storageError.message && storageError.message.includes('SQLITE_FULL')) {
                    await AsyncStorage.clear(); 
                }
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching available jobs:', error);
            // Return cached data on error if needed, or empty array
            const cached = await AsyncStorage.getItem('cached_available_jobs');
            if (cached) return JSON.parse(cached);
            return [];
        }
    },

    getCachedAvailableJobs: async (): Promise<Booking[]> => {
        try {
            const cached = await AsyncStorage.getItem('cached_available_jobs');
            return cached ? JSON.parse(cached) : [];
        } catch (e) { return []; }
    },

    getAssignedJobs: async (cleanerId: string): Promise<Booking[]> => {
        try {
            const response = await api.get('/bookings', { params: { cleanerId } });
            const data = response.data.filter((b: any) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
            try {
                await AsyncStorage.setItem(`cached_assigned_jobs_${cleanerId}`, JSON.stringify(data));
            } catch (storageError: any) {
                console.error('Storage error (assigned):', storageError);
            }
            return data;
        } catch (error) {
            console.error('Error fetching assigned jobs:', error);
            const cached = await AsyncStorage.getItem(`cached_assigned_jobs_${cleanerId}`);
            if (cached) return JSON.parse(cached);
            return [];
        }
    },

    getCachedAssignedJobs: async (cleanerId: string): Promise<Booking[]> => {
        try {
            const cached = await AsyncStorage.getItem(`cached_assigned_jobs_${cleanerId}`);
            return cached ? JSON.parse(cached) : [];
        } catch (e) { return []; }
    },

    getJobHistory: async (cleanerId: string): Promise<Booking[]> => {
        try {
            const response = await api.get('/bookings', { params: { cleanerId } });
            const data = response.data.filter((b: any) => b.status === 'COMPLETED');
            try {
                // Limit history to last 20 items to save space
                const dataToCache = data.slice(0, 20);
                await AsyncStorage.setItem(`cached_history_jobs_${cleanerId}`, JSON.stringify(dataToCache));
            } catch (storageError: any) {
                console.error('Storage error (history):', storageError);
                if (storageError.message && storageError.message.includes('SQLITE_FULL')) {
                    // Critical cleanup if full
                    const keys = await AsyncStorage.getAllKeys();
                    await AsyncStorage.multiRemove(keys);
                }
            }
            return data;
        } catch (error) {
            console.error('Error fetching job history:', error);
            try {
                const cached = await AsyncStorage.getItem(`cached_history_jobs_${cleanerId}`);
                if (cached) return JSON.parse(cached);
            } catch (e) { /* ignore */ }
            return [];
        }
    },

    getCachedJobHistory: async (cleanerId: string): Promise<Booking[]> => {
        try {
            const cached = await AsyncStorage.getItem(`cached_history_jobs_${cleanerId}`);
            return cached ? JSON.parse(cached) : [];
        } catch (e) { return []; }
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
