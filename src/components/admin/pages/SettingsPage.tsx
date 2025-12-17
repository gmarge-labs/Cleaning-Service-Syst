import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Building, DollarSign, Bell, Plug, Save, Key, Tag, AlertCircle, TrendingDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from '../../ui/badge';

export function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'SparkleVille',
    email: 'hello@sparkleville.com',
    phone: '(555) 123-4567',
    address: '123 Clean Street, Suite 100',
    businessHours: '8:00 AM - 8:00 PM',
    serviceArea: '10001, 10002, 10003',
  });

  const [pricingSettings, setPricingSettings] = useState({
    depositPercentage: 20,
    weeklyDiscount: 10,
    biWeeklyDiscount: 5,
    monthlyDiscount: 15,
    cancellationFee: 50,
  });

  const [servicePrices, setServicePrices] = useState({
    'Standard Cleaning': 89,
    'Deep Cleaning': 159,
    'Move In/Out': 199,
    'Post-Construction': 249,
  });

  const [roomPrices, setRoomPrices] = useState({
    'Bedroom': 15,
    'Bathroom': 15,
    'Toilet': 10,
    'Kitchen': 20,
    'Living Room': 20,
    'Dining Room': 15,
    'Laundry Room': 15,
    'Balcony/Patio': 15,
    'Basement': 25,
    'Garage': 20,
    'Home Office': 15,
  });

  const [addonPrices, setAddonPrices] = useState({
    'Inside Windows': 25,
    'Inside Fridge': 35,
    'Inside Oven': 40,
    'Laundry Service': 30,
    'Carpet Cleaning': 50,
    'Pet Hair Removal': 25,
    'Organization': 45,
    'Dish Washing': 20,
  });

  const [integrations, setIntegrations] = useState({
    stripe: { enabled: true, apiKey: 'sk_test_***************' },
    plivo: { enabled: true, apiKey: 'MA***************' },
    sendgrid: { enabled: true, apiKey: 'SG.***************' },
    quickbooks: { enabled: false, apiKey: '' },
    googleCalendar: { enabled: true, apiKey: 'AIza***************' },
  });

  const handleSaveServicePrices = () => {
    toast.success('Service prices updated successfully!');
  };

  const handleSaveRoomPrices = () => {
    toast.success('Room prices updated successfully!');
  };

  const handleSaveAddonPrices = () => {
    toast.success('Add-on prices updated successfully!');
  };

  const handleSaveGeneralPricing = () => {
    toast.success('General pricing settings updated successfully!');
  };

  const handleSaveGeneralSettings = () => {
    toast.success('Company information updated successfully!');
  };

  const handleSaveNotificationTemplates = () => {
    toast.success('Notification templates saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">System Settings</h1>
        <p className="text-neutral-600 mt-1">Configure your platform settings and integrations</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Building className="w-6 h-6 text-secondary-500" />
              <h2 className="text-xl font-semibold text-neutral-900">Company Information</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={generalSettings.companyName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="company-email">Email Address</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={generalSettings.email}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="company-phone">Phone Number</Label>
                <Input
                  id="company-phone"
                  type="tel"
                  value={generalSettings.phone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="business-hours">Business Hours</Label>
                <Input
                  id="business-hours"
                  value={generalSettings.businessHours}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, businessHours: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="service-area">Service Area (Zip Codes)</Label>
                <Textarea
                  id="service-area"
                  value={generalSettings.serviceArea}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, serviceArea: e.target.value })}
                  placeholder="Enter zip codes separated by commas"
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button onClick={handleSaveGeneralSettings} className="bg-secondary-500 hover:bg-secondary-600">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Pricing Settings */}
        <TabsContent value="pricing" className="space-y-6">
          {/* Service Prices */}
          <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <DollarSign className="w-6 h-6 text-secondary-500" />
              <h2 className="text-xl font-semibold text-neutral-900">Service Prices</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(servicePrices).map(([service, price]) => (
                <div key={service}>
                  <Label htmlFor={`service-${service}`}>{service}</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-neutral-600">$</span>
                    <Input
                      id={`service-${service}`}
                      type="number"
                      value={price}
                      onChange={(e) => setServicePrices({ ...servicePrices, [service]: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button onClick={handleSaveServicePrices} className="bg-secondary-500 hover:bg-secondary-600">
                <Save className="w-4 h-4 mr-2" />
                Save Service Prices
              </Button>
            </div>
          </div>

          {/* Room Prices */}
          <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <DollarSign className="w-6 h-6 text-secondary-500" />
              <h2 className="text-xl font-semibold text-neutral-900">Room Prices</h2>
            </div>

            <p className="text-sm text-neutral-600 mb-4">
              Price per room added during booking
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(roomPrices).map(([room, price]) => (
                <div key={room}>
                  <Label htmlFor={`room-${room}`}>{room}</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-neutral-600">$</span>
                    <Input
                      id={`room-${room}`}
                      type="number"
                      value={price}
                      onChange={(e) => setRoomPrices({ ...roomPrices, [room]: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button onClick={handleSaveRoomPrices} className="bg-secondary-500 hover:bg-secondary-600">
                <Save className="w-4 h-4 mr-2" />
                Save Room Prices
              </Button>
            </div>
          </div>

          {/* Add-on Prices */}
          <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <DollarSign className="w-6 h-6 text-secondary-500" />
              <h2 className="text-xl font-semibold text-neutral-900">Add-on Prices</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(addonPrices).map(([addon, price]) => (
                <div key={addon}>
                  <Label htmlFor={`addon-${addon}`}>{addon}</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-neutral-600">$</span>
                    <Input
                      id={`addon-${addon}`}
                      type="number"
                      value={price}
                      onChange={(e) => setAddonPrices({ ...addonPrices, [addon]: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button onClick={handleSaveAddonPrices} className="bg-secondary-500 hover:bg-secondary-600">
                <Save className="w-4 h-4 mr-2" />
                Save Add-on Prices
              </Button>
            </div>
          </div>

          {/* General Pricing Settings */}
          <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Tag className="w-6 h-6 text-secondary-500" />
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Frequency Discount Manager</h2>
                  <p className="text-sm text-neutral-600 mt-1">Configure discounts for recurring cleaning services</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-300">
                <TrendingDown className="w-3 h-3 mr-1" />
                Active Promotions
              </Badge>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">How frequency discounts work</p>
                <p>These discounts are automatically applied when customers select recurring cleaning services during booking. Higher discounts encourage customer loyalty and recurring revenue.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral-900">Recurring Service Discounts</h3>
                  <p className="text-sm text-neutral-600">Applied to total booking amount</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Weekly Discount */}
                  <div className="border-2 border-neutral-200 rounded-xl p-5 hover:border-secondary-300 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <Label htmlFor="weekly-discount" className="text-base font-semibold">Weekly Service</Label>
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Most Popular</Badge>
                    </div>
                    <p className="text-xs text-neutral-600 mb-3">Cleanings every week (52/year)</p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="weekly-discount"
                        type="number"
                        value={pricingSettings.weeklyDiscount}
                        onChange={(e) => setPricingSettings({ ...pricingSettings, weeklyDiscount: parseInt(e.target.value) })}
                        min="0"
                        max="100"
                        className="text-lg font-semibold"
                      />
                      <span className="text-neutral-600 font-semibold">%</span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-2">
                      On $200: Save ${((200 * pricingSettings.weeklyDiscount) / 100).toFixed(2)} = ${(200 - (200 * pricingSettings.weeklyDiscount) / 100).toFixed(2)}
                    </p>
                  </div>

                  {/* Bi-weekly Discount */}
                  <div className="border-2 border-neutral-200 rounded-xl p-5 hover:border-secondary-300 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <Label htmlFor="biweekly-discount" className="text-base font-semibold">Bi-weekly Service</Label>
                    </div>
                    <p className="text-xs text-neutral-600 mb-3">Cleanings every 2 weeks (26/year)</p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="biweekly-discount"
                        type="number"
                        value={pricingSettings.biWeeklyDiscount}
                        onChange={(e) => setPricingSettings({ ...pricingSettings, biWeeklyDiscount: parseInt(e.target.value) })}
                        min="0"
                        max="100"
                        className="text-lg font-semibold"
                      />
                      <span className="text-neutral-600 font-semibold">%</span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-2">
                      On $200: Save ${((200 * pricingSettings.biWeeklyDiscount) / 100).toFixed(2)} = ${(200 - (200 * pricingSettings.biWeeklyDiscount) / 100).toFixed(2)}
                    </p>
                  </div>

                  {/* Monthly Discount */}
                  <div className="border-2 border-neutral-200 rounded-xl p-5 hover:border-secondary-300 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <Label htmlFor="monthly-discount" className="text-base font-semibold">Monthly Service</Label>
                    </div>
                    <p className="text-xs text-neutral-600 mb-3">Cleanings once a month (12/year)</p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="monthly-discount"
                        type="number"
                        value={pricingSettings.monthlyDiscount}
                        onChange={(e) => setPricingSettings({ ...pricingSettings, monthlyDiscount: parseInt(e.target.value) })}
                        min="0"
                        max="100"
                        className="text-lg font-semibold"
                      />
                      <span className="text-neutral-600 font-semibold">%</span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-2">
                      On $200: Save ${((200 * pricingSettings.monthlyDiscount) / 100).toFixed(2)} = ${(200 - (200 * pricingSettings.monthlyDiscount) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="mt-6 p-4 bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg border border-secondary-200">
                  <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Current Discount Structure
                  </h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-neutral-600 mb-1">One-time</p>
                      <p className="font-semibold text-neutral-900">0% off</p>
                    </div>
                    <div className="text-center">
                      <p className="text-neutral-600 mb-1">Weekly</p>
                      <p className="font-semibold text-green-600">{pricingSettings.weeklyDiscount}% off</p>
                    </div>
                    <div className="text-center">
                      <p className="text-neutral-600 mb-1">Bi-weekly</p>
                      <p className="font-semibold text-green-600">{pricingSettings.biWeeklyDiscount}% off</p>
                    </div>
                    <div className="text-center">
                      <p className="text-neutral-600 mb-1">Monthly</p>
                      <p className="font-semibold text-green-600">{pricingSettings.monthlyDiscount}% off</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200">
                <Label htmlFor="cancellation-fee" className="text-base font-semibold">Cancellation Fee</Label>
                <p className="text-sm text-neutral-600 mt-1 mb-3">
                  Fee charged for cancellations within 24 hours of scheduled service
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-neutral-600">$</span>
                  <Input
                    id="cancellation-fee"
                    type="number"
                    value={pricingSettings.cancellationFee}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, cancellationFee: parseInt(e.target.value) })}
                    min="0"
                    className="max-w-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button onClick={handleSaveGeneralPricing} className="bg-secondary-500 hover:bg-secondary-600">
                <Save className="w-4 h-4 mr-2" />
                Save Discount Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Bell className="w-6 h-6 text-secondary-500" />
              <h2 className="text-xl font-semibold text-neutral-900">Notification Templates</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="confirmation-template">Booking Confirmation Email</Label>
                <Textarea
                  id="confirmation-template"
                  placeholder="Dear {customer_name}, Your booking for {service_type} on {date} at {time} has been confirmed..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="reminder-template">24h Reminder Template</Label>
                <Textarea
                  id="reminder-template"
                  placeholder="Hi {customer_name}, This is a reminder that your {service_type} is scheduled for tomorrow at {time}..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="completion-template">Service Completion Email</Label>
                <Textarea
                  id="completion-template"
                  placeholder="Hi {customer_name}, Your cleaning service has been completed. We hope you're satisfied with the results..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button onClick={handleSaveNotificationTemplates} className="bg-secondary-500 hover:bg-secondary-600">
                <Save className="w-4 h-4 mr-2" />
                Save Templates
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Plug className="w-6 h-6 text-secondary-500" />
              <h2 className="text-xl font-semibold text-neutral-900">External Integrations</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(integrations).map(([key, integration]) => (
                <div key={key} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      API Key: {integration.apiKey || 'Not configured'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <Key className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Switch
                      checked={integration.enabled}
                      onCheckedChange={(checked) => {
                        setIntegrations({
                          ...integrations,
                          [key]: { ...integration, enabled: checked }
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Key className="w-6 h-6 text-secondary-500" />
              <h2 className="text-xl font-semibold text-neutral-900">API Keys</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-neutral-900">Production API Key</h3>
                  <Button variant="outline" size="sm">Regenerate</Button>
                </div>
                <code className="text-sm text-neutral-600 font-mono">
                  pk_live_51JdF***********************************************
                </code>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-neutral-900">Test API Key</h3>
                  <Button variant="outline" size="sm">Regenerate</Button>
                </div>
                <code className="text-sm text-neutral-600 font-mono">
                  pk_test_51JdF***********************************************
                </code>
              </div>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-900">
                <strong>Warning:</strong> Keep your API keys secure. Do not share them publicly or commit them to version control.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}