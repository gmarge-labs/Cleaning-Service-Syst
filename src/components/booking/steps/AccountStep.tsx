import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { BookingData } from '../BookingFlow';
import { UserPlus, LogIn, UserX, Eye, EyeOff, Check, X } from 'lucide-react';

interface AccountStepProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export function AccountStep({ data, onUpdate, onNext }: AccountStepProps) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
  });

  const handleContinue = () => {
    onUpdate({
      accountType: 'guest',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });
    onNext();
  };

  const isValid = () => {
    return formData.email && formData.phone;
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">Let's Get Started</h2>
        <p className="text-neutral-600">Enter your details to continue with your booking</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name (Optional)</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            className="mt-1.5"
          />
          <p className="text-sm text-neutral-500 mt-1.5">
            We'll send your booking confirmation here
          </p>
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
            className="mt-1.5"
          />
          <p className="text-sm text-neutral-500 mt-1.5">
            For booking updates and reminders
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        disabled={!isValid()}
        className="w-full bg-secondary-500 hover:bg-secondary-600 py-6 text-lg"
      >
        Continue to Service Selection
      </Button>
    </div>
  );
}