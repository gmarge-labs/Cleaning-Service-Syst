import { useState, useEffect } from 'react';
import { CheckCircle, Download, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { BookingData, SystemSettings } from '../booking/BookingFlow';
import { ServiceStep } from '../booking/steps/ServiceStep';
import { PropertyDetailsStep } from '../booking/steps/PropertyDetailsStep';
import { AddOnsStep } from '../booking/steps/AddOnsStep';
import { SchedulingStep } from '../booking/steps/SchedulingStep';
import { PricingSidebar } from '../booking/PricingSidebar';
import { ProgressIndicator } from '../booking/ProgressIndicator';
import { toast } from 'sonner';

interface AdminBookingData extends BookingData {
  // Additional admin-specific fields
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentNotes?: string;
  depositPaid?: boolean;
}

interface ManualBookingFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

const STEPS = [
  'Customer Info',
  'Service',
  'Details',
  'Add-ons',
  'Schedule',
  'Payment',
  'Confirmation',
];

const STEPS_FOR_PROGRESS = [
  'Customer Info',
  'Service',
  'Details',
  'Add-ons',
  'Schedule',
  'Payment',
];

// Customer Info Step Component
function CustomerInfoStep({ 
  data, 
  onUpdate, 
  onNext, 
  onBack 
}: { 
  data: AdminBookingData; 
  onUpdate: (data: Partial<AdminBookingData>) => void; 
  onNext: () => void;
  onBack?: () => void;
}) {
  const [customerName, setCustomerName] = useState(data.customerName || '');
  const [customerEmail, setCustomerEmail] = useState(data.customerEmail || '');
  const [customerPhone, setCustomerPhone] = useState(data.customerPhone || '');

  const isValid = customerName && customerEmail && customerPhone;

  const handleNext = () => {
    onUpdate({
      customerName,
      customerEmail,
      customerPhone,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Customer Information</h2>
          <p className="text-neutral-600">Enter the customer's contact details</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="customer-name">Full Name *</Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="John Doe"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="customer-email">Email Address *</Label>
            <Input
              id="customer-email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="john.doe@example.com"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="customer-phone">Phone Number *</Label>
            <Input
              id="customer-phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="bg-secondary-500 hover:bg-secondary-600 px-8 ml-auto"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// Payment Step Component for Admin
function AdminPaymentStep({ 
  data, 
  onUpdate, 
  onNext, 
  onBack 
}: { 
  data: AdminBookingData; 
  onUpdate: (data: Partial<AdminBookingData>) => void; 
  onNext: () => void;
  onBack: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState(data.paymentMethod || 'cash');
  const [depositPaid, setDepositPaid] = useState(data.depositPaid || false);
  const [paymentNotes, setPaymentNotes] = useState(data.paymentNotes || '');

  const handleNext = () => {
    onUpdate({
      paymentMethod,
      depositPaid,
      paymentNotes,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Payment Details</h2>
          <p className="text-neutral-600">Configure payment method and status</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="payment-method">Payment Method *</Label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1.5"
            >
              <option value="cash">Cash</option>
              <option value="credit-card">Credit Card</option>
              <option value="debit-card">Debit Card</option>
              <option value="check">Check</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="invoice">Send Invoice</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 p-4 bg-neutral-50 rounded-lg">
            <input
              type="checkbox"
              id="deposit-paid"
              checked={depositPaid}
              onChange={(e) => setDepositPaid(e.target.checked)}
              className="w-4 h-4 text-secondary-500 border-neutral-300 rounded focus:ring-secondary-500"
            />
            <label htmlFor="deposit-paid" className="text-sm text-neutral-700 cursor-pointer">
              20% deposit has been collected
            </label>
          </div>

          <div>
            <Label htmlFor="payment-notes">Payment Notes (Optional)</Label>
            <textarea
              id="payment-notes"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Add any payment-related notes..."
              rows={3}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1.5"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <Button onClick={onBack} variant="outline" className="px-8">
          Back
        </Button>
        <Button
          onClick={handleNext}
          className="bg-secondary-500 hover:bg-secondary-600 px-8"
        >
          Generate Invoice
        </Button>
      </div>
    </div>
  );
}

// Invoice Step Component
function InvoiceStep({ 
  data, 
  onComplete,
  onBack,
  settings
}: { 
  data: AdminBookingData; 
  onComplete: () => void;
  onBack: () => void;
  settings: SystemSettings | null;
}) {
  const [emailSent, setEmailSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Calculate pricing
  const getServicePrice = (serviceType?: string) => {
    if (settings?.servicePrices && serviceType) {
      return settings.servicePrices[serviceType] || 0;
    }
    const prices: Record<string, number> = {
      'Standard Cleaning': 89,
      'Deep Cleaning': 159,
      'Move In/Out': 199,
      'Post-Construction': 249,
    };
    return prices[serviceType || ''] || 0;
  };

  const roomPrices = settings?.roomPrices || {};
  const bedroomPrice = roomPrices['Bedroom'] ?? 15;
  const bathroomPrice = roomPrices['Bathroom'] ?? 15;
  const toiletPrice = roomPrices['Toilet'] ?? 10;

  let roomPrice = (data.bedrooms || 0) * bedroomPrice;
  roomPrice += (data.bathrooms || 0) * bathroomPrice;
  roomPrice += (data.toilets || 0) * toiletPrice;

  if (data.rooms) {
    data.rooms.forEach(roomId => {
      const quantity = data.roomQuantities?.[roomId] || 1;
      const settingsKey = roomId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const price = roomPrices[settingsKey] ?? 15;
      roomPrice += price * quantity;
    });
  }

  const roomCount = (data.bedrooms || 0) + (data.bathrooms || 0) + (data.toilets || 0) + 
    (data.rooms?.reduce((acc, r) => acc + (data.roomQuantities?.[r] || 1), 0) || 0);
  
  const servicePrice = getServicePrice(data.serviceType);
  const addOnsTotal = data.addOns?.reduce((sum, addon) => {
    const price = settings?.addonPrices?.[addon.name] ?? addon.price;
    return sum + (price * (addon.quantity || 1));
  }, 0) || 0;

  // Add kitchen add-ons if any
  let kitchenAddOnsTotal = 0;
  if (data.kitchenAddOns) {
    Object.values(data.kitchenAddOns).forEach((addons: any) => {
      addons.forEach((addonId: string) => {
        const settingsKey = addonId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const price = settings?.addonPrices?.[settingsKey] ?? 20;
        kitchenAddOnsTotal += price;
      });
    });
  }

  let laundryTotal = 0;
  if (data.laundryRoomDetails) {
    Object.values(data.laundryRoomDetails).forEach((details: any) => {
      const price = settings?.addonPrices?.['Laundry Service'] ?? 30;
      laundryTotal += price * (details.baskets || 1);
    });
  }

  const subtotal = servicePrice + roomPrice + addOnsTotal + kitchenAddOnsTotal + laundryTotal;
  
  // Calculate discount
  const discountRate = data.frequency === 'Weekly' ? (settings?.pricing?.weeklyDiscount || 10) / 100 :
                       data.frequency === 'Bi-weekly' ? (settings?.pricing?.biWeeklyDiscount || 5) / 100 :
                       data.frequency === 'Monthly' ? (settings?.pricing?.monthlyDiscount || 15) / 100 : 0;
  
  const discount = subtotal * discountRate;
  
  const total = subtotal - discount;
  const deposit = data.depositPaid ? total * ((settings?.pricing?.depositPercentage || 20) / 100) : 0;
  const balanceDue = total - deposit;

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleSendEmail = async () => {
    if (!data.id) {
      toast.error('Please complete the booking first to generate an ID');
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch('/api/bookings/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: data.id,
          email: data.customerEmail,
          total,
          balanceDue
        })
      });
      if (response.ok) {
        setEmailSent(true);
        toast.success('Invoice sent successfully!');
      } else {
        toast.error('Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Error sending invoice');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPDF = () => {
    // Simulate PDF download
    alert('Invoice PDF would be downloaded in a real implementation');
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {emailSent && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-green-900">Invoice sent successfully!</div>
            <div className="text-sm text-green-700">The invoice has been emailed to {data.customerEmail}</div>
          </div>
        </div>
      )}

      {/* Invoice */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">INVOICE</h1>
              <p className="text-white/90">SparkleVille Services</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{invoiceNumber}</div>
              <div className="text-white/90 text-sm mt-1">{invoiceDate}</div>
            </div>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-8 space-y-8">
          {/* Bill To / Service Date */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-sm font-semibold text-neutral-500 uppercase mb-2">Bill To</div>
              <div className="space-y-1">
                <div className="font-semibold text-neutral-900">{data.customerName}</div>
                <div className="text-neutral-600">{data.customerEmail}</div>
                <div className="text-neutral-600">{data.customerPhone}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-500 uppercase mb-2">Service Details</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Service Date:</span>
                  <span className="font-medium text-neutral-900">
                    {data.date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Time:</span>
                  <span className="font-medium text-neutral-900">{data.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Frequency:</span>
                  <span className="font-medium text-neutral-900">{data.frequency || 'One-time'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="text-sm font-semibold text-neutral-500 uppercase mb-4">Items</div>
            <table className="w-full">
              <thead className="border-b border-neutral-200">
                <tr>
                  <th className="text-left py-3 text-sm font-semibold text-neutral-700">Description</th>
                  <th className="text-right py-3 text-sm font-semibold text-neutral-700">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold text-neutral-700">Price</th>
                  <th className="text-right py-3 text-sm font-semibold text-neutral-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="py-3">
                    <div className="font-medium text-neutral-900">{data.serviceType}</div>
                    <div className="text-sm text-neutral-600">Base service</div>
                  </td>
                  <td className="text-right text-neutral-900">1</td>
                  <td className="text-right text-neutral-900">${servicePrice.toFixed(2)}</td>
                  <td className="text-right font-medium text-neutral-900">${servicePrice.toFixed(2)}</td>
                </tr>

                {/* Bedrooms */}
                {(data.bedrooms || 0) > 0 && (
                  <tr>
                    <td className="py-3">
                      <div className="font-medium text-neutral-900">Bedrooms</div>
                      <div className="text-sm text-neutral-600">Standard cleaning</div>
                    </td>
                    <td className="text-right text-neutral-900">{data.bedrooms}</td>
                    <td className="text-right text-neutral-900">${bedroomPrice.toFixed(2)}</td>
                    <td className="text-right font-medium text-neutral-900">${((data.bedrooms || 0) * bedroomPrice).toFixed(2)}</td>
                  </tr>
                )}

                {/* Bathrooms */}
                {(data.bathrooms || 0) > 0 && (
                  <tr>
                    <td className="py-3">
                      <div className="font-medium text-neutral-900">Bathrooms</div>
                      <div className="text-sm text-neutral-600">Standard cleaning</div>
                    </td>
                    <td className="text-right text-neutral-900">{data.bathrooms}</td>
                    <td className="text-right text-neutral-900">${bathroomPrice.toFixed(2)}</td>
                    <td className="text-right font-medium text-neutral-900">${((data.bathrooms || 0) * bathroomPrice).toFixed(2)}</td>
                  </tr>
                )}

                {/* Toilets */}
                {(data.toilets || 0) > 0 && (
                  <tr>
                    <td className="py-3">
                      <div className="font-medium text-neutral-900">Toilets</div>
                      <div className="text-sm text-neutral-600">Standard cleaning</div>
                    </td>
                    <td className="text-right text-neutral-900">{data.toilets}</td>
                    <td className="text-right text-neutral-900">${toiletPrice.toFixed(2)}</td>
                    <td className="text-right font-medium text-neutral-900">${((data.toilets || 0) * toiletPrice).toFixed(2)}</td>
                  </tr>
                )}

                {/* Additional Rooms */}
                {data.rooms && data.rooms.map(roomId => {
                  const quantity = data.roomQuantities?.[roomId] || 1;
                  const settingsKey = roomId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                  const price = roomPrices[settingsKey] ?? 15;
                  return (
                    <tr key={roomId}>
                      <td className="py-3">
                        <div className="font-medium text-neutral-900">{settingsKey}</div>
                        <div className="text-sm text-neutral-600">Additional room</div>
                      </td>
                      <td className="text-right text-neutral-900">{quantity}</td>
                      <td className="text-right text-neutral-900">${price.toFixed(2)}</td>
                      <td className="text-right font-medium text-neutral-900">${(price * quantity).toFixed(2)}</td>
                    </tr>
                  );
                })}

                {/* Kitchen Add-ons */}
                {data.kitchenAddOns && Object.entries(data.kitchenAddOns).map(([kitchenIndex, addons]: [string, any]) => (
                  addons.map((addonId: string) => {
                    const settingsKey = addonId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    const price = settings?.addonPrices?.[settingsKey] ?? 20;
                    return (
                      <tr key={`${kitchenIndex}-${addonId}`}>
                        <td className="py-3">
                          <div className="font-medium text-neutral-900">{settingsKey}</div>
                          <div className="text-sm text-neutral-600">Kitchen #{parseInt(kitchenIndex) + 1} Add-on</div>
                        </td>
                        <td className="text-right text-neutral-900">1</td>
                        <td className="text-right text-neutral-900">${price.toFixed(2)}</td>
                        <td className="text-right font-medium text-neutral-900">${price.toFixed(2)}</td>
                      </tr>
                    );
                  })
                ))}

                {/* Laundry Details */}
                {data.laundryRoomDetails && Object.entries(data.laundryRoomDetails).map(([laundryIndex, details]: [string, any]) => {
                  const price = settings?.addonPrices?.['Laundry Service'] ?? 30;
                  return (
                    <tr key={`laundry-${laundryIndex}`}>
                      <td className="py-3">
                        <div className="font-medium text-neutral-900">Laundry Service</div>
                        <div className="text-sm text-neutral-600">Laundry Room #{parseInt(laundryIndex) + 1} ({details.rounds} rounds)</div>
                      </td>
                      <td className="text-right text-neutral-900">{details.baskets}</td>
                      <td className="text-right text-neutral-900">${price.toFixed(2)}</td>
                      <td className="text-right font-medium text-neutral-900">${(price * details.baskets).toFixed(2)}</td>
                    </tr>
                  );
                })}

                {/* Standard Add-ons */}
                {data.addOns && data.addOns.length > 0 && data.addOns.map((addon) => (
                  <tr key={addon.id}>
                    <td className="py-3">
                      <div className="font-medium text-neutral-900">{addon.name}</div>
                      <div className="text-sm text-neutral-600">Add-on Service</div>
                    </td>
                    <td className="text-right text-neutral-900">{addon.quantity || 1}</td>
                    <td className="text-right text-neutral-900">${(settings?.addonPrices?.[addon.name] ?? addon.price).toFixed(2)}</td>
                    <td className="text-right font-medium text-neutral-900">
                      ${((settings?.addonPrices?.[addon.name] ?? addon.price) * (addon.quantity || 1)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-neutral-200 pt-6">
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({data.frequency})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-neutral-900 text-lg pt-2 border-t border-neutral-200">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {data.depositPaid && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Deposit Paid (20%)</span>
                    <span>-${deposit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-secondary-500 text-xl pt-2 border-t border-neutral-200">
                    <span>Balance Due</span>
                    <span>${balanceDue.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-neutral-700 mb-2">Payment Information</div>
            <div className="text-sm text-neutral-600 space-y-2">
              <div>Payment Method: <span className="font-medium text-neutral-900">
                {data.paymentMethod?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span></div>
              <div>Status: <span className={`font-medium ${data.depositPaid ? 'text-green-600' : 'text-orange-600'}`}>
                {data.depositPaid ? 'Deposit Paid' : 'Payment Pending'}
              </span></div>
              {data.paymentNotes && (
                <div>Notes: <span className="font-medium text-neutral-900">{data.paymentNotes}</span></div>
              )}
              <div className="pt-2 border-t border-neutral-200">
                <div className="font-medium text-neutral-700">Pay Online:</div>
                <div>Click here to complete your payment:{' '}
                  <button className="inline-flex items-center px-3 py-1 bg-secondary-500 hover:bg-secondary-600 text-white rounded-md transition-colors">
                    Pay Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="border-t border-neutral-200 pt-6">
            <div className="text-sm font-semibold text-neutral-700 mb-2">Terms & Conditions</div>
            <div className="text-xs text-neutral-600 space-y-1">
              <p>• Payment is due upon completion of service unless otherwise arranged</p>
              <p>• Free cancellation up to 24 hours before scheduled service</p>
              <p>• 100% satisfaction guaranteed or we'll make it right</p>
              <p>• For questions about this invoice, please contact us at billing@sparkleville.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-8"
        >
          Back
        </Button>
        <div className="flex gap-4 flex-1">
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={isSending || emailSent}
            className="flex-1 bg-secondary-500 hover:bg-secondary-600 gap-2"
          >
            <Mail className="w-4 h-4" />
            {isSending ? 'Sending...' : emailSent ? 'Email Sent' : 'Email to Customer'}
          </Button>
        </div>
        <Button
          onClick={onComplete}
          className="px-8 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete Booking
        </Button>
      </div>
    </div>
  );
}

export function ManualBookingFlow({ onComplete, onCancel }: ManualBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState<AdminBookingData>({});
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const updateBookingData = (data: Partial<AdminBookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = async () => {
    if (currentStep === STEPS.indexOf('Payment')) {
      // Save to database before showing invoice
      setIsSaving(true);
      try {
        // Calculate total amount based on settings
        const getServicePrice = (serviceType?: string) => {
          if (settings?.servicePrices && serviceType) {
            return settings.servicePrices[serviceType] || 0;
          }
          return 0;
        };
        
        const roomPrices = settings?.roomPrices || {};
        const bedroomPrice = roomPrices['Bedroom'] ?? 15;
        const bathroomPrice = roomPrices['Bathroom'] ?? 15;
        const toiletPrice = roomPrices['Toilet'] ?? 10;

        let roomPrice = (bookingData.bedrooms || 0) * bedroomPrice;
        roomPrice += (bookingData.bathrooms || 0) * bathroomPrice;
        roomPrice += (bookingData.toilets || 0) * toiletPrice;

        if (bookingData.rooms) {
          bookingData.rooms.forEach(roomId => {
            const quantity = bookingData.roomQuantities?.[roomId] || 1;
            const settingsKey = roomId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            const price = roomPrices[settingsKey] ?? 15;
            roomPrice += price * quantity;
          });
        }

        const servicePrice = getServicePrice(bookingData.serviceType);
        const addOnsTotal = bookingData.addOns?.reduce((sum, addon) => {
          const price = settings?.addonPrices?.[addon.name] ?? addon.price;
          return sum + (price * (addon.quantity || 1));
        }, 0) || 0;

        let kitchenAddOnsTotal = 0;
        if (bookingData.kitchenAddOns) {
          Object.values(bookingData.kitchenAddOns).forEach((addons: any) => {
            addons.forEach((addonId: string) => {
              const settingsKey = addonId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              const price = settings?.addonPrices?.[settingsKey] ?? 20;
              kitchenAddOnsTotal += price;
            });
          });
        }

        let laundryTotal = 0;
        if (bookingData.laundryRoomDetails) {
          Object.values(bookingData.laundryRoomDetails).forEach((details: any) => {
            const price = settings?.addonPrices?.['Laundry Service'] ?? 30;
            laundryTotal += price * (details.baskets || 1);
          });
        }

        const subtotal = servicePrice + roomPrice + addOnsTotal + kitchenAddOnsTotal + laundryTotal;
        const discountRate = bookingData.frequency === 'Weekly' ? (settings?.pricing?.weeklyDiscount || 10) / 100 :
                             bookingData.frequency === 'Bi-weekly' ? (settings?.pricing?.biWeeklyDiscount || 5) / 100 :
                             bookingData.frequency === 'Monthly' ? (settings?.pricing?.monthlyDiscount || 15) / 100 : 0;
        const total = subtotal * (1 - discountRate);

        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...bookingData,
            guestName: bookingData.customerName,
            guestEmail: bookingData.customerEmail,
            guestPhone: bookingData.customerPhone,
            totalAmount: total,
            status: 'BOOKED'
          })
        });

        if (response.ok) {
          const result = await response.json();
          updateBookingData({ id: result.booking.id, totalAmount: total });
          setCurrentStep(currentStep + 1);
        } else {
          toast.error('Failed to save booking');
        }
      } catch (error) {
        console.error('Error saving booking:', error);
        toast.error('Error saving booking');
      } finally {
        setIsSaving(false);
      }
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'Customer Info':
        return <CustomerInfoStep data={bookingData} onUpdate={updateBookingData} onNext={nextStep} />;
      case 'Service':
        return <ServiceStep data={bookingData} onUpdate={updateBookingData} onNext={nextStep} onBack={prevStep} settings={settings} />;
      case 'Details':
        return <PropertyDetailsStep data={bookingData} onUpdate={updateBookingData} onNext={nextStep} onBack={prevStep} />;
      case 'Add-ons':
        return <AddOnsStep data={bookingData} onUpdate={updateBookingData} onNext={nextStep} onBack={prevStep} settings={settings} />;
      case 'Schedule':
        return <SchedulingStep data={bookingData} onUpdate={updateBookingData} onNext={nextStep} onBack={prevStep} />;
      case 'Payment':
        return <AdminPaymentStep data={bookingData} onUpdate={updateBookingData} onNext={nextStep} onBack={prevStep} />;
      case 'Confirmation':
        return <InvoiceStep data={bookingData} onComplete={onComplete} onBack={prevStep} settings={settings} />;
      default:
        return null;
    }
  };

  const totalSteps = STEPS_FOR_PROGRESS.length;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header - Same style as customer booking flow */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-xl text-neutral-900">Create Manual Booking</h1>
              {currentStep < totalSteps && (
                <p className="text-sm text-neutral-600">Step {currentStep + 1} of {totalSteps}</p>
              )}
            </div>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Bookings</span>
            </button>
          </div>
        </div>
        
        {currentStep < totalSteps && (
          <ProgressIndicator currentStep={currentStep} steps={STEPS_FOR_PROGRESS} />
        )}
      </div>

      {/* Main Content - Same layout as customer booking flow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step Content */}
          <div className={currentStep > 0 && currentStep < STEPS.length - 1 ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {renderStep()}
          </div>

          {/* Pricing Sidebar - Show after first step and before confirmation */}
          {currentStep > 0 && currentStep < STEPS.length - 1 && (
            <div className="lg:col-span-1">
              <PricingSidebar bookingData={bookingData} settings={settings} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}