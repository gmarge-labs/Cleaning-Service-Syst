import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { CreditCard, Shield, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';

interface PaymentModalProps {
    booking: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function PaymentModal({ booking, onClose, onSuccess }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<string>('credit-card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const totalAmount = Number(booking.totalAmount);

    const isValid = () => {
        return cardNumber && expiryDate && cvv && cardName && agreedToTerms;
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'BOOKED',
                    paymentMethod: paymentMethod,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to process payment');
            }

            toast.success('Payment successful! Booking status updated to BOOKED.');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error instanceof Error ? error.message : 'An error occurred during payment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Complete Payment</h2>
                        <p className="text-sm text-neutral-600">Booking ID: #{booking.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-neutral-600" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Security Badge */}
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <Shield className="w-6 h-6 text-green-600" />
                        <div>
                            <div className="text-sm font-semibold text-green-900">Secure Payment</div>
                            <div className="text-xs text-green-700">256-bit SSL encryption • PCI DSS compliant</div>
                        </div>
                    </div>

                    {/* Payment Method Tabs */}
                    <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                            <TabsTrigger value="debit-card">Debit Card</TabsTrigger>
                        </TabsList>

                        <TabsContent value="credit-card" className="space-y-4 mt-6">
                            <div>
                                <Label htmlFor="card-number">Card Number *</Label>
                                <div className="relative mt-1.5">
                                    <Input
                                        id="card-number"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength={19}
                                        className="pl-10"
                                    />
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="expiry">Expiry Date *</Label>
                                    <Input
                                        id="expiry"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cvv">CVV *</Label>
                                    <Input
                                        id="cvv"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                        placeholder="123"
                                        maxLength={4}
                                        type="password"
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="card-name">Cardholder Name *</Label>
                                <Input
                                    id="card-name"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    placeholder="John Doe"
                                    className="mt-1.5"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="debit-card" className="space-y-4 mt-6">
                            {/* Similar to credit card content */}
                            <div>
                                <Label htmlFor="debit-card-number">Card Number *</Label>
                                <div className="relative mt-1.5">
                                    <Input
                                        id="debit-card-number"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength={19}
                                        className="pl-10"
                                    />
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="debit-expiry">Expiry Date *</Label>
                                    <Input
                                        id="debit-expiry"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="debit-cvv">CVV *</Label>
                                    <Input
                                        id="debit-cvv"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                        placeholder="123"
                                        maxLength={4}
                                        type="password"
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="debit-card-name">Cardholder Name *</Label>
                                <Input
                                    id="debit-card-name"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    placeholder="John Doe"
                                    className="mt-1.5"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Payment Breakdown */}
                    <div className="border-t border-neutral-200 pt-6 space-y-3">
                        <div className="flex justify-between pt-3 border-t border-neutral-200">
                            <span className="font-semibold text-neutral-900">Total Amount</span>
                            <span className="font-bold text-2xl text-secondary-500">${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <strong>Full payment required.</strong> Your card will be charged immediately upon confirmation.
                            </p>
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="terms"
                            checked={agreedToTerms}
                            onCheckedChange={(checked: boolean) => setAgreedToTerms(checked)}
                        />
                        <label
                            htmlFor="terms"
                            className="text-sm text-neutral-700 cursor-pointer leading-relaxed"
                        >
                            I agree to the Terms & Conditions and Cancellation Policy *
                        </label>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={!isValid() || isLoading}
                        className="w-full bg-secondary-500 hover:bg-secondary-600 py-6 text-lg"
                    >
                        {isLoading ? 'Processing...' : `Pay $${totalAmount.toFixed(2)} Now`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
