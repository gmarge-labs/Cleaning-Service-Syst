import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { X, MapPin } from 'lucide-react';

interface AddressModalProps {
    onClose: () => void;
    onSave: (address: any) => void;
    isLoading?: boolean;
}

export function AddressModal({ onClose, onSave, isLoading }: AddressModalProps) {
    const [formData, setFormData] = useState({
        label: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        isDefault: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-secondary-500" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">Add New Address</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="label">Address Label (e.g., Home, Office)</Label>
                        <Input
                            id="label"
                            required
                            placeholder="Home"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                            id="street"
                            required
                            placeholder="123 Main St"
                            value={formData.street}
                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                required
                                placeholder="New York"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                required
                                placeholder="NY"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                            id="zip"
                            required
                            placeholder="10001"
                            value={formData.zip}
                            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isDefault"
                            className="w-4 h-4 rounded border-neutral-300 text-secondary-500 focus:ring-secondary-500"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        />
                        <Label htmlFor="isDefault" className="text-sm cursor-pointer">Set as default address</Label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-secondary-500 hover:bg-secondary-600" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Address'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
