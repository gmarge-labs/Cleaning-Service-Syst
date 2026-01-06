import { useState } from 'react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { BookingData } from '../BookingFlow';
import { Home, Bed, Bath, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface PropertyDetailsStepProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const propertyTypes = [
  { value: 'Apartment', label: 'Apartment', icon: '🏢' },
  { value: 'House', label: 'House', icon: '🏠' },
  { value: 'Condo', label: 'Condo', icon: '🏘️' },
  { value: 'Office', label: 'Office', icon: '🏢' },
];

const roomOptions = [
  { id: 'kitchen', label: 'Kitchen', icon: '👨‍🍳', allowQuantity: true },
  { id: 'living-room', label: 'Living Room', icon: '🛋️', allowQuantity: true },
  { id: 'dining-room', label: 'Dining Room', icon: '🍽️', allowQuantity: false },
  { id: 'laundry-room', label: 'Laundry Room', icon: '🧺', allowQuantity: false },
  { id: 'balcony', label: 'Balcony/Patio', icon: '🪴', allowQuantity: false },
  { id: 'basement', label: 'Basement', icon: '🏚️', allowQuantity: false },
  { id: 'garage', label: 'Garage', icon: '🚗', allowQuantity: false },
  { id: 'home-office', label: 'Home Office', icon: '💼', allowQuantity: false },
];

const kitchenAddOnOptions = [
  { id: 'inside-fridge', label: 'Inside Fridge', icon: '🧊' },
  { id: 'inside-oven', label: 'Inside Oven', icon: '🔥' },
  { id: 'microwave', label: 'Microwave', icon: '📻' },
  { id: 'dishes', label: 'Dishes', icon: '🍽️' },
];

export function PropertyDetailsStep({ data, onUpdate, onNext, onBack }: PropertyDetailsStepProps) {
  const [formData, setFormData] = useState({
    propertyType: data.propertyType || '',
    bedrooms: data.bedrooms || 0,
    bathrooms: data.bathrooms || 0,
    toilets: data.toilets || 0,
    rooms: data.rooms || [],
    roomQuantities: data.roomQuantities || {},
    kitchenAddOns: data.kitchenAddOns || {},
    laundryRoomDetails: data.laundryRoomDetails || {},
    address: data.address || '',
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onUpdate(newData);
  };

  const toggleRoom = (roomId: string) => {
    const newRooms = formData.rooms.includes(roomId)
      ? formData.rooms.filter(r => r !== roomId)
      : [...formData.rooms, roomId];

    // If room is being added and it allows quantity, initialize quantity to 1
    const room = roomOptions.find(r => r.id === roomId);
    const newQuantities = { ...formData.roomQuantities };

    if (!formData.rooms.includes(roomId) && room?.allowQuantity) {
      newQuantities[roomId] = 1;
    } else if (formData.rooms.includes(roomId)) {
      // Remove quantity when room is deselected
      delete newQuantities[roomId];
    }

    updateFormData({ rooms: newRooms, roomQuantities: newQuantities });
  };

  const updateRoomQuantity = (roomId: string, quantity: number) => {
    const newQuantities = { ...formData.roomQuantities, [roomId]: quantity };
    updateFormData({ roomQuantities: newQuantities });
  };

  const toggleKitchenAddOn = (kitchenIndex: number, addOnId: string) => {
    const newAddOns = { ...formData.kitchenAddOns };
    const currentAddOns = newAddOns[kitchenIndex] || [];

    if (currentAddOns.includes(addOnId)) {
      newAddOns[kitchenIndex] = currentAddOns.filter(a => a !== addOnId);
    } else {
      newAddOns[kitchenIndex] = [...currentAddOns, addOnId];
    }

    updateFormData({ kitchenAddOns: newAddOns });
  };

  const updateLaundryDetails = (laundryIndex: number, field: 'baskets' | 'rounds', value: number) => {
    const newDetails = { ...formData.laundryRoomDetails };
    const currentDetails = newDetails[laundryIndex] || { baskets: 1, rounds: 1 };
    newDetails[laundryIndex] = { ...currentDetails, [field]: value };
    updateFormData({ laundryRoomDetails: newDetails });
  };

  const isResidentialProperty = () => {
    return ['Apartment', 'House', 'Condo'].includes(formData.propertyType);
  };

  const isOfficeProperty = () => {
    return formData.propertyType === 'Office';
  };

  const isValid = () => {
    if (!formData.propertyType || !formData.address) return false;

    if (isResidentialProperty()) {
      return formData.bedrooms > 0 && formData.bathrooms > 0;
    }

    if (isOfficeProperty()) {
      return formData.toilets >= 0;
    }

    return true;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Property Details</h2>
          <p className="text-neutral-600">Tell us about your space so we can provide an accurate quote</p>
        </div>

        {/* Service Address */}
        <div>
          <Label htmlFor="address" className="text-base font-semibold mb-3 block">Service Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            placeholder="123 Sparkle St, City, State, Zip"
            className="h-12 focus:ring-2 focus:ring-secondary-500"
            required
          />
        </div>

        {/* Property Type */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Property Type *</Label>
          {!formData.propertyType ? (
            <div className="space-y-2">
              {propertyTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateFormData({ propertyType: type.value })}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-neutral-200 hover:border-secondary-300 bg-white transition-all"
                >
                  {/* Radio Button */}
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-300 flex items-center justify-center flex-shrink-0 transition-all">
                  </div>

                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0">{type.icon}</div>

                  {/* Label */}
                  <div className="flex-1 text-left font-medium text-neutral-900">{type.label}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {propertyTypes.filter(type => type.value === formData.propertyType).map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateFormData({ propertyType: '' })}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-secondary-500 bg-secondary-50 shadow-md transition-all"
                >
                  {/* Radio Button */}
                  <div className="w-5 h-5 rounded-full border-2 border-secondary-500 bg-secondary-500 flex items-center justify-center flex-shrink-0 transition-all">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0">{type.icon}</div>

                  {/* Label */}
                  <div className="flex-1 text-left font-medium text-neutral-900">{type.label}</div>

                  {/* Check indicator */}
                  <Check className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bedrooms & Bathrooms - Only for Apartment, House, Condo */}
        {isResidentialProperty() && (
          <div className="flex justify-between items-start">
            <div className="max-w-[180px]">
              <Label htmlFor="bedrooms" className="text-base font-semibold mb-3 flex items-center gap-2">
                <Bed className="w-5 h-5 text-secondary-500" />
                Bedrooms *
              </Label>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-neutral-200">
                <span className="text-xs text-neutral-700 font-medium">Qty:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateFormData({ bedrooms: Math.max(0, formData.bedrooms - 1) })}
                    className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                  >
                    -
                  </button>
                  <div className="w-8 text-center">
                    <div className="font-bold text-sm text-neutral-900">{formData.bedrooms}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateFormData({ bedrooms: Math.min(10, formData.bedrooms + 1) })}
                    className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-[180px]">
              <Label htmlFor="bathrooms" className="text-base font-semibold mb-3 flex items-center gap-2">
                <Bath className="w-5 h-5 text-secondary-500" />
                Bathrooms *
              </Label>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-neutral-200">
                <span className="text-xs text-neutral-700 font-medium">Qty:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateFormData({ bathrooms: Math.max(0, formData.bathrooms - 1) })}
                    className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                  >
                    -
                  </button>
                  <div className="w-8 text-center">
                    <div className="font-bold text-sm text-neutral-900">{formData.bathrooms}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateFormData({ bathrooms: Math.min(10, formData.bathrooms + 1) })}
                    className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toilets - Only for Office */}
        {isOfficeProperty() && (
          <div className="flex-1 max-w-[250px]">
            <Label className="text-base font-semibold mb-3 flex items-center gap-2">
              <Bath className="w-5 h-5 text-secondary-500" />
              Number of Toilets *
            </Label>
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-neutral-200">
              <span className="text-xs text-neutral-700 font-medium">Qty:</span>
              <div className="flex items-center gap-1 flex-1">
                <button
                  type="button"
                  onClick={() => updateFormData({ toilets: Math.max(0, formData.toilets - 1) })}
                  className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                >
                  -
                </button>
                <div className="flex-1 text-center min-w-[24px]">
                  <div className="font-bold text-sm text-neutral-900">{formData.toilets}</div>
                </div>
                <button
                  type="button"
                  onClick={() => updateFormData({ toilets: Math.min(20, formData.toilets + 1) })}
                  className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Rooms - Nested under Property Type */}
        {formData.propertyType && isResidentialProperty() && formData.bedrooms > 0 && formData.bathrooms > 0 && (
          <div className="ml-6 pl-6 border-l-2 border-secondary-200 space-y-3">
            <div>
              <Label className="text-sm font-semibold text-secondary-700 block mb-2">
                Additional Rooms to Clean
              </Label>
              <p className="text-xs text-neutral-600 mb-3">Select all that apply to your {formData.propertyType.toLowerCase()}</p>
            </div>

            {/* Scrollable rooms container - similar to time slots */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 border border-neutral-200 rounded-lg p-3 bg-neutral-50">
              {roomOptions.map((room) => (
                <div key={room.id}>
                  <button
                    onClick={() => toggleRoom(room.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${formData.rooms.includes(room.id)
                      ? 'border-secondary-500 bg-secondary-50 shadow-sm'
                      : 'border-neutral-200 hover:border-secondary-300 bg-white'
                      }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${formData.rooms.includes(room.id)
                      ? 'border-secondary-500 bg-secondary-500'
                      : 'border-neutral-300'
                      }`}>
                      {formData.rooms.includes(room.id) && <Check className="w-3 h-3 text-white" />}
                    </div>

                    {/* Icon */}
                    <div className="text-xl flex-shrink-0">{room.icon}</div>

                    {/* Label */}
                    <div className="flex-1 text-left text-sm font-medium text-neutral-900">{room.label}</div>

                    {/* Quantity badge */}
                    {formData.rooms.includes(room.id) && room.allowQuantity && formData.roomQuantities?.[room.id] > 1 && (
                      <div className="px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded-full text-xs font-semibold flex-shrink-0">
                        ×{formData.roomQuantities[room.id]}
                      </div>
                    )}
                  </button>

                  {/* Quantity selector for kitchen and living room when selected */}
                  {formData.rooms.includes(room.id) && room.allowQuantity && (
                    <div className="ml-10 mt-2 flex items-center gap-2 p-2 bg-white rounded-lg border border-secondary-200 max-w-[180px]">
                      <span className="text-xs text-neutral-700 font-medium">Qty:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateRoomQuantity(room.id, Math.max(1, (formData.roomQuantities?.[room.id] || 1) - 1));
                          }}
                          className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                        >
                          -
                        </button>
                        <div className="w-8 text-center">
                          <div className="font-bold text-sm text-neutral-900">{formData.roomQuantities?.[room.id] || 1}</div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateRoomQuantity(room.id, Math.min(10, (formData.roomQuantities?.[room.id] || 1) + 1));
                          }}
                          className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Kitchen Add-ons - appears when kitchen is selected */}
                  {room.id === 'kitchen' && formData.rooms.includes('kitchen') && (
                    <div className="ml-10 mt-3 space-y-4">
                      {Array.from({ length: formData.roomQuantities?.['kitchen'] || 1 }).map((_, kitchenIndex) => (
                        <div key={kitchenIndex} className="space-y-2">
                          <div>
                            <Label className="text-xs font-semibold text-secondary-700 block mb-2">
                              {formData.roomQuantities?.['kitchen'] > 1 ? `Kitchen ${kitchenIndex + 1} Add-ons` : 'Kitchen Add-ons'}
                            </Label>
                            <p className="text-xs text-neutral-600 mb-2">Select all that apply</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {kitchenAddOnOptions.map((addOn) => (
                              <button
                                key={addOn.id}
                                onClick={() => toggleKitchenAddOn(kitchenIndex, addOn.id)}
                                className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${formData.kitchenAddOns[kitchenIndex]?.includes(addOn.id)
                                  ? 'border-secondary-500 bg-secondary-50 shadow-sm'
                                  : 'border-neutral-200 hover:border-secondary-300 bg-white'
                                  }`}
                              >
                                {/* Checkbox */}
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${formData.kitchenAddOns[kitchenIndex]?.includes(addOn.id)
                                  ? 'border-secondary-500 bg-secondary-500'
                                  : 'border-neutral-300'
                                  }`}>
                                  {formData.kitchenAddOns[kitchenIndex]?.includes(addOn.id) && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>

                                {/* Icon */}
                                <div className="text-base flex-shrink-0">{addOn.icon}</div>

                                {/* Label */}
                                <div className="flex-1 text-left text-xs font-medium text-neutral-900">{addOn.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Laundry Room Details - appears when laundry room is selected */}
                  {room.id === 'laundry-room' && formData.rooms.includes('laundry-room') && (
                    <div className="ml-10 mt-3">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Number of Baskets */}
                        <div>
                          <Label className="text-xs font-semibold text-secondary-700 block mb-2">
                            No. of Baskets
                          </Label>
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-secondary-200">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLaundryDetails(0, 'baskets', Math.max(1, (formData.laundryRoomDetails[0]?.baskets || 1) - 1));
                              }}
                              className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                            >
                              -
                            </button>
                            <div className="flex-1 text-center">
                              <div className="font-bold text-sm text-neutral-900">{formData.laundryRoomDetails[0]?.baskets || 1}</div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLaundryDetails(0, 'baskets', Math.min(10, (formData.laundryRoomDetails[0]?.baskets || 1) + 1));
                              }}
                              className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Number of Rounds */}
                        <div>
                          <Label className="text-xs font-semibold text-secondary-700 block mb-2">
                            No. of Rounds
                          </Label>
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-secondary-200">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLaundryDetails(0, 'rounds', Math.max(1, (formData.laundryRoomDetails[0]?.rounds || 1) - 1));
                              }}
                              className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                            >
                              -
                            </button>
                            <div className="flex-1 text-center">
                              <div className="font-bold text-sm text-neutral-900">{formData.laundryRoomDetails[0]?.rounds || 1}</div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLaundryDetails(0, 'rounds', Math.min(10, (formData.laundryRoomDetails[0]?.rounds || 1) + 1));
                              }}
                              className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Scroll hint */}
            <p className="text-xs text-neutral-500 italic text-center">Scroll to view more rooms</p>
          </div>
        )}

        {/* Additional Rooms for Office */}
        {formData.propertyType && isOfficeProperty() && formData.toilets >= 0 && (
          <div className="ml-6 pl-6 border-l-2 border-secondary-200 space-y-3">
            <div>
              <Label className="text-sm font-semibold text-secondary-700 block mb-2">
                Additional Rooms to Clean
              </Label>
              <p className="text-xs text-neutral-600 mb-3">Select all that apply to your {formData.propertyType.toLowerCase()}</p>
            </div>

            <div className="space-y-2">
              {roomOptions.map((room) => (
                <div key={room.id}>
                  <button
                    onClick={() => toggleRoom(room.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${formData.rooms.includes(room.id)
                      ? 'border-secondary-500 bg-secondary-50 shadow-sm'
                      : 'border-neutral-200 hover:border-secondary-300 bg-white'
                      }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${formData.rooms.includes(room.id)
                      ? 'border-secondary-500 bg-secondary-500'
                      : 'border-neutral-300'
                      }`}>
                      {formData.rooms.includes(room.id) && <Check className="w-3 h-3 text-white" />}
                    </div>

                    {/* Icon */}
                    <div className="text-xl flex-shrink-0">{room.icon}</div>

                    {/* Label */}
                    <div className="flex-1 text-left text-sm font-medium text-neutral-900">{room.label}</div>

                    {/* Quantity badge */}
                    {formData.rooms.includes(room.id) && room.allowQuantity && formData.roomQuantities?.[room.id] > 1 && (
                      <div className="px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded-full text-xs font-semibold flex-shrink-0">
                        ×{formData.roomQuantities[room.id]}
                      </div>
                    )}
                  </button>

                  {/* Quantity selector for kitchen and living room when selected */}
                  {formData.rooms.includes(room.id) && room.allowQuantity && (
                    <div className="ml-10 mt-2 flex items-center gap-2 p-2 bg-white rounded-lg border border-secondary-200 max-w-[180px]">
                      <span className="text-xs text-neutral-700 font-medium">Qty:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateRoomQuantity(room.id, Math.max(1, (formData.roomQuantities?.[room.id] || 1) - 1));
                          }}
                          className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                        >
                          -
                        </button>
                        <div className="w-8 text-center">
                          <div className="font-bold text-sm text-neutral-900">{formData.roomQuantities?.[room.id] || 1}</div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateRoomQuantity(room.id, Math.min(10, (formData.roomQuantities?.[room.id] || 1) + 1));
                          }}
                          className="w-6 h-6 rounded bg-secondary-100 hover:bg-secondary-200 text-secondary-700 flex items-center justify-center transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {isValid() && (
          <div className="p-4 bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg">
            <p className="text-sm text-neutral-900">
              <strong>Your property:</strong> {formData.propertyType}
              {isResidentialProperty() && (
                <> with {formData.bedrooms} bedroom{formData.bedrooms !== 1 ? 's' : ''}, {formData.bathrooms} bathroom{formData.bathrooms !== 1 ? 's' : ''}</>
              )}
              {isOfficeProperty() && (
                <> with {formData.toilets} toilet{formData.toilets !== 1 ? 's' : ''}</>
              )}
              {formData.rooms.length > 0 && (
                <>
                  {' + '}
                  {formData.rooms.map((roomId, index) => {
                    const room = roomOptions.find(r => r.id === roomId);
                    const quantity = formData.roomQuantities?.[roomId];
                    return (
                      <span key={roomId}>
                        {index > 0 && ', '}
                        {quantity && quantity > 1 ? `${quantity} ${room?.label}s` : room?.label}
                      </span>
                    );
                  })}
                </>
              )}
              {formData.kitchenAddOns[0]?.length > 0 && (
                <>
                  {' + '}
                  {formData.kitchenAddOns[0]?.map((addOnId, index) => {
                    const addOn = kitchenAddOnOptions.find(a => a.id === addOnId);
                    return (
                      <span key={addOnId}>
                        {index > 0 && ', '}
                        {addOn?.label}
                      </span>
                    );
                  })}
                </>
              )}
            </p>
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
        <Button
          onClick={onNext}
          disabled={!isValid()}
          className="bg-secondary-500 hover:bg-secondary-600 px-8"
        >
          Continue to Add-ons
        </Button>
      </div>
    </div>
  );
}