import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { BookingData } from '../BookingFlow';
import { CreditCard, Shield, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { toast } from 'sonner';

interface PaymentStepProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Frequency discount percentages
const FREQUENCY_DISCOUNTS = {
  'One-time': 0,
  'Weekly': 15,
  'Bi-weekly': 10,
  'Monthly': 5,
};

export function PaymentStep({ data, onUpdate, onNext, onBack }: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>(data.paymentMethod || 'credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [applyFreeCleaning, setApplyFreeCleaning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  // Get frequency from data (set in SchedulingStep)
  const frequency = data.frequency || 'One-time';

  // Mock base price (would come from pricing sidebar)
  const baseAmount = 200;

  // Free cleaning loyalty program
  const COMPLETED_CLEANINGS = 3; // Mock: User has completed 3 cleanings
  const FREE_CLEANING_THRESHOLD = 5; // Free cleaning after 5 cleanings
  const qualifiesForFreeCleaning = COMPLETED_CLEANINGS >= FREE_CLEANING_THRESHOLD;

  // Calculate discount
  const discountPercentage = FREQUENCY_DISCOUNTS[frequency as keyof typeof FREQUENCY_DISCOUNTS] || 0;
  const discountAmount = (baseAmount * discountPercentage) / 100;

  // Apply free cleaning if selected
  const freeCleaningDiscount = applyFreeCleaning && qualifiesForFreeCleaning ? baseAmount : 0;
  const totalAmount = baseAmount - discountAmount - freeCleaningDiscount;

  // Remove unused handleFrequencyChange

  const isValid = () => {
    // If using free cleaning and total is $0, only need to agree to terms
    if (applyFreeCleaning && qualifiesForFreeCleaning && totalAmount === 0) {
      return agreedToTerms;
    }
    // Otherwise, require full payment details
    return cardNumber && expiryDate && cvv && cardName && agreedToTerms;
  };

  const handleSubmit = async (status: 'BOOKED' | 'DRAFT' = 'BOOKED') => {
    setIsLoading(true);

    const bookingPayload = {
      ...data,
      userId: user?.id || null,
      guestName: !user ? (data.name || null) : null,
      guestEmail: !user ? (data.email || null) : null,
      guestPhone: !user ? (data.phone || null) : null,
      address: data.address || null,
      totalAmount: totalAmount,
      paymentMethod: totalAmount === 0 ? 'free-cleaning-reward' : (status === 'DRAFT' ? null : paymentMethod),
      status: status,
    };

    try {
      const response = await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to create booking');
      }

      onUpdate({
        totalAmount: totalAmount,
        paymentMethod: totalAmount === 0 ? 'free-cleaning-reward' : (status === 'DRAFT' ? undefined : paymentMethod),
      });

      toast.success(status === 'DRAFT' ? 'Booking saved as draft!' : 'Booking created successfully!');
      onNext();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred while creating your booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Payment Details</h2>
          <p className="text-neutral-600">Secure payment processing with end-to-end encryption</p>
        </div>

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

        {/* Free Cleaning Loyalty Program */}
        {qualifiesForFreeCleaning ? (
          <div className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🎉</div>
              <div className="flex-1">
                <h3 className="font-bold text-orange-900 text-lg mb-1">
                  Congratulations! Free Cleaning Available
                </h3>
                <p className="text-sm text-orange-800 mb-3">
                  You've completed {COMPLETED_CLEANINGS} cleanings and earned a free cleaning worth ${baseAmount.toFixed(2)}!
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="apply-free-cleaning"
                    checked={applyFreeCleaning}
                    onCheckedChange={(checked: boolean) => setApplyFreeCleaning(checked)}
                  />
                  <Label
                    htmlFor="apply-free-cleaning"
                    className="text-sm font-semibold text-orange-900 cursor-pointer"
                  >
                    Apply my free cleaning to this booking
                  </Label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-2xl">✨</div>
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 mb-1">
                  Earn a Free Cleaning!
                </h4>
                <p className="text-sm text-orange-800 mb-3">
                  Complete {FREE_CLEANING_THRESHOLD} cleanings and get your next one free. You're {COMPLETED_CLEANINGS} of {FREE_CLEANING_THRESHOLD} there!
                </p>
                <div className="space-y-2">
                  <div className="w-full bg-orange-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                      style={{ width: `${(COMPLETED_CLEANINGS / FREE_CLEANING_THRESHOLD) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-orange-700">
                    {FREE_CLEANING_THRESHOLD - COMPLETED_CLEANINGS} more cleaning{FREE_CLEANING_THRESHOLD - COMPLETED_CLEANINGS === 1 ? '' : 's'} to unlock your reward!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Breakdown */}
        <div className="border-t border-neutral-200 pt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Service Cost</span>
            <span className="text-neutral-900 font-medium">${baseAmount.toFixed(2)}</span>
          </div>
          {discountPercentage > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Frequency Discount ({discountPercentage}%)</span>
              <span className="text-green-600 font-medium">-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          {applyFreeCleaning && qualifiesForFreeCleaning && (
            <div className="flex justify-between text-sm">
              <span className="text-orange-600 font-semibold">🎉 Free Cleaning Reward</span>
              <span className="text-orange-600 font-bold">-${freeCleaningDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-neutral-200">
            <span className="font-semibold text-neutral-900">Total Amount</span>
            <span className="font-bold text-2xl text-secondary-500">${totalAmount.toFixed(2)}</span>
          </div>
          {totalAmount === 0 ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>Free cleaning applied!</strong> No payment required. Your free cleaning will be deducted from your rewards.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Full payment required at booking.</strong> Your card will be charged immediately upon confirmation.
              </p>
            </div>
          )}
        </div>

        {/* Cancellation Policy */}
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <h4 className="font-semibold text-orange-900">Cancellation Policy</h4>
          </div>
          <ul className="text-sm text-orange-800 space-y-1 ml-7">
            <li>• Free cancellation up to 24 hours before service</li>
            <li>• 50% charge for cancellations within 24 hours</li>
            <li>• 100% charge for no-shows</li>
          </ul>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Notification Preferences</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email-notif"
                checked={emailNotif}
                onCheckedChange={(checked: boolean) => setEmailNotif(checked)}
              />
              <label
                htmlFor="email-notif"
                className="text-sm text-neutral-700 cursor-pointer"
              >
                Email notifications (confirmations, reminders)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sms-notif"
                checked={smsNotif}
                onCheckedChange={(checked: boolean) => setSmsNotif(checked)}
              />
              <label
                htmlFor="sms-notif"
                className="text-sm text-neutral-700 cursor-pointer"
              >
                SMS notifications (24h and 2h reminders)
              </label>
            </div>
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
            I agree to the{' '}
            <button className="text-secondary-500 hover:underline">Terms & Conditions</button>,{' '}
            <button className="text-secondary-500 hover:underline">Privacy Policy</button>, and{' '}
            <button className="text-secondary-500 hover:underline">Cancellation Policy</button> *
          </label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-8"
        >
          Back
        </Button>
        <div className="flex gap-3">
          <Button
            onClick={() => handleSubmit('DRAFT')}
            variant="outline"
            disabled={isLoading}
            className="px-6 border-secondary-200 text-secondary-600 hover:bg-secondary-50"
          >
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('BOOKED')}
            disabled={!isValid() || isLoading}
            className="bg-secondary-500 hover:bg-secondary-600 px-8"
          >
            {isLoading ? 'Processing...' : `Complete Booking - $${totalAmount.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}