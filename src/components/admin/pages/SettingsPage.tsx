import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Building, DollarSign, Bell, Plug, Save, Key, Tag, AlertCircle, TrendingDown, Loader2, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../ui/badge';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { updateGeneralSettings } from '../../../store/slices/settingsSlice';

const API_URL = '/api';

export function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { general: reduxGeneral } = useSelector((state: RootState) => state.settings);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState<string>('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [qualifiedUsersCount, setQualifiedUsersCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  const [generalSettings, setGeneralSettings] = useState(reduxGeneral);

  const [pricingSettings, setPricingSettings] = useState({
    depositPercentage: 20,
    topBookerDiscount: 15,
    topBookerCategory: 'all',
    cancellationFee: 50,
  });

  const [cleanerPay, setCleanerPay] = useState({
    level1: 18,
    level2: 22,
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
    'Pet Hair Removal': 25,
    'Organization': 45,
    'Dish Washing': 20,
  });

  const [durationSettings, setDurationSettings] = useState({
    baseMinutes: 60,
    perBedroom: 30,
    perBathroom: 45,
    perToilet: 15,
    perOtherRoom: 20,
    // Specific Room Durations
    perKitchen: 45,
    perLivingRoom: 30,
    perDiningRoom: 20,
    perLaundryRoom: 20,
    perBalcony: 20,
    perBasement: 45,
    perGarage: 30,
    perHomeOffice: 20,
    // Kitchen Add-ons
    perInsideFridge: 20,
    perInsideOven: 25,
    perMicrowave: 10,
    perDishes: 20,
    // Laundry
    perLaundryBasket: 30,
    // General Add-ons
    perWindow: 15,
    perPetHair: 30,
    perOrganizationHour: 60,
    
    standardCleaningMultiplier: 1.0,
    deepCleaningMultiplier: 1.5,
    moveInOutMultiplier: 2.0,
    postConstructionMultiplier: 2.5,
  });

  const [notificationTemplates, setNotificationTemplates] = useState({
    confirmation: 'Dear {customer_name}, Your booking for {service_type} on {date} at {time} has been confirmed...',
    reminder: 'Hi {customer_name}, This is a reminder that your {service_type} is scheduled for tomorrow at {time}...',
    completion: 'Hi {customer_name}, Your cleaning service has been completed. We hope you\'re satisfied with the results...',
    welcome: 'Dear {customer_name}, Welcome to our platform! Your account has been created and you can now access all our services.',
    application_accepted: 'Dear {name}, Congratulations! Your application to join the Sparkleville team has been accepted. We are excited to have you on board. Our team will contact you shortly with the next steps for onboarding.',
    application_rejected: 'Dear {name}, Thank you for your interest in joining Sparkleville. After carefully reviewing your application, we regret to inform you that we will not be moving forward with your application at this time. We wish you the best in your future endeavors.',
  });

  const [integrations, setIntegrations] = useState({
    stripe: { enabled: true, apiKey: 'sk_test_***************' },
    plivo: { enabled: true, apiKey: 'MA***************' },
    sendgrid: { enabled: true, apiKey: 'SG.***************' },
    quickbooks: { enabled: false, apiKey: '' },
    googleCalendar: { enabled: true, apiKey: 'AIza***************' },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchQualifiedCount = async () => {
      if (!pricingSettings.topBookerCategory) return;
      
      try {
        setIsLoadingCount(true);
        const response = await fetch(`${API_URL}/settings/qualified-count?category=${pricingSettings.topBookerCategory}`);
        if (response.ok) {
          const data = await response.json();
          setQualifiedUsersCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching qualified count:', error);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchQualifiedCount();
  }, [pricingSettings.topBookerCategory]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      
      if (data) {
        if (data.general) setGeneralSettings(data.general);
        if (data.pricing) setPricingSettings(data.pricing);
        if (data.cleanerPay) setCleanerPay(data.cleanerPay);
        if (data.servicePrices) setServicePrices(data.servicePrices);
        if (data.roomPrices) setRoomPrices(data.roomPrices);
        if (data.addonPrices) setAddonPrices(data.addonPrices);
        if (data.durationSettings) setDurationSettings(data.durationSettings);
        if (data.notifications) setNotificationTemplates(data.notifications);
        if (data.integrations) setIntegrations(data.integrations);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (updates: any) => {
    try {
      setIsSaving(true);
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update settings');
      
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveServicePrices = () => {
    saveSettings({ servicePrices });
  };

  const handleSaveRoomPrices = () => {
    saveSettings({ roomPrices });
  };

  const handleSaveAddonPrices = () => {
    saveSettings({ addonPrices });
  };

  const handleSavePaySettings = () => {
    saveSettings({ pricing: pricingSettings });
  };

  const handleSaveCleanerPay = () => {
    saveSettings({ cleanerPay });
  };

  const handleSaveGeneralSettings = async () => {
    await saveSettings({ general: generalSettings });
    dispatch(updateGeneralSettings(generalSettings));
  };

  const handleSaveDurationSettings = () => {
    saveSettings({ durationSettings });
  };

  const handleSaveNotificationTemplates = () => {
    saveSettings({ notifications: notificationTemplates });
  };

  const handleSaveIntegrations = () => {
    saveSettings({ integrations });
  };

  const handleOpenConfigModal = (integrationKey: string, currentApiKey: string) => {
    setCurrentIntegration(integrationKey);
    setTempApiKey(currentApiKey || '');
    setIsConfigModalOpen(true);
  };

  const handleSaveApiKey = () => {
    if (currentIntegration) {
      setIntegrations({
        ...integrations,
        [currentIntegration]: {
          ...integrations[currentIntegration as keyof typeof integrations],
          apiKey: tempApiKey
        }
      });
      setIsConfigModalOpen(false);
      toast.success('API key updated! Remember to save your changes.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-secondary-500 animate-spin" />
        <p className="text-neutral-600">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">System Settings</h1>
        <p className="text-neutral-600 mt-1">Configure your platform settings and integrations</p>
      </div>

      <Tabs defaultValue="general" className="space-y-8">
        <TabsList className="grid grid-cols-3 md:grid-cols-9 h-auto p-1 bg-neutral-100/50 border border-neutral-200 rounded-xl">
          <TabsTrigger value="general" className="py-2.5">
            <Building className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="services" className="py-2.5">
            <Tag className="w-4 h-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="rooms" className="py-2.5">
            <Building className="w-4 h-4 mr-2" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="addons" className="py-2.5">
            <Plus className="w-4 h-4 mr-2" />
            Add-ons
          </TabsTrigger>
          <TabsTrigger value="pay" className="py-2.5">
            <DollarSign className="w-4 h-4 mr-2" />
            Pay
          </TabsTrigger>
          <TabsTrigger value="duration" className="py-2.5">
            <Clock className="w-4 h-4 mr-2" />
            Duration
          </TabsTrigger>
          <TabsTrigger value="notifications" className="py-2.5">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="py-2.5">
            <Plug className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="api" className="py-2.5">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
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
              <Button 
                onClick={handleSaveGeneralSettings} 
                disabled={isSaving}
                className="bg-secondary-500 hover:bg-secondary-600"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Services Settings */}
        <TabsContent value="services" className="space-y-6">
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
              <Button 
                onClick={handleSaveServicePrices} 
                disabled={isSaving}
                className="bg-secondary-500 hover:bg-secondary-600"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Service Prices
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Rooms Settings */}
        <TabsContent value="rooms" className="space-y-6">
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
              <Button 
                onClick={handleSaveRoomPrices} 
                disabled={isSaving}
                className="bg-secondary-500 hover:bg-secondary-600"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Room Prices
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Add-ons Settings */}
        <TabsContent value="addons" className="space-y-6">
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
              <Button 
                onClick={handleSaveAddonPrices} 
                disabled={isSaving}
                className="bg-secondary-500 hover:bg-secondary-600"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Add-on Prices
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Pay Settings */}
        <TabsContent value="pay" className="space-y-6">
          {/* Cleaner Pay */}
          <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <DollarSign className="w-6 h-6 text-secondary-500" />
              <h2 className="text-xl font-semibold text-neutral-900">Cleaner Pay</h2>
            </div>

            <p className="text-sm text-neutral-600 mb-4">
              Set hourly wage rates for different cleaner levels
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-neutral-200 rounded-xl p-5 hover:border-secondary-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="level1-pay" className="text-base font-semibold">Level 1 Cleaners</Label>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">Entry Level</Badge>
                </div>
                <p className="text-xs text-neutral-600 mb-3">Standard cleaning professionals</p>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-600">$</span>
                  <Input
                    id="level1-pay"
                    type="number"
                    value={cleanerPay.level1}
                    onChange={(e) => setCleanerPay({ ...cleanerPay, level1: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.50"
                    className="text-lg font-semibold flex-1"
                  />
                  <span className="text-neutral-600">/hour</span>
                </div>
              </div>

              <div className="border-2 border-neutral-200 rounded-xl p-5 hover:border-secondary-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="level2-pay" className="text-base font-semibold">Level 2 Cleaners</Label>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">Experienced</Badge>
                </div>
                <p className="text-xs text-neutral-600 mb-3">Advanced cleaning specialists</p>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-600">$</span>
                  <Input
                    id="level2-pay"
                    type="number"
                    value={cleanerPay.level2}
                    onChange={(e) => setCleanerPay({ ...cleanerPay, level2: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.50"
                    className="text-lg font-semibold flex-1"
                  />
                  <span className="text-neutral-600">/hour</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button 
                onClick={handleSaveCleanerPay} 
                disabled={isSaving}
                className="bg-secondary-500 hover:bg-secondary-600"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Cleaner Pay
              </Button>
            </div>
          </div>

          {/* Pay Settings */}
          <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Tag className="w-6 h-6 text-secondary-500" />
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Top Booker Discount Manager</h2>
                  <p className="text-sm text-neutral-600 mt-1">Configure discounts for your most loyal customers</p>
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
                <p className="font-semibold mb-1">How top booker discounts work</p>
                <p>This discount is applied to customers based on their total number of completed bookings. You can select which category of users qualifies for this discount.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <Label htmlFor="top-booker-category" className="text-base font-semibold">Target User Category</Label>
                  <p className="text-sm text-neutral-600 mb-3">Select which users qualify for the discount</p>
                  <select
                    id="top-booker-category"
                    value={pricingSettings.topBookerCategory}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, topBookerCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  >
                    <option value="all">All Users</option>
                    <option value="5-9">Users with 5 to 9 bookings</option>
                    <option value="10-15">Users with 10 to 15 bookings</option>
                    <option value="16-20">Users with 16 to 20 bookings</option>
                    <option value="21+">Users with 21+ bookings</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="top-booker-discount" className="text-base font-semibold">Discount Percentage</Label>
                  <p className="text-sm text-neutral-600 mb-3">Percentage to deduct from total</p>
                  <div className="flex items-center gap-2">
                    <Input
                      id="top-booker-discount"
                      type="number"
                      value={pricingSettings.topBookerDiscount}
                      onChange={(e) => setPricingSettings({ ...pricingSettings, topBookerDiscount: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      className="text-lg font-semibold"
                    />
                    <span className="text-neutral-600 font-semibold">%</span>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg border border-secondary-200">
                <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Current Discount Structure
                </h4>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-neutral-600 mb-1">Qualifying Category</p>
                    <p className="font-semibold text-neutral-900">
                      {pricingSettings.topBookerCategory === 'all' ? 'All Users' : 
                       pricingSettings.topBookerCategory === '5-9' ? '5-9 Bookings' :
                       pricingSettings.topBookerCategory === '10-15' ? '10-15 Bookings' :
                       pricingSettings.topBookerCategory === '16-20' ? '16-20 Bookings' : '21+ Bookings'}
                    </p>
                  </div>
                  <div className="flex gap-12 text-right">
                    <div>
                      <p className="text-neutral-600 mb-1">Qualified Users</p>
                      <p className="font-semibold text-secondary-600">
                        {isLoadingCount ? (
                          <Loader2 className="w-3 h-3 animate-spin inline" />
                        ) : (
                          `${qualifiedUsersCount ?? 0} users`
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-600 mb-1">Discount Applied</p>
                      <p className="font-semibold text-green-600">{pricingSettings.topBookerDiscount}% off</p>
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
                    onChange={(e) => setPricingSettings({ ...pricingSettings, cancellationFee: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="max-w-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button 
                onClick={handleSavePaySettings} 
                disabled={isSaving}
                className="bg-secondary-500 hover:bg-secondary-600"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Discount Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Duration Settings */}
        <TabsContent value="duration" className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Clock className="w-6 h-6 text-secondary-500" />
              <h2 className="text-xl font-semibold text-neutral-900">Cleaning Duration Settings</h2>
            </div>

            <p className="text-sm text-neutral-600 mb-6">
              Configure how the system calculates the estimated time for each booking. 
              This affects cleaner assignment (1 cleaner per 4 hours).
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Base & Core Room Times */}
              <div className="space-y-6">
                <h3 className="font-semibold text-neutral-900 border-b pb-2">Base & Core Room Times (Minutes)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base-mins">Base Time</Label>
                    <Input
                      id="base-mins"
                      type="number"
                      value={durationSettings.baseMinutes}
                      onChange={(e) => setDurationSettings({ ...durationSettings, baseMinutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-bedroom">Per Bedroom</Label>
                    <Input
                      id="per-bedroom"
                      type="number"
                      value={durationSettings.perBedroom}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perBedroom: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-bathroom">Per Bathroom</Label>
                    <Input
                      id="per-bathroom"
                      type="number"
                      value={durationSettings.perBathroom}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perBathroom: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-toilet">Per Toilet</Label>
                    <Input
                      id="per-toilet"
                      type="number"
                      value={durationSettings.perToilet}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perToilet: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-other">Default Other Room</Label>
                    <Input
                      id="per-other"
                      type="number"
                      value={durationSettings.perOtherRoom}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perOtherRoom: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* Specific Room Times */}
              <div className="space-y-6">
                <h3 className="font-semibold text-neutral-900 border-b pb-2">Specific Room Times (Minutes)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="per-kitchen">Kitchen</Label>
                    <Input
                      id="per-kitchen"
                      type="number"
                      value={durationSettings.perKitchen || 45}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perKitchen: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-living">Living Room</Label>
                    <Input
                      id="per-living"
                      type="number"
                      value={durationSettings.perLivingRoom || 30}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perLivingRoom: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-dining">Dining Room</Label>
                    <Input
                      id="per-dining"
                      type="number"
                      value={durationSettings.perDiningRoom || 20}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perDiningRoom: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-laundry">Laundry Room</Label>
                    <Input
                      id="per-laundry"
                      type="number"
                      value={durationSettings.perLaundryRoom || 20}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perLaundryRoom: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-balcony">Balcony/Patio</Label>
                    <Input
                      id="per-balcony"
                      type="number"
                      value={durationSettings.perBalcony || 20}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perBalcony: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-basement">Basement</Label>
                    <Input
                      id="per-basement"
                      type="number"
                      value={durationSettings.perBasement || 45}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perBasement: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* Kitchen Add-on Times */}
              <div className="space-y-6">
                <h3 className="font-semibold text-neutral-900 border-b pb-2">Kitchen Add-on Times (Minutes)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="per-fridge">Inside Fridge</Label>
                    <Input
                      id="per-fridge"
                      type="number"
                      value={durationSettings.perInsideFridge || 20}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perInsideFridge: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-oven">Inside Oven</Label>
                    <Input
                      id="per-oven"
                      type="number"
                      value={durationSettings.perInsideOven || 25}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perInsideOven: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-microwave">Microwave</Label>
                    <Input
                      id="per-microwave"
                      type="number"
                      value={durationSettings.perMicrowave || 10}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perMicrowave: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-dishes">Dishes</Label>
                    <Input
                      id="per-dishes"
                      type="number"
                      value={durationSettings.perDishes || 20}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perDishes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* Service Add-on Times */}
              <div className="space-y-6">
                <h3 className="font-semibold text-neutral-900 border-b pb-2">Service Add-on Times (Minutes)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="per-basket">Laundry (Per Basket)</Label>
                    <Input
                      id="per-basket"
                      type="number"
                      value={durationSettings.perLaundryBasket || 30}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perLaundryBasket: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-window">Inside Window (Per Window)</Label>
                    <Input
                      id="per-window"
                      type="number"
                      value={durationSettings.perWindow || 15}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perWindow: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-pethair">Pet Hair Removal</Label>
                    <Input
                      id="per-pethair"
                      type="number"
                      value={durationSettings.perPetHair || 30}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perPetHair: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-org">Organization (Per Hour)</Label>
                    <Input
                      id="per-org"
                      type="number"
                      value={durationSettings.perOrganizationHour || 60}
                      onChange={(e) => setDurationSettings({ ...durationSettings, perOrganizationHour: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* Multipliers */}
              <div className="space-y-6">
                <h3 className="font-semibold text-neutral-900 border-b pb-2">Service Multipliers</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="std-mult">Standard Cleaning</Label>
                    <Input
                      id="std-mult"
                      type="number"
                      step="0.1"
                      value={durationSettings.standardCleaningMultiplier}
                      onChange={(e) => setDurationSettings({ ...durationSettings, standardCleaningMultiplier: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deep-mult">Deep Cleaning</Label>
                    <Input
                      id="deep-mult"
                      type="number"
                      step="0.1"
                      value={durationSettings.deepCleaningMultiplier}
                      onChange={(e) => setDurationSettings({ ...durationSettings, deepCleaningMultiplier: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="move-mult">Move In/Out</Label>
                    <Input
                      id="move-mult"
                      type="number"
                      step="0.1"
                      value={durationSettings.moveInOutMultiplier}
                      onChange={(e) => setDurationSettings({ ...durationSettings, moveInOutMultiplier: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-mult">Post-Construction</Label>
                    <Input
                      id="post-mult"
                      type="number"
                      step="0.1"
                      value={durationSettings.postConstructionMultiplier}
                      onChange={(e) => setDurationSettings({ ...durationSettings, postConstructionMultiplier: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button 
                onClick={handleSaveDurationSettings} 
                disabled={isSaving}
                className="bg-secondary-500 hover:bg-secondary-600"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Duration Settings
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
                  value={notificationTemplates.confirmation}
                  onChange={(e) => setNotificationTemplates({ ...notificationTemplates, confirmation: e.target.value })}
                  placeholder="Dear {customer_name}, Your booking for {service_type} on {date} at {time} has been confirmed..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="reminder-template">24h Reminder Template</Label>
                <Textarea
                  id="reminder-template"
                  value={notificationTemplates.reminder}
                  onChange={(e) => setNotificationTemplates({ ...notificationTemplates, reminder: e.target.value })}
                  placeholder="Hi {customer_name}, This is a reminder that your {service_type} is scheduled for tomorrow at {time}..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="completion-template">Service Completion Email</Label>
                <Textarea
                  id="completion-template"
                  value={notificationTemplates.completion}
                  onChange={(e) => setNotificationTemplates({ ...notificationTemplates, completion: e.target.value })}
                  placeholder="Hi {customer_name}, Your cleaning service has been completed. We hope you're satisfied with the results..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="welcome-template">Welcome Email (New User)</Label>
                <Textarea
                  id="welcome-template"
                  value={notificationTemplates.welcome}
                  onChange={(e) => setNotificationTemplates({ ...notificationTemplates, welcome: e.target.value })}
                  placeholder="Dear {customer_name}, Welcome to our platform! Your account has been created and you can now access all our services."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Cleaner Application Templates</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="application-accepted-template">Application Accepted Email</Label>
                    <Textarea
                      id="application-accepted-template"
                      value={notificationTemplates.application_accepted}
                      onChange={(e) => setNotificationTemplates({ ...notificationTemplates, application_accepted: e.target.value })}
                      placeholder="Dear {name}, Congratulations! Your application has been accepted..."
                      rows={4}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="application-rejected-template">Application Rejected Email</Label>
                    <Textarea
                      id="application-rejected-template"
                      value={notificationTemplates.application_rejected}
                      onChange={(e) => setNotificationTemplates({ ...notificationTemplates, application_rejected: e.target.value })}
                      placeholder="Dear {name}, Thank you for your interest..."
                      rows={4}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button 
                onClick={handleSaveNotificationTemplates} 
                disabled={isSaving}
                className="bg-secondary-500 hover:bg-secondary-600"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
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
                <div key={key} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-secondary-200 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      API Key: {integration.apiKey ? '•••••••••••••••' : 'Not configured'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenConfigModal(key, integration.apiKey)}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${integration.enabled ? 'text-green-600' : 'text-neutral-400'}`}>
                        {integration.enabled ? 'ON' : 'OFF'}
                      </span>
                      <Switch
                        checked={integration.enabled}
                        onCheckedChange={(checked: boolean) => {
                          setIntegrations({
                            ...integrations,
                            [key]: { ...integration, enabled: checked }
                          });
                        }}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button 
                onClick={handleSaveIntegrations} 
                disabled={isSaving}
                className="bg-secondary-500 hover:bg-secondary-600"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Integrations
              </Button>
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

      {/* API Key Configuration Modal */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-secondary-500" />
              Configure {currentIntegration.replace(/([A-Z])/g, ' $1').trim()}
            </DialogTitle>
            <DialogDescription>
              Enter your API key for this integration. The key will be securely stored in your settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="text"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="mt-1.5"
              />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>Tip:</strong> Keep your API keys secure. Never share them publicly or commit them to version control.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveApiKey} className="bg-secondary-500 hover:bg-secondary-600">
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}