import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { X, CreditCard } from 'lucide-react';

interface PaymentMethodModalProps {
    onClose: () => void;
    onSave: (paymentMethod: any) => void;
    isLoading?: boolean;
}

export function PaymentMethodModal({ onClose, onSave, isLoading }: PaymentMethodModalProps) {
    const [formData, setFormData] = useState({
        type: 'Visa',
        last4: '',
        expiry: '',
        isDefault: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation for last 4 digits
        if (!/^\d{4}$/.test(formData.last4)) {
            alert('Please enter exactly 4 digits for the card number.');
            return;
        }
        // Basic validation for expiry (MM/YY)
        if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) {
            alert('Please enter expiry in MM/YY format.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-secondary-500" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">Add Payment Method</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Card Type</Label>
                        <select
                            id="type"
                            className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                            <option value="American Express">American Express</option>
                            <option value="Discover">Discover</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="last4">Last 4 Digits</Label>
                        <Input
                            id="last4"
                            required
                            maxLength={4}
                            placeholder="4242"
                            value={formData.last4}
                            onChange={(e) => setFormData({ ...formData, last4: e.target.value.replace(/\D/g, '') })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date (MM/YY)</Label>
                        <Input
                            id="expiry"
                            required
                            placeholder="12/25"
                            value={formData.expiry}
                            onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 2) {
                                    val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                }
                                setFormData({ ...formData, expiry: val });
                            }}
                            maxLength={5}
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isDefaultPayment"
                            className="w-4 h-4 rounded border-neutral-300 text-secondary-500 focus:ring-secondary-500"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        />
                        <Label htmlFor="isDefaultPayment" className="text-sm cursor-pointer">Set as default payment method</Label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-secondary-500 hover:bg-secondary-600" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Card'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
