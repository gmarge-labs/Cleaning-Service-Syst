import { useState } from 'react';
import { ArrowLeft, CheckCircle, Briefcase, User, MapPin, Phone, FileText, Upload, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { ProgressIndicator } from '../components/booking/ProgressIndicator';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '../components/ui/scroll-reveal';

interface ApplicationFormData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  
  // Step 2: Address Details
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Step 3: Identification
  ssn: string;
  idUrl: string;
  
  // Step 4: References
  reference1Name: string;
  reference1Phone: string;
  reference1Relationship: string;
  reference1RelationshipOther: string;
  reference1Address: string;
  reference1City: string;
  reference1State: string;
  reference2Name: string;
  reference2Phone: string;
  reference2Relationship: string;
  reference2RelationshipOther: string;
  reference2Address: string;
  reference2City: string;
  reference2State: string;
  
  // Step 5: Agreements
  agreedToBackgroundCheck: boolean;
  agreedToTerms: boolean;
}

const STEPS = [
  'Personal Info',
  'Address',
  'Identification',
  'References',
  'Review',
];

const RELATIONSHIP_OPTIONS = [
  'Former Supervisor',
  'Former Colleague',
  'Manager',
  'Friend',
  'Family Member',
  'Other'
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function ApplicationFormPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    ssn: '',
    idUrl: '',
    reference1Name: '',
    reference1Phone: '',
    reference1Relationship: '',
    reference1RelationshipOther: '',
    reference1Address: '',
    reference1City: '',
    reference1State: '',
    reference2Name: '',
    reference2Phone: '',
    reference2Relationship: '',
    reference2RelationshipOther: '',
    reference2Address: '',
    reference2City: '',
    reference2State: '',
    agreedToBackgroundCheck: false,
    agreedToTerms: false,
  });

  const handleInputChange = (field: keyof ApplicationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/cleaners/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      toast.success('Application submitted successfully!', {
        description: 'We\'ll review your application and get back to you within 2-3 business days.',
      });
      
      // Navigate back to careers page after a short delay
      setTimeout(() => {
        navigate('/careers');
      }, 2000);
    } catch (error) {
      console.error('Submit application error:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl">Personal Information</h2>
                <p className="text-neutral-600">Let's start with your basic details</p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    className="mt-1.5 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    className="mt-1.5 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john.doe@example.com"
                    className="mt-1.5 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="mt-1.5 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="mt-1.5 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value: string) => handleInputChange('gender', value)}>
                    <SelectTrigger className="mt-1.5 bg-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Address Details
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl">Address Details</h2>
                <p className="text-neutral-600">Where are you located?</p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main Street"
                    className="mt-1.5 bg-white"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="New York"
                      className="mt-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(value: string) => handleInputChange('state', value)}>
                      <SelectTrigger className="mt-1.5 bg-white">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code (Optional)</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="10001"
                      className="mt-1.5 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Identification
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl">Identification</h2>
                <p className="text-neutral-600">Please provide your identification details</p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="ssn">Social Security Number</Label>
                  <Input
                    id="ssn"
                    type="text"
                    value={formData.ssn}
                    onChange={(e) => handleInputChange('ssn', e.target.value)}
                    placeholder="123-45-6789"
                    className="mt-1.5 bg-white"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Your SSN will be kept confidential.
                  </p>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <Label className="mb-2 block">Form of Identification</Label>
                  <p className="text-sm text-neutral-600 mb-4">
                    Please upload a clear photo or scan of your ID (Driver's License, Passport, or State ID).
                  </p>
                  
                  <div className="space-y-4">
                    {formData.idUrl ? (
                      <div className="relative inline-block">
                        {formData.idUrl.startsWith('data:image') ? (
                          <img
                            src={formData.idUrl}
                            alt="ID Preview"
                            className="w-full max-w-md h-48 object-cover rounded-lg border border-neutral-200"
                          />
                        ) : (
                          <div className="w-full max-w-md h-48 flex items-center justify-center bg-neutral-100 rounded-lg border border-neutral-200">
                            <FileText className="w-12 h-12 text-neutral-400" />
                            <span className="ml-2 text-sm text-neutral-600">Document Uploaded</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleInputChange('idUrl', '')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-secondary-500 hover:bg-secondary-50/30 transition-all group">
                        <div className="flex flex-col items-center justify-center py-6">
                          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-secondary-100 transition-colors">
                            <Upload className="w-6 h-6 text-neutral-400 group-hover:text-secondary-500" />
                          </div>
                          <p className="text-sm font-medium text-neutral-700">Click to upload ID</p>
                          <p className="text-xs text-neutral-400 mt-1">PNG, JPG, PDF up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleInputChange('idUrl', reader.result as string);
                                toast.success('ID uploaded successfully!');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // References
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl">References</h2>
                <p className="text-neutral-600">Provide contact information for your references</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Reference 1 */}
              <div className="p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200">
                <h3 className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-secondary-500 text-white flex items-center justify-center">
                    1
                  </div>
                  <span>Reference 1</span>
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reference1Name">Full Name</Label>
                      <Input
                        id="reference1Name"
                        value={formData.reference1Name}
                        onChange={(e) => handleInputChange('reference1Name', e.target.value)}
                        placeholder="Jane Smith"
                        className="mt-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reference1Phone">Phone Number</Label>
                      <Input
                        id="reference1Phone"
                        type="tel"
                        value={formData.reference1Phone}
                        onChange={(e) => handleInputChange('reference1Phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="mt-1.5 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reference1Relationship">Relationship</Label>
                    <Select value={formData.reference1Relationship} onValueChange={(value: string) => handleInputChange('reference1Relationship', value)}>
                      <SelectTrigger className="mt-1.5 bg-white">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.reference1Relationship === 'Other' && (
                    <div>
                      <Label htmlFor="reference1RelationshipOther">Please specify</Label>
                      <Input
                        id="reference1RelationshipOther"
                        value={formData.reference1RelationshipOther}
                        onChange={(e) => handleInputChange('reference1RelationshipOther', e.target.value)}
                        placeholder="Specify relationship"
                        className="mt-1.5 bg-white"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="reference1Address">Street Address</Label>
                    <Input
                      id="reference1Address"
                      value={formData.reference1Address}
                      onChange={(e) => handleInputChange('reference1Address', e.target.value)}
                      placeholder="123 Main Street"
                      className="mt-1.5 bg-white"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reference1City">City</Label>
                      <Input
                        id="reference1City"
                        value={formData.reference1City}
                        onChange={(e) => handleInputChange('reference1City', e.target.value)}
                        placeholder="New York"
                        className="mt-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reference1State">State</Label>
                      <Select value={formData.reference1State} onValueChange={(value: string) => handleInputChange('reference1State', value)}>
                        <SelectTrigger className="mt-1.5 bg-white">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference 2 */}
              <div className="p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200">
                <h3 className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-accent-500 text-white flex items-center justify-center">
                    2
                  </div>
                  <span>Reference 2 <span className="text-sm text-neutral-500">(Optional)</span></span>
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reference2Name">Full Name</Label>
                      <Input
                        id="reference2Name"
                        value={formData.reference2Name}
                        onChange={(e) => handleInputChange('reference2Name', e.target.value)}
                        placeholder="John Brown"
                        className="mt-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reference2Phone">Phone Number</Label>
                      <Input
                        id="reference2Phone"
                        type="tel"
                        value={formData.reference2Phone}
                        onChange={(e) => handleInputChange('reference2Phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="mt-1.5 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reference2Relationship">Relationship</Label>
                    <Select value={formData.reference2Relationship} onValueChange={(value: string) => handleInputChange('reference2Relationship', value)}>
                      <SelectTrigger className="mt-1.5 bg-white">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.reference2Relationship === 'Other' && (
                    <div>
                      <Label htmlFor="reference2RelationshipOther">Please specify</Label>
                      <Input
                        id="reference2RelationshipOther"
                        value={formData.reference2RelationshipOther}
                        onChange={(e) => handleInputChange('reference2RelationshipOther', e.target.value)}
                        placeholder="Specify relationship"
                        className="mt-1.5 bg-white"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="reference2Address">Street Address</Label>
                    <Input
                      id="reference2Address"
                      value={formData.reference2Address}
                      onChange={(e) => handleInputChange('reference2Address', e.target.value)}
                      placeholder="123 Main Street"
                      className="mt-1.5 bg-white"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reference2City">City</Label>
                      <Input
                        id="reference2City"
                        value={formData.reference2City}
                        onChange={(e) => handleInputChange('reference2City', e.target.value)}
                        placeholder="New York"
                        className="mt-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reference2State">State</Label>
                      <Select value={formData.reference2State} onValueChange={(value: string) => handleInputChange('reference2State', value)}>
                        <SelectTrigger className="mt-1.5 bg-white">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Review & Submit
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl">Review & Submit</h2>
                <p className="text-neutral-600">Review your information and submit your application</p>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="p-6 bg-neutral-50 rounded-xl">
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <p><span className="text-neutral-600">Name:</span> {formData.firstName} {formData.lastName}</p>
                  <p><span className="text-neutral-600">Email:</span> {formData.email}</p>
                  <p><span className="text-neutral-600">Phone:</span> {formData.phone}</p>
                  <p><span className="text-neutral-600">Date of Birth:</span> {formData.dateOfBirth}</p>
                  <p><span className="text-neutral-600">Gender:</span> {formData.gender}</p>
                </div>
              </div>

              <div className="p-6 bg-neutral-50 rounded-xl">
                <h3 className="font-semibold mb-3">Address</h3>
                <p className="text-sm">
                  {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
                </p>
              </div>

              <div className="p-6 bg-neutral-50 rounded-xl">
                <h3 className="font-semibold mb-3">Identification</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-neutral-600">SSN:</span> {formData.ssn || 'Not provided'}</p>
                  <p>
                    <span className="text-neutral-600">ID Document:</span>{' '}
                    {formData.idUrl ? (
                      <span className="text-green-600 font-medium flex items-center gap-1 inline-flex">
                        <CheckCircle className="w-4 h-4" /> Uploaded
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">Not uploaded</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-neutral-50 rounded-xl">
                <h3 className="font-semibold mb-3">References</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-neutral-600">Reference 1:</span> {formData.reference1Name}, {formData.reference1Phone}, {formData.reference1Relationship}
                  </p>
                  <p className="text-sm">
                    <span className="text-neutral-600">Address:</span> {formData.reference1Address}, {formData.reference1City}, {formData.reference1State}
                  </p>
                  {formData.reference2Name && (
                    <>
                      <p className="text-sm">
                        <span className="text-neutral-600">Reference 2:</span> {formData.reference2Name}, {formData.reference2Phone}, {formData.reference2Relationship}
                      </p>
                      <p className="text-sm">
                        <span className="text-neutral-600">Address:</span> {formData.reference2Address}, {formData.reference2City}, {formData.reference2State}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-4 p-6 bg-gradient-to-br from-secondary-50 to-accent-50 rounded-xl border border-secondary-200">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="backgroundCheck"
                  checked={formData.agreedToBackgroundCheck}
                  onCheckedChange={(checked: boolean) => handleInputChange('agreedToBackgroundCheck', checked)}
                />
                <label htmlFor="backgroundCheck" className="text-sm text-neutral-700 cursor-pointer leading-relaxed">
                  I consent to a background check and understand it's required for employment *
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked: boolean) => handleInputChange('agreedToTerms', checked)}
                />
                <label htmlFor="terms" className="text-sm text-neutral-700 cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <button type="button" className="text-secondary-500 hover:underline">
                    Terms & Conditions
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-secondary-500 hover:underline">
                    Privacy Policy
                  </button>{' '}
                  *
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/careers')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Careers
          </button>
          <ScrollReveal variant="fade-up" className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl mb-4">Join Our Team</h1>
            <p className="text-xl text-secondary-100">
              Complete your application in just a few steps
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ProgressIndicator steps={STEPS} currentStep={currentStep} />
        </div>
      </div>

      {/* Form Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal 
              key={currentStep} 
              variant="fade-up" 
              duration={0.5}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
            >
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={currentStep === 0}
                  className="px-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white px-8"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                )}
              </div>
            </ScrollReveal>

            {/* Help Text */}
            <ScrollReveal variant="fade-up" delay={0.3}>
              <div className="mt-6 text-center text-sm text-neutral-600">
                <p>Need help? Contact us at <a href="mailto:careers@sparkle-ville.com" className="text-secondary-500 hover:underline">careers@sparkle-ville.com</a></p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}