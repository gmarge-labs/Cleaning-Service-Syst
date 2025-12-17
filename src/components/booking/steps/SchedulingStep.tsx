import { useState } from 'react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { BookingData } from '../BookingFlow';
import { Calendar } from '../../ui/calendar';
import { Clock, Calendar as CalendarIcon, AlertCircle, PawPrint, Check, X, Tag } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

interface SchedulingStepProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack?: () => void;
}

const timeSlots = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];

const petTypes = [
  'Dog',
  'Cat',
];

const frequencies = [
  { id: 'One-time', label: 'One-time', discount: 0 },
  { id: 'Weekly', label: 'Weekly', discount: 15 },
  { id: 'Bi-weekly', label: 'Bi-weekly', discount: 10 },
  { id: 'Monthly', label: 'Monthly', discount: 5 },
];

const SERVICE_PRICES: Record<string, number> = {
  'Standard Cleaning': 89,
  'Deep Cleaning': 159,
  'Move In/Out': 199,
  'Post-Construction': 249,
};

const ROOM_PRICE = 15;

export function SchedulingStep({ data, onUpdate, onNext, onBack }: SchedulingStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(data.date);
  const [selectedTime, setSelectedTime] = useState<string>(data.time || '');
  const [frequency, setFrequency] = useState<string>(data.frequency || 'One-time');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const [instructions, setInstructions] = useState<string>(data.specialInstructions || '');
  const [hasPet, setHasPet] = useState<boolean | null>(data.hasPet || null);
  const [selectedPets, setSelectedPets] = useState<string[]>(data.selectedPets || []);
  const [customPets, setCustomPets] = useState<string[]>(data.customPets || []);
  const [newCustomPet, setNewCustomPet] = useState<string>('');
  const [petPresent, setPetPresent] = useState<boolean | null>(data.petPresent ?? null);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onUpdate({ date });
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onUpdate({ time });
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
    onUpdate({ frequency: value });
  };

  const handleInstructionsChange = (value: string) => {
    setInstructions(value);
    onUpdate({ specialInstructions: value });
  };

  const handleHasPetChange = (value: boolean) => {
    setHasPet(value);
    if (!value) {
      // Clear pet-related data when user selects "No"
      setSelectedPets([]);
      setCustomPets([]);
      setNewCustomPet('');
      setPetPresent(false);
      onUpdate({ hasPet: false, selectedPets: [], customPets: [], petPresent: false });
    } else {
      onUpdate({ hasPet: true });
    }
  };

  const togglePetType = (petType: string) => {
    const newSelectedPets = selectedPets.includes(petType)
      ? selectedPets.filter(p => p !== petType)
      : [...selectedPets, petType];
    setSelectedPets(newSelectedPets);
    onUpdate({ selectedPets: newSelectedPets });
  };

  const addCustomPet = () => {
    if (newCustomPet.trim()) {
      const newCustomPets = [...customPets, newCustomPet.trim()];
      setCustomPets(newCustomPets);
      setNewCustomPet('');
      onUpdate({ customPets: newCustomPets });
    }
  };

  const removeCustomPet = (index: number) => {
    const newCustomPets = customPets.filter((_, i) => i !== index);
    setCustomPets(newCustomPets);
    onUpdate({ customPets: newCustomPets });
  };

  const handlePetPresentChange = (value: boolean) => {
    setPetPresent(value);
    onUpdate({ petPresent: value });
  };

  const hasAnyPetSelected = selectedPets.length > 0 || customPets.length > 0;

  const isValid = () => {
    return selectedDate && selectedTime;
  };

  const calculateTotal = () => {
    const basePrice = data.serviceType ? SERVICE_PRICES[data.serviceType] || 0 : 0;
    const roomCount = (data.bedrooms || 0) + (data.bathrooms || 0) + (data.rooms?.length || 0);
    const roomPrice = roomCount * ROOM_PRICE;
    const addOnsTotal = data.addOns?.reduce((sum, addon) => sum + (addon.price * (addon.quantity || 1)), 0) || 0;
    const subtotal = basePrice + roomPrice + addOnsTotal;
    const discountRate = frequency === 'Weekly' ? 0.15 : frequency === 'Bi-weekly' ? 0.10 : frequency === 'Monthly' ? 0.05 : 0;
    return subtotal * (1 - discountRate);
  };

  const handleSaveDraft = async () => {
    if (!isValid()) {
      toast.error('Please select a date and time first');
      return;
    }

    setIsLoading(true);
    const totalAmount = calculateTotal();

    const bookingPayload = {
      ...data,
      userId: user?.id || null,
      guestName: !user ? (data.name || null) : null,
      guestEmail: !user ? (data.email || null) : null,
      guestPhone: !user ? (data.phone || null) : null,
      totalAmount: totalAmount,
      frequency: frequency,
      status: 'DRAFT',
    };

    try {
      const response = await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || 'Failed to save draft');

      toast.success('Booking saved as draft!');
      onNext(); // Move to payment or confirmation? User said "next to continue to payment", so maybe stay or move? 
      // Usually saving draft might stay or go to dashboard. But user said "next to continue to payment", so I'll just save and maybe stay or go to next.
      // Let's go to next (Payment) so they can see it's saved but can still pay.
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Disable dates in the past and today (no next-day booking)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Schedule Your Cleaning</h2>
          <p className="text-neutral-600">Choose a date and time that works best for you</p>
        </div>

        {/* No Next-Day Alert */}
        <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-900">
            <strong>Note:</strong> Next-day bookings available. Please select a date starting tomorrow or later.
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <Label className="text-base font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-secondary-500" />
            Select Date *
          </Label>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date: Date) => date < tomorrow}
              className="rounded-xl border border-neutral-200 p-3"
            />
          </div>
          {selectedDate && (
            <p className="text-center mt-3 text-sm text-neutral-600">
              Selected: <span className="font-semibold text-secondary-500">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </p>
          )}
        </div>

        {/* Time Selection - Nested, only appears after date is selected */}
        {selectedDate && (
          <div className="ml-6 pl-6 border-l-2 border-secondary-200 space-y-3">
            <div>
              <Label className="text-sm font-semibold text-secondary-700 flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary-500" />
                Select Time Slot *
              </Label>
              <p className="text-xs text-neutral-600 mb-3">Choose your preferred arrival time</p>
            </div>

            {/* Scrollable time slots container - shows 3 slots, scroll for more */}
            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2 border border-neutral-200 rounded-lg p-3 bg-neutral-50">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${selectedTime === time
                    ? 'border-secondary-500 bg-secondary-50 shadow-sm'
                    : 'border-neutral-200 hover:border-secondary-300 bg-white'
                    }`}
                >
                  {/* Radio Button */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedTime === time
                    ? 'border-secondary-500 bg-secondary-500'
                    : 'border-neutral-300'
                    }`}>
                    {selectedTime === time && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  {/* Time Display */}
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm text-neutral-900">{time}</div>
                    <div className="text-xs text-neutral-600">±30 min arrival window</div>
                  </div>

                  {/* Icon */}
                  <Clock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                </button>
              ))}
            </div>

            {/* Scroll hint */}
            <p className="text-xs text-neutral-500 italic text-center">Scroll to view more time slots</p>
          </div>
        )}

        {/* Frequency Selection */}
        {selectedDate && selectedTime && (
          <div className="ml-6 pl-6 border-l-2 border-secondary-200 space-y-4">
            <div>
              <Label className="text-sm font-semibold text-secondary-700 flex items-center gap-2">
                <Tag className="w-5 h-5 text-secondary-500" />
                Select Frequency *
              </Label>
              <p className="text-xs text-neutral-600 mb-3">Save more with regular cleanings</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {frequencies.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFrequencyChange(f.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${frequency === f.id
                      ? 'border-secondary-500 bg-secondary-50 shadow-sm'
                      : 'border-neutral-200 hover:border-secondary-300 bg-white'
                    }`}
                >
                  <div className={`text-sm font-bold ${frequency === f.id ? 'text-secondary-600' : 'text-neutral-900'}`}>
                    {f.label}
                  </div>
                  {f.discount > 0 && (
                    <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700 text-[10px]">
                      {f.discount}% OFF
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pet Information - Nested, only appears after time is selected */}
        {selectedDate && selectedTime && (
          <div className="ml-6 pl-6 border-l-2 border-secondary-200 space-y-4">
            <div>
              <Label className="text-sm font-semibold text-secondary-700 flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-secondary-500" />
                Pet Information
              </Label>
              <p className="text-xs text-neutral-600 mb-3">Let us know if you have any pets</p>
            </div>

            {/* Do you have pets? */}
            <div className="space-y-2">
              {hasPet === null || hasPet === undefined ? (
                // Show both options when no selection
                <>
                  <button
                    type="button"
                    onClick={() => handleHasPetChange(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-neutral-200 hover:border-secondary-300 bg-white transition-all"
                  >
                    {/* Radio Button */}
                    <div className="w-5 h-5 rounded-full border-2 border-neutral-300 flex items-center justify-center flex-shrink-0 transition-all">
                    </div>

                    <div className="text-xl flex-shrink-0">🐾</div>
                    <div className="flex-1 text-left text-sm font-medium text-neutral-900">Yes, I have pets</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHasPetChange(false)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-neutral-200 hover:border-secondary-300 bg-white transition-all"
                  >
                    {/* Radio Button */}
                    <div className="w-5 h-5 rounded-full border-2 border-neutral-300 flex items-center justify-center flex-shrink-0 transition-all">
                    </div>

                    <div className="text-xl flex-shrink-0">🚫</div>
                    <div className="flex-1 text-left text-sm font-medium text-neutral-900">No pets</div>
                  </button>
                </>
              ) : hasPet === true ? (
                // Show only "Yes" when selected
                <button
                  type="button"
                  onClick={() => setHasPet(null)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-secondary-500 bg-secondary-50 shadow-sm transition-all"
                >
                  {/* Radio Button */}
                  <div className="w-5 h-5 rounded-full border-2 border-secondary-500 bg-secondary-500 flex items-center justify-center flex-shrink-0 transition-all">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  <div className="text-xl flex-shrink-0">🐾</div>
                  <div className="flex-1 text-left text-sm font-medium text-neutral-900">Yes, I have pets</div>
                  <Check className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                </button>
              ) : (
                // Show only "No" when selected
                <button
                  type="button"
                  onClick={() => setHasPet(null)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-secondary-500 bg-secondary-50 shadow-sm transition-all"
                >
                  {/* Radio Button */}
                  <div className="w-5 h-5 rounded-full border-2 border-secondary-500 bg-secondary-500 flex items-center justify-center flex-shrink-0 transition-all">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  <div className="text-xl flex-shrink-0">🚫</div>
                  <div className="flex-1 text-left text-sm font-medium text-neutral-900">No pets</div>
                  <Check className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                </button>
              )}
            </div>

            {/* Pet Type Selection - Further nested, only show if user has pets */}
            {hasPet && (
              <div className="ml-10 pl-4 border-l-2 border-secondary-100 space-y-4 pt-2">
                <div>
                  <Label className="text-xs font-medium text-neutral-700 mb-2 block">
                    What type of pets do you have? *
                  </Label>
                  <div className="space-y-2">
                    {petTypes.filter(type => type !== 'Other').map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => togglePetType(type)}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all ${selectedPets.includes(type)
                          ? 'border-secondary-500 bg-secondary-50 shadow-sm'
                          : 'border-neutral-200 hover:border-secondary-300 bg-white'
                          }`}
                      >
                        {/* Checkbox */}
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedPets.includes(type)
                          ? 'border-secondary-500 bg-secondary-500'
                          : 'border-neutral-300'
                          }`}>
                          {selectedPets.includes(type) && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <div className="text-xs font-medium text-neutral-900">{type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom pet types */}
                <div>
                  <Label className="text-xs font-medium text-neutral-700 mb-2 block">
                    Other pet type (optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newCustomPet}
                      onChange={(e) => setNewCustomPet(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomPet();
                        }
                      }}
                      placeholder="Enter other pet type"
                      className="bg-white text-sm h-9"
                    />
                    <Button
                      type="button"
                      onClick={addCustomPet}
                      disabled={!newCustomPet.trim()}
                      className="bg-secondary-500 hover:bg-secondary-600 px-4 h-9 text-xs"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Display added custom pets */}
                  {customPets.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {customPets.map((pet, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white border-2 border-secondary-500 rounded-full text-xs text-secondary-700"
                        >
                          <span>{pet}</span>
                          <button
                            type="button"
                            onClick={() => removeCustomPet(index)}
                            className="hover:bg-secondary-100 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Will pets be present during cleaning? */}
                {hasAnyPetSelected && (
                  <div>
                    <Label className="text-xs font-medium text-neutral-700 mb-2 block">
                      Will your pets be present during cleaning?
                    </Label>
                    <div className="space-y-2">
                      {petPresent === null || petPresent === undefined ? (
                        // Show both options when no selection
                        <>
                          <button
                            type="button"
                            onClick={() => handlePetPresentChange(true)}
                            className="w-full flex items-center gap-2 p-2.5 rounded-lg border-2 border-neutral-200 hover:border-secondary-300 bg-white transition-all"
                          >
                            {/* Radio Button */}
                            <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex items-center justify-center flex-shrink-0 transition-all">
                            </div>
                            <div className="text-xs font-medium text-neutral-900">Yes, pets will be home</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePetPresentChange(false)}
                            className="w-full flex items-center gap-2 p-2.5 rounded-lg border-2 border-neutral-200 hover:border-secondary-300 bg-white transition-all"
                          >
                            {/* Radio Button */}
                            <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex items-center justify-center flex-shrink-0 transition-all">
                            </div>
                            <div className="text-xs font-medium text-neutral-900">No, pets will be away</div>
                          </button>
                        </>
                      ) : petPresent === true ? (
                        // Show only "Yes" when selected
                        <button
                          type="button"
                          onClick={() => setPetPresent(null)}
                          className="w-full flex items-center gap-2 p-2.5 rounded-lg border-2 border-secondary-500 bg-secondary-50 shadow-sm transition-all"
                        >
                          {/* Radio Button */}
                          <div className="w-4 h-4 rounded-full border-2 border-secondary-500 bg-secondary-500 flex items-center justify-center flex-shrink-0 transition-all">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                          <div className="text-xs font-medium text-neutral-900">Yes, pets will be home</div>
                          <Check className="w-4 h-4 text-secondary-500 flex-shrink-0 ml-auto" />
                        </button>
                      ) : (
                        // Show only "No" when selected
                        <button
                          type="button"
                          onClick={() => setPetPresent(null)}
                          className="w-full flex items-center gap-2 p-2.5 rounded-lg border-2 border-secondary-500 bg-secondary-50 shadow-sm transition-all"
                        >
                          {/* Radio Button */}
                          <div className="w-4 h-4 rounded-full border-2 border-secondary-500 bg-secondary-500 flex items-center justify-center flex-shrink-0 transition-all">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                          <div className="text-xs font-medium text-neutral-900">No, pets will be away</div>
                          <Check className="w-4 h-4 text-secondary-500 flex-shrink-0 ml-auto" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Special Instructions - Nested, only appears after pet information is answered */}
        {selectedDate && selectedTime && (hasPet === true || hasPet === false) && (
          <div className="ml-6 pl-6 border-l-2 border-secondary-200 space-y-3">
            <div>
              <Label htmlFor="instructions" className="text-sm font-semibold text-secondary-700 block">
                Special Instructions (Optional)
              </Label>
              <p className="text-xs text-neutral-600 mb-3">
                Let us know about parking, entry codes, or any specific areas that need attention
              </p>
            </div>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => handleInstructionsChange(e.target.value)}
              placeholder="Enter any special requests, access codes, areas needing extra attention, etc."
              rows={4}
              className="resize-none text-sm"
            />
          </div>
        )}

        {/* Summary */}
        {isValid() && (
          <div className="p-4 bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-neutral-900">Booking Summary:</p>
            <p className="text-sm text-neutral-700">
              📅 {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-sm text-neutral-700">
              ⏰ {selectedTime} (±30 min arrival window)
            </p>
            {hasPet && hasAnyPetSelected && (
              <p className="text-sm text-neutral-700">
                🐾 {[...selectedPets, ...customPets].join(', ')} - {petPresent ? 'Will be home during cleaning' : 'Will be away during cleaning'}
              </p>
            )}
          </div>
        )}
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
            onClick={handleSaveDraft}
            variant="outline"
            disabled={!isValid() || isLoading}
            className="px-6 border-secondary-200 text-secondary-600 hover:bg-secondary-50"
          >
            {isLoading ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button
            onClick={onNext}
            disabled={!isValid() || isLoading}
            className="bg-secondary-500 hover:bg-secondary-600 px-8"
          >
            Continue to Payment
          </Button>
        </div>
      </div>
    </div>
  );
}