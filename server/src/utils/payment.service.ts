import Stripe from 'stripe';
import { APIConfigService } from './api-config.service';

export class PaymentService {
    private static stripe: Stripe | null = null;

    /**
     * Initialize and return Stripe instance
     */
    private static async getStripeInstance(): Promise<Stripe> {
        if (this.stripe) return this.stripe;

        const config = await APIConfigService.getConfig('payment');
        if (!config || !config.enabled || !config.apiKey) {
            throw new Error('Stripe is not configured. Please add your secret key in settings.');
        }

        if (config.provider !== 'stripe') {
            throw new Error(`Unsupported payment provider: ${config.provider}`);
        }

        // Initialize with secret key
        this.stripe = new Stripe(config.apiKey, {
            apiVersion: '2025-01-27.acacia' as any, // Recommended version to use known types
        });

        return this.stripe;
    }

    /**
     * Create a PaymentIntent for a booking
     * @param amount Amount in dollars (will be converted to cents)
     * @param currency Currency code (default: 'usd')
     * @param metadata Additional data to store with the payment
     */
    static async createPaymentIntent(amount: number, currency: string = 'usd', metadata: any = {}) {
        try {
            const stripe = await this.getStripeInstance();

            // Stripe expects amounts in cents
            const amountInCents = Math.round(amount * 100);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: currency.toLowerCase(),
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return paymentIntent;
        } catch (error) {
            console.error('Stripe Create PaymentIntent error:', error);
            throw error;
        }
    }

    /**
     * Retrieve a PaymentIntent by ID
     */
    static async getPaymentIntent(id: string) {
        try {
            const stripe = await this.getStripeInstance();
            return await stripe.paymentIntents.retrieve(id);
        } catch (error) {
            console.error('Stripe Retrieve PaymentIntent error:', error);
            throw error;
        }
    }
}
