import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User as UserIcon, MapPin, CreditCard, Bell, Lock, Trash2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { toast } from 'sonner';
import { AddressModal } from './AddressModal';
import { PaymentMethodModal } from './PaymentMethodModal';

export function ProfileSettings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [notifications, setNotifications] = useState({
    emailBookingConfirmation: true,
    emailReminders: true,
    smsReminders: true,
    whatsappReminders: false,
    pushNotifications: true,
    promotionalEmails: false,
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${user?.id}`);
      const data = await response.json();

      if (response.ok) {
        setPersonalInfo({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        });
        setAddresses(data.addresses || []);
        setPaymentMethods(data.paymentMethods || []);
        if (data.notificationSettings) {
          setNotifications(data.notificationSettings);
        }
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSavePersonal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: personalInfo.name,
          phone: personalInfo.phone,
        }),
      });

      if (response.ok) {
        toast.success('Personal information updated');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationSettings: notifications,
        }),
      });

      if (response.ok) {
        toast.success('Notification preferences saved');
      } else {
        throw new Error('Failed to update notifications');
      }
    } catch (error) {
      toast.error('Error updating notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (addressData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/users/${user?.id}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData),
      });

      if (response.ok) {
        toast.success('Address added successfully');
        setShowAddressModal(false);
        fetchProfile();
      } else {
        throw new Error('Failed to add address');
      }
    } catch (error) {
      toast.error('Error adding address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/addresses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Address deleted');
        fetchProfile();
      }
    } catch (error) {
      toast.error('Error deleting address');
    }
  };

  const handleAddPayment = async (paymentData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/users/${user?.id}/payment-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        toast.success('Payment method added');
        setShowPaymentModal(false);
        fetchProfile();
      } else {
        throw new Error('Failed to add payment method');
      }
    } catch (error) {
      toast.error('Error adding payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/payment-methods/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Payment method deleted');
        fetchProfile();
      }
    } catch (error) {
      toast.error('Error deleting payment method');
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/users/${user?.id}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('Password updated successfully');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    } catch (error) {
      toast.error('Error updating password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Profile Settings</h1>
        <p className="text-neutral-600">Manage your account information and preferences</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Personal Info */}
        <TabsContent value="personal" className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <UserIcon className="w-6 h-6 text-secondary-500" />
              <h2 className="text-xl font-semibold text-neutral-900">Personal Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  disabled
                  className="mt-1.5 bg-neutral-50"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button
                className="bg-secondary-500 hover:bg-secondary-600"
                onClick={handleSavePersonal}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Addresses */}
        <TabsContent value="addresses" className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MapPin className="w-6 h-6 text-secondary-500" />
                <h2 className="text-xl font-semibold text-neutral-900">Saved Addresses</h2>
              </div>
              <Button
                className="bg-secondary-500 hover:bg-secondary-600"
                onClick={() => setShowAddressModal(true)}
              >
                + Add Address
              </Button>
            </div>

            <div className="space-y-4">
              {addresses.length === 0 ? (
                <p className="text-center py-8 text-neutral-500 border-2 border-dashed border-neutral-100 rounded-xl">
                  No addresses saved yet.
                </p>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-4 border border-neutral-200 rounded-lg hover:border-secondary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-neutral-900">{address.label}</span>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 bg-secondary-100 text-secondary-700 text-xs font-medium rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600">
                          {address.street}, {address.city}, {address.state} {address.zip}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="payment" className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CreditCard className="w-6 h-6 text-secondary-500" />
                <h2 className="text-xl font-semibold text-neutral-900">Payment Methods</h2>
              </div>
              <Button
                className="bg-secondary-500 hover:bg-secondary-600"
                onClick={() => setShowPaymentModal(true)}
              >
                + Add Card
              </Button>
            </div>

            <div className="space-y-4">
              {paymentMethods.length === 0 ? (
                <p className="text-center py-8 text-neutral-500 border-2 border-dashed border-neutral-100 rounded-xl">
                  No payment methods saved yet.
                </p>
              ) : (
                paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="p-4 border border-neutral-200 rounded-lg hover:border-secondary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-primary-600 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-neutral-900">{method.type} •••• {method.last4}</span>
                            {method.isDefault && (
                              <span className="px-2 py-0.5 bg-secondary-100 text-secondary-700 text-xs font-medium rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600">Expires {method.expiry}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeletePayment(method.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Bell className="w-6 h-6 text-secondary-500" />
              <h2 className="text-xl font-semibold text-neutral-900">Notification Preferences</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-neutral-900">Email - Booking Confirmations</div>
                  <div className="text-sm text-neutral-600">Receive confirmation emails for new bookings</div>
                </div>
                <Switch
                  checked={notifications.emailBookingConfirmation}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailBookingConfirmation: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-neutral-200">
                <div>
                  <div className="font-medium text-neutral-900">Email - Reminders</div>
                  <div className="text-sm text-neutral-600">24-hour and 2-hour reminders before service</div>
                </div>
                <Switch
                  checked={notifications.emailReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailReminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-neutral-200">
                <div>
                  <div className="font-medium text-neutral-900">SMS - Reminders</div>
                  <div className="text-sm text-neutral-600">Text message reminders before service</div>
                </div>
                <Switch
                  checked={notifications.smsReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, smsReminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-neutral-200">
                <div>
                  <div className="font-medium text-neutral-900">WhatsApp - Reminders</div>
                  <div className="text-sm text-neutral-600">WhatsApp notifications for bookings</div>
                </div>
                <Switch
                  checked={notifications.whatsappReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, whatsappReminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-neutral-200">
                <div>
                  <div className="font-medium text-neutral-900">Push Notifications</div>
                  <div className="text-sm text-neutral-600">App notifications for booking updates</div>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, pushNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-neutral-200">
                <div>
                  <div className="font-medium text-neutral-900">Promotional Emails</div>
                  <div className="text-sm text-neutral-600">Special offers and discounts</div>
                </div>
                <Switch
                  checked={notifications.promotionalEmails}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, promotionalEmails: checked })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button
                className="bg-secondary-500 hover:bg-secondary-600"
                onClick={handleSaveNotifications}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Lock className="w-6 h-6 text-secondary-500" />
              <h2 className="text-xl font-semibold text-neutral-900">Security Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                      className="mt-1.5"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      className="mt-1.5"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      className="mt-1.5"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                  </div>
                  <Button
                    className="bg-secondary-500 hover:bg-secondary-600"
                    onClick={handleChangePassword}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-2">Delete Account</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showAddressModal && (
        <AddressModal
          onClose={() => setShowAddressModal(false)}
          onSave={handleAddAddress}
          isLoading={isLoading}
        />
      )}

      {showPaymentModal && (
        <PaymentMethodModal
          onClose={() => setShowPaymentModal(false)}
          onSave={handleAddPayment}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
