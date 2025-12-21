import { useState } from 'react';
import { Button } from '../../ui/button';
import { BookingData, SystemSettings } from '../BookingFlow';
import { Check, Plus, Minus } from 'lucide-react';

interface AddOnsStepProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
  settings?: SystemSettings | null;
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  hasQuantity?: boolean;
  unit?: string;
}

const defaultAddOnsData: AddOn[] = [
  {
    id: 'windows',
    name: 'Inside Windows',
    description: 'Professional window cleaning, inside only',
    price: 25,
    icon: '🪟',
    hasQuantity: true,
    unit: 'window',
  },
  {
    id: 'pet-hair',
    name: 'Pet Hair Removal',
    description: 'Extra attention to pet hair and dander',
    price: 25,
    icon: '🐾',
  },
  {
    id: 'organization',
    name: 'Organization',
    description: 'Organize closets, cabinets, and spaces',
    price: 45,
    icon: '📦',
    hasQuantity: true,
    unit: 'hour',
  },
];

export function AddOnsStep({ data, onUpdate, onNext, onBack, settings }: AddOnsStepProps) {
  // Use prices from settings if available
  const addOnsData = defaultAddOnsData.map(addon => ({
    ...addon,
    price: settings?.addonPrices?.[addon.name] ?? addon.price
  }));

  const [selectedAddOns, setSelectedAddOns] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>(
    data.addOns || []
  );

  const toggleAddOn = (addOn: AddOn) => {
    const existing = selectedAddOns.find(a => a.id === addOn.id);
    let newAddOns;
    
    if (existing) {
      newAddOns = selectedAddOns.filter(a => a.id !== addOn.id);
    } else {
      newAddOns = [...selectedAddOns, { 
        id: addOn.id, 
        name: addOn.name, 
        price: addOn.price, 
        quantity: 1 
      }];
    }
    
    setSelectedAddOns(newAddOns);
    onUpdate({ addOns: newAddOns });
  };

  const updateQuantity = (addOnId: string, delta: number) => {
    const newAddOns = selectedAddOns.map(a => {
      if (a.id === addOnId) {
        const newQuantity = Math.max(1, Math.min(10, a.quantity + delta));
        return { ...a, quantity: newQuantity };
      }
      return a;
    });
    
    setSelectedAddOns(newAddOns);
    onUpdate({ addOns: newAddOns });
  };

  const isSelected = (addOnId: string) => {
    return selectedAddOns.some(a => a.id === addOnId);
  };

  const getQuantity = (addOnId: string) => {
    return selectedAddOns.find(a => a.id === addOnId)?.quantity || 1;
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Enhance Your Service</h2>
          <p className="text-neutral-600">Add optional services to customize your cleaning experience</p>
        </div>

        {/* Add-ons List */}
        <div className="space-y-3">
          {addOnsData.map((addOn) => {
            const selected = isSelected(addOn.id);
            const quantity = getQuantity(addOn.id);
            
            return (
              <div
                key={addOn.id}
                className={`relative rounded-xl border-2 transition-all overflow-hidden ${
                  selected
                    ? 'border-secondary-500 bg-secondary-50 shadow-md'
                    : 'border-neutral-200 hover:border-secondary-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleAddOn(addOn)}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      selected
                        ? 'bg-secondary-500 border-secondary-500'
                        : 'bg-white border-neutral-300 hover:border-secondary-400'
                    }`}
                  >
                    {selected && <Check className="w-4 h-4 text-white" />}
                  </button>

                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0">
                    {addOn.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900">{addOn.name}</h3>
                    <p className="text-sm text-neutral-600">{addOn.description}</p>
                  </div>

                  {/* Price and Quantity */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {selected && addOn.hasQuantity && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(addOn.id, -1);
                          }}
                          className="w-8 h-8 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4 text-neutral-700" />
                        </button>
                        <span className="w-8 text-center font-semibold text-neutral-900">{quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(addOn.id, 1);
                          }}
                          className="w-8 h-8 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4 text-neutral-700" />
                        </button>
                      </div>
                    )}
                    
                    <div className="text-right">
                      <div className="font-bold text-neutral-900">${addOn.price}</div>
                      {addOn.hasQuantity && (
                        <div className="text-xs text-neutral-500">/ {addOn.unit}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {selectedAddOns.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg">
            <p className="text-sm text-neutral-900 mb-2">
              <strong>Selected add-ons:</strong>
            </p>
            <ul className="text-sm text-neutral-700 space-y-1">
              {selectedAddOns.map((addon) => (
                <li key={addon.id}>
                  • {addon.name}
                  {addon.quantity > 1 && ` (×${addon.quantity})`}
                  {' - '}
                  <span className="font-semibold">${(addon.price * addon.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-neutral-50 rounded-lg">
          <p className="text-sm text-neutral-600">
            💡 <strong>Tip:</strong> Add-ons can be customized during your booking. You can always adjust these later.
          </p>
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
        <Button
          onClick={handleContinue}
          className="bg-secondary-500 hover:bg-secondary-600 px-8"
        >
          {selectedAddOns.length > 0 ? 'Continue to Scheduling' : 'Skip Add-ons'}
        </Button>
      </div>
    </div>
  );
}