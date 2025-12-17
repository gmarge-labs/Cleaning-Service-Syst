import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { User, MapPin, CreditCard, Bell, Lock, Trash2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';

export function ProfileSettings() {
  const [personalInfo, setPersonalInfo] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(555) 123-4567',
  });

  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home', address: '123 Main St, Apt 4B, New York, NY 10001', isDefault: true },
    { id: 2, label: 'Office', address: '456 Business Ave, Suite 100, New York, NY 10002', isDefault: false },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 2, type: 'Mastercard', last4: '8888', expiry: '06/26', isDefault: false },
  ]);

  const [notifications, setNotifications] = useState({
    emailBookingConfirmation: true,
    emailReminders: true,
    smsReminders: true,
    whatsappReminders: false,
    pushNotifications: true,
    promotionalEmails: false,
  });

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
              <User className="w-6 h-6 text-secondary-500" />
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
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="mt-1.5"
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
              <Button className="bg-secondary-500 hover:bg-secondary-600">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
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
              <Button className="bg-secondary-500 hover:bg-secondary-600">
                + Add Address
              </Button>
            </div>

            <div className="space-y-4">
              {addresses.map((address) => (
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
                      <p className="text-sm text-neutral-600">{address.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      {!address.isDefault && (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
              <Button className="bg-secondary-500 hover:bg-secondary-600">
                + Add Card
              </Button>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
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
                      <Button variant="ghost" size="sm">Edit</Button>
                      {!method.isDefault && (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
              <Button className="bg-secondary-500 hover:bg-secondary-600">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      className="mt-1.5"
                    />
                  </div>
                  <Button className="bg-secondary-500 hover:bg-secondary-600">
                    Update Password
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
    </div>
  );
}
