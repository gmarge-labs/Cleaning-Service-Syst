import { useState } from 'react';
import { ArrowLeft, CheckCircle, Upload, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { ProgressIndicator } from '../booking/ProgressIndicator';
import { toast } from 'sonner@2.0.3';

interface CleanerOnboardingFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface CleanerFormData {
  // Step 1: Personal Information
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  profilePhoto: File | null;
  profilePhotoPreview: string;
  
  // Step 2: Address & Location
  homeAddress: string;
  city: string;
  state: string;
  zipCode: string;
  workRadius: string;
  
  // Step 3: Identity Verification
  idType: string;
  idNumber: string;
  idExpiration: string;
  idFront: File | null;
  idFrontPreview: string;
  idBack: File | null;
  idBackPreview: string;
  ssn: string;
  backgroundCheckStatus: string;
  
  // Step 4: Emergency Contact
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  
  // Step 5: Employment Details
  cleanerType: string;
  availableDays: string[];
  availableTimeSlots: string[];
  workPreferences: string[];
  yearsExperience: string;
  spokenLanguages: string[];
  
  // Step 6: Payment Details
  paymentMethod: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  bankName: string;
  accountType: string;
  paypalEmail: string;
  cashappTag: string;
  venmoUsername: string;
  
  // Step 7: Documents
  bgCheckCert: File | null;
  bgCheckCertName: string;
  trainingCerts: File[];
  trainingCertsNames: string[];
  insurance: File | null;
  insuranceName: string;
  workPermit: File | null;
  workPermitName: string;
  
  // Step 8: Tools & Materials
  assignedTools: string[];
  toolIssueDate: string;
  vacuumSerial: string;
  mopSerial: string;
  chemicalsSerial: string;
  uniformSerial: string;
  glovesSerial: string;
  idCardSerial: string;
  
  // Step 9: System Access
  username: string;
  tempPassword: string;
  role: string;
  
  // Step 10: Status
  activeStatus: string;
  approvalStatus: string;
  finalBgCheckStatus: string;
}

const STEPS = [
  'Personal Info',
  'Address',
  'Verification',
  'Emergency Contact',
  'Employment',
  'Payment',
  'Documents',
  'Tools',
  'System Access',
  'Review',
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function CleanerOnboardingFlow({ onComplete, onCancel }: CleanerOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CleanerFormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    profilePhoto: null,
    profilePhotoPreview: '',
    homeAddress: '',
    city: '',
    state: '',
    zipCode: '',
    workRadius: '10',
    idType: 'drivers_license',
    idNumber: '',
    idExpiration: '',
    idFront: null,
    idFrontPreview: '',
    idBack: null,
    idBackPreview: '',
    ssn: '',
    backgroundCheckStatus: 'pending',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    cleanerType: 'employee',
    availableDays: [],
    availableTimeSlots: [],
    workPreferences: [],
    yearsExperience: '0',
    spokenLanguages: [],
    paymentMethod: 'bank',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bankName: '',
    accountType: 'checking',
    paypalEmail: '',
    cashappTag: '',
    venmoUsername: '',
    bgCheckCert: null,
    bgCheckCertName: '',
    trainingCerts: [],
    trainingCertsNames: [],
    insurance: null,
    insuranceName: '',
    workPermit: null,
    workPermitName: '',
    assignedTools: [],
    toolIssueDate: '',
    vacuumSerial: '',
    mopSerial: '',
    chemicalsSerial: '',
    uniformSerial: '',
    glovesSerial: '',
    idCardSerial: '',
    username: '',
    tempPassword: '',
    role: 'Cleaner',
    activeStatus: 'active',
    approvalStatus: 'approved',
    finalBgCheckStatus: 'pending',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof CleanerFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleArrayChange = (field: keyof CleanerFormData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    setFormData({ ...formData, [field]: newArray });
  };

  const handleDocumentUpload = (field: keyof CleanerFormData, file: File | null, nameField: keyof CleanerFormData) => {
    setFormData({
      ...formData,
      [field]: file,
      [nameField]: file ? file.name : '',
    });
    if (file) {
      toast.success('Document uploaded successfully!');
    } else {
      toast.success('Document removed successfully!');
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, tempPassword: password });
    toast.success('Secure password generated successfully!');
  };

  const handleFileChange = (field: keyof CleanerFormData, file: File | null, previewField: keyof CleanerFormData) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          [field]: file,
          [previewField]: reader.result as string,
        });
        toast.success('File uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({
        ...formData,
        [field]: null,
        [previewField]: '',
      });
    }
  };

  const removeFile = (field: keyof CleanerFormData, previewField: keyof CleanerFormData) => {
    setFormData({
      ...formData,
      [field]: null,
      [previewField]: '',
    });
    toast.success('File removed successfully!');
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
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
    toast.success('Cleaner onboarded successfully! Welcome to the team!', {
      duration: 2000,
    });
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              placeholder="Enter full legal name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Gender <span className="text-neutral-400">(Optional)</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Profile Photo
            </label>
            <div className="space-y-3">
              {formData.profilePhotoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={formData.profilePhotoPreview}
                    alt="Profile preview"
                    className="w-32 h-32 object-cover rounded-full border-2 border-neutral-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile('profilePhoto', 'profilePhotoPreview')}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-secondary-500 hover:bg-neutral-50 transition-colors">
                  <div className="flex flex-col items-center justify-center py-6">
                    <Upload className="w-10 h-10 text-neutral-400 mb-2" />
                    <p className="text-sm text-neutral-600">Click to upload profile photo</p>
                    <p className="text-xs text-neutral-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange('profilePhoto', e.target.files?.[0] || null, 'profilePhotoPreview')}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Home Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.homeAddress}
              onChange={(e) => handleInputChange('homeAddress', e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              placeholder="123 Main Street, Apt 4B"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                placeholder="City"
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
                <option value="">Select</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Zip Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                placeholder="12345"
                maxLength={5}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Preferred Work Radius <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-neutral-500 mb-3">
              Distance you are willing to travel for jobs (helps with automatic assignment)
            </p>
            <div className="space-y-3">
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={formData.workRadius}
                onChange={(e) => handleInputChange('workRadius', e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">5 miles</span>
                <span className="text-lg font-semibold text-secondary-500">{formData.workRadius} miles</span>
                <span className="text-sm text-neutral-600">50 miles</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your work radius helps us automatically assign jobs near your location. You can always update this later in your settings.
            </p>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Identity verification is required</strong> to meet U.S. employment and safety standards.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Government ID Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.idType}
              onChange={(e) => handleInputChange('idType', e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              required
            >
              <option value="drivers_license">Driver's License</option>
              <option value="state_id">State ID</option>
              <option value="passport">Passport</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                placeholder="ID number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Expiration Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.idExpiration}
                onChange={(e) => handleInputChange('idExpiration', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                ID Front <span className="text-red-500">*</span>
              </label>
              {formData.idFrontPreview ? (
                <div className="relative">
                  <img
                    src={formData.idFrontPreview}
                    alt="ID front"
                    className="w-full h-48 object-cover rounded-lg border-2 border-neutral-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile('idFront', 'idFrontPreview')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-secondary-500 hover:bg-neutral-50 transition-colors">
                  <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-600">Upload ID Front</p>
                  <p className="text-xs text-neutral-400 mt-1">PNG, JPG up to 10MB</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange('idFront', e.target.files?.[0] || null, 'idFrontPreview')}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                ID Back <span className="text-red-500">*</span>
              </label>
              {formData.idBackPreview ? (
                <div className="relative">
                  <img
                    src={formData.idBackPreview}
                    alt="ID back"
                    className="w-full h-48 object-cover rounded-lg border-2 border-neutral-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile('idBack', 'idBackPreview')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-secondary-500 hover:bg-neutral-50 transition-colors">
                  <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-600">Upload ID Back</p>
                  <p className="text-xs text-neutral-400 mt-1">PNG, JPG up to 10MB</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange('idBack', e.target.files?.[0] || null, 'idBackPreview')}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-6 mt-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Optional Information</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Social Security Number <span className="text-neutral-400">(Optional - for background checks)</span>
                </label>
                <input
                  type="password"
                  value={formData.ssn}
                  onChange={(e) => handleInputChange('ssn', e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Encrypted and stored securely. Only used for employment verification and background checks.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Background Check Status
                </label>
                <select
                  value={formData.backgroundCheckStatus}
                  onChange={(e) => handleInputChange('backgroundCheckStatus', e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="clear">Clear</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Emergency contact information is required for safety purposes and will only be used in case of emergencies.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.emergencyName}
              onChange={(e) => handleInputChange('emergencyName', e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              placeholder="Emergency contact full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.emergencyPhone}
              onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              placeholder="(555) 123-4567"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Relationship <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.emergencyRelationship}
              onChange={(e) => handleInputChange('emergencyRelationship', e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              required
            >
              <option value="">Select relationship</option>
              <option value="spouse">Spouse</option>
              <option value="partner">Partner</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="child">Child</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      );
    }

    if (currentStep === 4) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const timeSlots = ['Morning (6am-12pm)', 'Afternoon (12pm-6pm)', 'Evening (6pm-10pm)'];
      const services = [
        { id: 'residential', label: 'Residential Cleaning' },
        { id: 'office', label: 'Office Cleaning' },
        { id: 'deep', label: 'Deep Cleaning' },
        { id: 'move', label: 'Move-in/Move-out Cleaning' },
        { id: 'construction', label: 'Post-construction Cleaning' },
      ];
      const languages = ['English', 'Spanish', 'French', 'Chinese', 'Vietnamese', 'Korean', 'Arabic', 'Other'];

      return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Cleaner Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={'p-4 border-2 rounded-lg cursor-pointer transition-all ' + (formData.cleanerType === 'employee' ? 'border-secondary-500 bg-secondary-50' : 'border-neutral-300 hover:border-neutral-400')}>
                <input
                  type="radio"
                  value="employee"
                  checked={formData.cleanerType === 'employee'}
                  onChange={(e) => handleInputChange('cleanerType', e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">Employee</span>
                <p className="text-sm text-neutral-600 mt-1 ml-6">W-2 employee with benefits</p>
              </label>
              <label className={'p-4 border-2 rounded-lg cursor-pointer transition-all ' + (formData.cleanerType === 'contractor' ? 'border-secondary-500 bg-secondary-50' : 'border-neutral-300 hover:border-neutral-400')}>
                <input
                  type="radio"
                  value="contractor"
                  checked={formData.cleanerType === 'contractor'}
                  onChange={(e) => handleInputChange('cleanerType', e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">Independent Contractor</span>
                <p className="text-sm text-neutral-600 mt-1 ml-6">1099 contractor</p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Available Days <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {days.map((day) => (
                <label key={day} className={'p-3 border-2 rounded-lg cursor-pointer transition-all text-center ' + (formData.availableDays.includes(day) ? 'border-secondary-500 bg-secondary-50' : 'border-neutral-300 hover:border-neutral-400')}>
                  <input
                    type="checkbox"
                    checked={formData.availableDays.includes(day)}
                    onChange={() => handleArrayChange('availableDays', day)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Available Time Slots <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {timeSlots.map((slot) => (
                <label key={slot} className={'p-3 border-2 rounded-lg cursor-pointer transition-all text-center ' + (formData.availableTimeSlots.includes(slot) ? 'border-secondary-500 bg-secondary-50' : 'border-neutral-300 hover:border-neutral-400')}>
                  <input
                    type="checkbox"
                    checked={formData.availableTimeSlots.includes(slot)}
                    onChange={() => handleArrayChange('availableTimeSlots', slot)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{slot}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Work Preferences (Services) <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {services.map((service) => (
                <label key={service.id} className={'flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ' + (formData.workPreferences.includes(service.id) ? 'border-secondary-500 bg-secondary-50' : 'border-neutral-300 hover:border-neutral-400')}>
                  <input
                    type="checkbox"
                    checked={formData.workPreferences.includes(service.id)}
                    onChange={() => handleArrayChange('workPreferences', service.id)}
                    className="mr-3"
                  />
                  <span className="font-medium">{service.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.yearsExperience}
                onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Spoken Languages <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-neutral-300 rounded-lg p-3">
                {languages.map((lang) => (
                  <label key={lang} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.spokenLanguages.includes(lang)}
                      onChange={() => handleArrayChange('spokenLanguages', lang)}
                      className="mr-2"
                    />
                    <span className="text-sm">{lang}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 5) {
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={'p-4 border-2 rounded-lg cursor-pointer transition-all ' + (formData.paymentMethod === 'bank' ? 'border-secondary-500 bg-secondary-50' : 'border-neutral-300 hover:border-neutral-400')}>
                <input
                  type="radio"
                  value="bank"
                  checked={formData.paymentMethod === 'bank'}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">Bank Account (ACH)</span>
              </label>
              <label className={'p-4 border-2 rounded-lg cursor-pointer transition-all ' + (formData.paymentMethod === 'digital' ? 'border-secondary-500 bg-secondary-50' : 'border-neutral-300 hover:border-neutral-400')}>
                <input
                  type="radio"
                  value="digital"
                  checked={formData.paymentMethod === 'digital'}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">Digital Payment</span>
              </label>
            </div>
          </div>

          {formData.paymentMethod === 'bank' && (
            <div className="space-y-6 border border-neutral-200 rounded-lg p-6 bg-neutral-50">
              <h3 className="font-semibold text-neutral-900">Bank Account Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent bg-white"
                  placeholder="Bank of America, Chase, Wells Fargo, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Routing Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankRoutingNumber}
                    onChange={(e) => handleInputChange('bankRoutingNumber', e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent bg-white"
                    placeholder="9 digits"
                    maxLength={9}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent bg-white"
                    placeholder="Account number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => handleInputChange('accountType', e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent bg-white"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
            </div>
          )}

          {formData.paymentMethod === 'digital' && (
            <div className="space-y-6 border border-neutral-200 rounded-lg p-6 bg-neutral-50">
              <h3 className="font-semibold text-neutral-900">Digital Payment Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  PayPal Email
                </label>
                <input
                  type="email"
                  value={formData.paypalEmail}
                  onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent bg-white"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  CashApp Tag
                </label>
                <input
                  type="text"
                  value={formData.cashappTag}
                  onChange={(e) => handleInputChange('cashappTag', e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent bg-white"
                  placeholder="$username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Venmo Username
                </label>
                <input
                  type="text"
                  value={formData.venmoUsername}
                  onChange={(e) => handleInputChange('venmoUsername', e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent bg-white"
                  placeholder="@username"
                />
              </div>

              <p className="text-xs text-neutral-500">
                Fill in at least one digital payment option.
              </p>
            </div>
          )}
        </div>
      );
    }

    if (currentStep === 6) {
      return (
        <div className="space-y-6">
          <p className="text-sm text-neutral-600">
            Upload relevant documents for verification and compliance. All files are securely stored and encrypted.
          </p>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Background Check Certificate
            </label>
            <p className="text-xs text-neutral-500 mb-2">If background check was done externally</p>
            <label className="flex items-center justify-between w-full p-4 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-secondary-500 hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-neutral-400" />
                <span className="text-sm text-neutral-700">
                  {formData.bgCheckCertName || 'Choose file...'}
                </span>
              </div>
              {formData.bgCheckCertName && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDocumentUpload('bgCheckCert', null, 'bgCheckCertName');
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleDocumentUpload('bgCheckCert', e.target.files?.[0] || null, 'bgCheckCertName')}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Training Certificates
            </label>
            <p className="text-xs text-neutral-500 mb-2">Professional cleaning training or certifications</p>
            <label className="flex items-center justify-between w-full p-4 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-secondary-500 hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-neutral-400" />
                <span className="text-sm text-neutral-700">
                  {formData.trainingCertsNames.length > 0 ? formData.trainingCertsNames.length + ' file(s) selected' : 'Choose files...'}
                </span>
              </div>
              <input
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const names = files.map(f => f.name);
                  setFormData({ ...formData, trainingCerts: files, trainingCertsNames: names });
                  if (files.length > 0) {
                    toast.success(files.length + ' training certificate(s) uploaded successfully!');
                  }
                }}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Insurance Certificate
            </label>
            <p className="text-xs text-neutral-500 mb-2">For contractors who need liability coverage</p>
            <label className="flex items-center justify-between w-full p-4 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-secondary-500 hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-neutral-400" />
                <span className="text-sm text-neutral-700">
                  {formData.insuranceName || 'Choose file...'}
                </span>
              </div>
              {formData.insuranceName && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDocumentUpload('insurance', null, 'insuranceName');
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleDocumentUpload('insurance', e.target.files?.[0] || null, 'insuranceName')}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Work Permit
            </label>
            <p className="text-xs text-neutral-500 mb-2">For non-U.S. citizens</p>
            <label className="flex items-center justify-between w-full p-4 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-secondary-500 hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-neutral-400" />
                <span className="text-sm text-neutral-700">
                  {formData.workPermitName || 'Choose file...'}
                </span>
              </div>
              {formData.workPermitName && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDocumentUpload('workPermit', null, 'workPermitName');
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleDocumentUpload('workPermit', e.target.files?.[0] || null, 'workPermitName')}
              />
            </label>
          </div>
        </div>
      );
    }

    if (currentStep === 7) {
      const tools = [
        { id: 'vacuum', label: 'Vacuum' },
        { id: 'mopBucket', label: 'Mop & Bucket' },
        { id: 'chemicals', label: 'Cleaning Chemicals' },
        { id: 'uniform', label: 'Uniform' },
        { id: 'gloves', label: 'Gloves' },
        { id: 'idCard', label: 'ID Card' },
      ];

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Select the tools and materials being provided to this cleaner. This section is optional.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Assigned Tools & Materials
            </label>
            <div className="space-y-2">
              {tools.map((tool) => (
                <label key={tool.id} className={'flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ' + (formData.assignedTools.includes(tool.id) ? 'border-secondary-500 bg-secondary-50' : 'border-neutral-300 hover:border-neutral-400')}>
                  <input
                    type="checkbox"
                    checked={formData.assignedTools.includes(tool.id)}
                    onChange={() => handleArrayChange('assignedTools', tool.id)}
                    className="mr-3"
                  />
                  <span className="font-medium">{tool.label}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.assignedTools.length > 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formData.toolIssueDate}
                  onChange={(e) => handleInputChange('toolIssueDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                />
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Serial Numbers (if applicable)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.assignedTools.includes('vacuum') && (
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">Vacuum Serial</label>
                      <input
                        type="text"
                        value={formData.vacuumSerial}
                        onChange={(e) => handleInputChange('vacuumSerial', e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                    </div>
                  )}
                  {formData.assignedTools.includes('mopBucket') && (
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">Mop & Bucket Serial</label>
                      <input
                        type="text"
                        value={formData.mopSerial}
                        onChange={(e) => handleInputChange('mopSerial', e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                    </div>
                  )}
                  {formData.assignedTools.includes('chemicals') && (
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">Chemicals Serial</label>
                      <input
                        type="text"
                        value={formData.chemicalsSerial}
                        onChange={(e) => handleInputChange('chemicalsSerial', e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                    </div>
                  )}
                  {formData.assignedTools.includes('uniform') && (
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">Uniform Serial</label>
                      <input
                        type="text"
                        value={formData.uniformSerial}
                        onChange={(e) => handleInputChange('uniformSerial', e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                    </div>
                  )}
                  {formData.assignedTools.includes('gloves') && (
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">Gloves Serial</label>
                      <input
                        type="text"
                        value={formData.glovesSerial}
                        onChange={(e) => handleInputChange('glovesSerial', e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                    </div>
                  )}
                  {formData.assignedTools.includes('idCard') && (
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">ID Card Number</label>
                      <input
                        type="text"
                        value={formData.idCardSerial}
                        onChange={(e) => handleInputChange('idCardSerial', e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    if (currentStep === 8) {
      return (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Create system access credentials for the cleaner to log into the mobile app and view assigned jobs.
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
              placeholder="username@company.com"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              This will be pre-filled with the email address from Step 1
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
                  value={formData.tempPassword}
                  onChange={(e) => handleInputChange('tempPassword', e.target.value)}
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
              The cleaner will be prompted to change this password on first login
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Role
            </label>
            <input
              type="text"
              value={formData.role}
              disabled
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-600 cursor-not-allowed"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Send these credentials to the cleaner via secure channel. They will need them to access the mobile app.
            </p>
          </div>
        </div>
      );
    }

    if (currentStep === 9) {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Review all information and set the cleaner's initial status. You can change these settings later.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Active Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.activeStatus}
                onChange={(e) => handleInputChange('activeStatus', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Active cleaners can receive job assignments
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Approval Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.approvalStatus}
                onChange={(e) => handleInputChange('approvalStatus', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Background Check Status
              </label>
              <select
                value={formData.finalBgCheckStatus}
                onChange={(e) => handleInputChange('finalBgCheckStatus', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="clear">Clear</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Last Updated
              </label>
              <input
                type="text"
                value={new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()}
                disabled
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Review Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-neutral-600">Full Name</p>
                <p className="font-medium text-neutral-900">{formData.fullName || 'Not provided'}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-neutral-600">Email</p>
                <p className="font-medium text-neutral-900">{formData.email || 'Not provided'}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-neutral-600">Phone</p>
                <p className="font-medium text-neutral-900">{formData.phoneNumber || 'Not provided'}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-neutral-600">Cleaner Type</p>
                <p className="font-medium text-neutral-900">{formData.cleanerType === 'employee' ? 'Employee' : 'Contractor'}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-neutral-600">Work Preferences</p>
                <p className="font-medium text-neutral-900">{formData.workPreferences.length || '0'} selected</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-neutral-600">Years Experience</p>
                <p className="font-medium text-neutral-900">{formData.yearsExperience} years</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-neutral-600">Payment Method</p>
                <p className="font-medium text-neutral-900">{formData.paymentMethod === 'bank' ? 'Bank Account' : 'Digital Payment'}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-neutral-600">Assigned Tools</p>
                <p className="font-medium text-neutral-900">{formData.assignedTools.length || '0'} items</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Ready to complete!</strong> Click "Complete Onboarding" below to add this cleaner to the system.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <p className="text-neutral-600">Content for step {currentStep + 1} will be implemented here.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-xl text-neutral-900">Onboard New Cleaner</h1>
              <p className="text-sm text-neutral-600">Step {currentStep + 1} of {STEPS.length}</p>
            </div>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Cleaners</span>
            </button>
          </div>
        </div>
        
        <ProgressIndicator currentStep={currentStep} steps={STEPS} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">{STEPS[currentStep]}</h2>
            {renderStepContent()}
          </div>

          <div className="flex justify-between gap-4">
            {currentStep > 0 && (
              <Button onClick={prevStep} variant="outline" className="px-8">
                Back
              </Button>
            )}
            {currentStep < STEPS.length - 1 ? (
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
                Complete Onboarding
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}