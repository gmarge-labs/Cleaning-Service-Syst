import { useState } from 'react';
import { ArrowLeft, CheckCircle, Upload, X, Eye, EyeOff, User } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner@2.0.3';

interface AddCustomerFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface CustomerFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  profilePhoto: File | null;
  profilePhotoPreview: string;
  
  // Address Information
  streetAddress: string;
  apartmentUnit: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Account Settings
  username: string;
  password: string;
  accountStatus: string;
  customerType: string;
  
  // Additional Information
  howDidYouHear: string;
  specialInstructions: string;
  preferredContactMethod: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function AddCustomerFlow({ onComplete, onCancel }: AddCustomerFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    profilePhoto: null,
    profilePhotoPreview: '',
    streetAddress: '',
    apartmentUnit: '',
    city: '',
    state: '',
    zipCode: '',
    username: '',
    password: '',
    accountStatus: 'active',
    customerType: 'regular',
    howDidYouHear: '',
    specialInstructions: '',
    preferredContactMethod: 'email',
    emailNotifications: true,
    smsNotifications: false,
  });

  const steps = ['Personal Info', 'Address', 'Account Setup', 'Review'];

  const handleInputChange = (field: keyof CustomerFormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profilePhoto: file,
          profilePhotoPreview: reader.result as string,
        });
        toast.success('Profile photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({
        ...formData,
        profilePhoto: null,
        profilePhotoPreview: '',
      });
    }
  };

  const removeFile = () => {
    setFormData({
      ...formData,
      profilePhoto: null,
      profilePhotoPreview: '',
    });
    toast.success('Profile photo removed successfully!');
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
    toast.success('Secure password generated successfully!');
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Progress saved!');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = () => {
    toast.success('Customer added successfully! Welcome to the family!', {
      duration: 4000,
    });
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Enter the customer's personal information to create their account.
            </p>
          </div>

          {/* Profile Photo */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Profile Photo <span className="text-neutral-400">(Optional)</span>
            </label>
            {formData.profilePhotoPreview ? (
              <div className="relative w-32 h-32">
                <img
                  src={formData.profilePhotoPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover rounded-full border-4 border-neutral-200"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-neutral-300 rounded-full cursor-pointer hover:border-secondary-500 hover:bg-neutral-50 transition-colors">
                <Upload className="w-8 h-8 text-neutral-400 mb-1" />
                <p className="text-xs text-neutral-600">Upload Photo</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                placeholder="John"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                placeholder="john.doe@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Date of Birth <span className="text-neutral-400">(Optional)</span>
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
            />
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Enter the customer's service address where cleanings will take place.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.streetAddress}
              onChange={(e) => handleInputChange('streetAddress', e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              placeholder="123 Main Street"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Apartment / Unit <span className="text-neutral-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.apartmentUnit}
              onChange={(e) => handleInputChange('apartmentUnit', e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              placeholder="Apt 4B, Suite 200, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                placeholder="New York"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                required
              >
                <option value="">Select State</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                placeholder="10001"
                maxLength={5}
                required
              />
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Set up login credentials and account preferences for the customer.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Username (Email) <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.username || formData.email}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              placeholder="customer@example.com"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              Pre-filled with email address from Step 1
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent pr-10"
                  placeholder="Enter temporary password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button
                type="button"
                onClick={generatePassword}
                variant="outline"
                className="px-4"
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Customer will be prompted to change this on first login
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Account Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.accountStatus}
                onChange={(e) => handleInputChange('accountStatus', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Customer Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.customerType}
                onChange={(e) => handleInputChange('customerType', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              >
                <option value="regular">Regular</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              How did you hear about us? <span className="text-neutral-400">(Optional)</span>
            </label>
            <select
              value={formData.howDidYouHear}
              onChange={(e) => handleInputChange('howDidYouHear', e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
            >
              <option value="">Select an option</option>
              <option value="google">Google Search</option>
              <option value="social">Social Media</option>
              <option value="referral">Friend/Family Referral</option>
              <option value="advertisement">Advertisement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Preferred Contact Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={'p-4 border-2 rounded-lg cursor-pointer transition-all ' + (formData.preferredContactMethod === 'email' ? 'border-secondary-500 bg-secondary-50' : 'border-neutral-300 hover:border-neutral-400')}>
                <input
                  type="radio"
                  value="email"
                  checked={formData.preferredContactMethod === 'email'}
                  onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">Email</span>
              </label>
              <label className={'p-4 border-2 rounded-lg cursor-pointer transition-all ' + (formData.preferredContactMethod === 'sms' ? 'border-secondary-500 bg-secondary-50' : 'border-neutral-300 hover:border-neutral-400')}>
                <input
                  type="radio"
                  value="sms"
                  checked={formData.preferredContactMethod === 'sms'}
                  onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">SMS/Text</span>
              </label>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-neutral-700">Email Notifications</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.smsNotifications}
                  onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-neutral-700">SMS Notifications</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Special Instructions <span className="text-neutral-400">(Optional)</span>
            </label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              rows={4}
              placeholder="Any special notes about the customer or their preferences..."
            />
          </div>
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Review all information before adding the customer to the system.
            </p>
          </div>

          <div className="border-t border-neutral-200 pt-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Customer Summary</h3>
            
            {/* Profile Photo and Name */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-200">
              {formData.profilePhotoPreview ? (
                <img
                  src={formData.profilePhotoPreview}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-neutral-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary-500 to-primary-600 flex items-center justify-center text-white">
                  <User className="w-10 h-10" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-neutral-600">{formData.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-600">Phone Number</p>
                <p className="font-medium text-neutral-900">{formData.phoneNumber}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-600">Date of Birth</p>
                <p className="font-medium text-neutral-900">{formData.dateOfBirth || 'Not provided'}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg md:col-span-2">
                <p className="text-sm text-neutral-600">Address</p>
                <p className="font-medium text-neutral-900">
                  {formData.streetAddress}
                  {formData.apartmentUnit && `, ${formData.apartmentUnit}`}
                  <br />
                  {formData.city}, {formData.state} {formData.zipCode}
                </p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-600">Account Status</p>
                <p className="font-medium text-neutral-900">
                  {formData.accountStatus === 'active' ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-neutral-600">Inactive</span>
                  )}
                </p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-600">Customer Type</p>
                <p className="font-medium text-neutral-900">
                  {formData.customerType === 'vip' ? (
                    <span className="text-purple-600">VIP</span>
                  ) : (
                    <span className="text-neutral-900">Regular</span>
                  )}
                </p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-600">Preferred Contact</p>
                <p className="font-medium text-neutral-900 capitalize">{formData.preferredContactMethod}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-600">Notifications</p>
                <p className="font-medium text-neutral-900">
                  {formData.emailNotifications && 'Email'}
                  {formData.emailNotifications && formData.smsNotifications && ', '}
                  {formData.smsNotifications && 'SMS'}
                  {!formData.emailNotifications && !formData.smsNotifications && 'None'}
                </p>
              </div>
              {formData.howDidYouHear && (
                <div className="bg-neutral-50 p-4 rounded-lg md:col-span-2">
                  <p className="text-sm text-neutral-600">How They Heard About Us</p>
                  <p className="font-medium text-neutral-900 capitalize">{formData.howDidYouHear}</p>
                </div>
              )}
              {formData.specialInstructions && (
                <div className="bg-neutral-50 p-4 rounded-lg md:col-span-2">
                  <p className="text-sm text-neutral-600">Special Instructions</p>
                  <p className="font-medium text-neutral-900">{formData.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Ready to add!</strong> Click "Add Customer" below to create this customer account.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-xl text-neutral-900">Add New Customer</h1>
              <p className="text-sm text-neutral-600">Step {currentStep + 1} of {steps.length}</p>
            </div>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Customers</span>
            </button>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        index < currentStep
                          ? 'bg-green-500 border-green-500 text-white'
                          : index === currentStep
                          ? 'bg-secondary-500 border-secondary-500 text-white'
                          : 'bg-white border-neutral-300 text-neutral-400'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 ${
                        index <= currentStep ? 'text-neutral-900 font-medium' : 'text-neutral-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        index < currentStep ? 'bg-green-500' : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">{steps[currentStep]}</h2>
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 0}
              className="px-8"
            >
              Previous
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                className="bg-secondary-500 hover:bg-secondary-600 px-8 ml-auto"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="px-8 bg-green-600 hover:bg-green-700 ml-auto"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
