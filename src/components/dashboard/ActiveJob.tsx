import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  Clock, 
  User, 
  Star, 
  MapPin, 
  Calendar, 
  DollarSign,
  Image as ImageIcon,
  X,
  ThumbsUp,
  ThumbsDown,
  Shield,
  AlertCircle,
  CreditCard,
  Briefcase,
  Key,
  IdCard,
  Bell,
  Upload,
  FileImage,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

type JobStatus = 'assigned' | 'in-progress' | 'completed';
type WorkflowStep = 'job-details' | 'payment' | 'review' | 'revision-request';

interface CompletionPhoto {
  id: string;
  url: string;
  caption?: string;
}

export function ActiveJob() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>('assigned');
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('job-details');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [cleanerArrived, setCleanerArrived] = useState(false);
  
  // Revision request states
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionPhotos, setRevisionPhotos] = useState<File[]>([]);
  const [revisionPhotosPreviews, setRevisionPhotosPreviews] = useState<string[]>([]);
  
  // Payment form states - matching booking flow
  const [paymentMethod, setPaymentMethod] = useState<string>('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchActiveJob();
    }
  }, [user?.id]);

  const fetchActiveJob = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard/active-job?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setActiveJob(data);
        // Map backend status to frontend status
        if (data.status === 'COMPLETED') setJobStatus('completed');
        else if (data.status === 'CONFIRMED') setJobStatus('in-progress');
        else setJobStatus('assigned');
      } else {
        setActiveJob(null);
        setJobStatus('completed'); // Default to completed for the mock job
      }
    } catch (error) {
      console.error('Error fetching active job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate random 6-digit secret code (in production, this would come from backend)
  const generateSecretCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const getStatusInfo = () => {
    switch (jobStatus) {
      case 'assigned':
        return {
          label: 'Cleaner Assigned',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: User
        };
      case 'in-progress':
        return {
          label: 'Cleaning in Progress',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: Clock
        };
      case 'completed':
        return {
          label: 'Cleaning Completed',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleAcceptWork = () => {
    setWorkflowStep('review');
  };

  const handleRejectWork = () => {
    setWorkflowStep('revision-request');
  };

  const handleRevisionPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setRevisionPhotos(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setRevisionPhotosPreviews(previews);
  };

  const handleRemoveRevisionPhoto = (index: number) => {
    const newPhotos = revisionPhotos.filter((_, i) => i !== index);
    const newPreviews = revisionPhotosPreviews.filter((_, i) => i !== index);
    setRevisionPhotos(newPhotos);
    setRevisionPhotosPreviews(newPreviews);
  };

  const handleSubmitRevisionRequest = () => {
    if (!revisionReason.trim()) {
      alert('Please describe the issues that need to be addressed.');
      return;
    }
    if (revisionPhotos.length === 0) {
      alert('Please upload at least one photo as proof.');
      return;
    }
    alert('Revision request submitted successfully! The cleaner will be notified.');
    // Reset form
    setRevisionReason('');
    setRevisionPhotos([]);
    setRevisionPhotosPreviews([]);
    setWorkflowStep('job-details');
  };

  const handlePaymentComplete = () => {
    setWorkflowStep('review');
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bookingId: displayJob.id,
          rating,
          comment: reviewText,
          userId: user?.id,
        }),
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
        // Reset to overview or completed state
        setWorkflowStep('job-details');
        setRating(0);
        setReviewText('');
        // Refresh active job (it should be gone now since it has a review)
        fetchActiveJob();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('An error occurred while submitting your review');
    }
  };

  const handleVerifyAndStartJob = () => {
    setShowVerificationModal(false);
    setJobStatus('in-progress');
    setCleanerArrived(false);
    alert('Cleaner verified! Job is now in progress.');
  };

  const handleRejectVerification = () => {
    if (confirm('Are you sure you want to reject this cleaner? This will notify support.')) {
      setShowVerificationModal(false);
      setCleanerArrived(false);
      alert('Verification rejected. Support team has been notified.');
    }
  };

  // Simulate cleaner arriving (in production, this would be triggered by cleaner app)
  const simulateCleanerArrival = () => {
    setCleanerArrived(true);
    setShowVerificationModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-secondary-500 animate-spin mb-4" />
        <p className="text-neutral-600">Loading active job...</p>
      </div>
    );
  }

  // Mock cleaner data if not present in activeJob
  const cleaner = activeJob?.cleaner || {
    id: 'CLN-001',
    name: 'Sarah Johnson',
    photo: 'https://i.pravatar.cc/150?img=5',
    rating: 4.8,
    totalReviews: 127,
    phone: '+1 (555) 123-4567'
  };

  // Mock completion photos if not present
  const completionPhotos = activeJob?.completionPhotos || [
    { id: '1', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', caption: 'Living room cleaned' },
    { id: '2', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', caption: 'Kitchen area' },
    { id: '3', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', caption: 'Bathroom sparkling' },
    { id: '4', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', caption: 'Bedroom organized' }
  ];

  // Use real data with fallbacks to prevent crashes
  const displayJob = activeJob || {
    id: `BK-${user?.id?.slice(-4) || 'DEMO'}-${new Date().getTime().toString().slice(-4)}`,
    customerId: user?.id || 'user004',
    date: 'Dec 25, 2025',
    time: '4:00 PM',
    address: '123 Sparkle Lane, Clean City, NY 10001',
    service: 'Deep Cleaning',
    totalAmount: 200.00,
    status: 'COMPLETED'
  };

  return (
    <div className="space-y-6">
      {/* Job Details View */}
      {workflowStep === 'job-details' && (
        <>
          {/* Status Card */}
          <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-2 rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 ${statusInfo.bgColor} rounded-full flex items-center justify-center`}>
                <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${statusInfo.color}`}>{statusInfo.label}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-neutral-600" />
                    <p className="text-sm text-neutral-600">Secret Code: <span className="font-bold text-neutral-900">{displayJob.id}</span></p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IdCard className="w-4 h-4 text-neutral-600" />
                    <p className="text-sm text-neutral-600">Customer ID: <span className="font-medium text-neutral-900">{displayJob.customerId || displayJob.userId}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Progress */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-full h-2 rounded-full ${jobStatus === 'assigned' || jobStatus === 'in-progress' || jobStatus === 'completed' ? 'bg-blue-500' : 'bg-neutral-200'}`} />
              <div className={`w-full h-2 rounded-full ${jobStatus === 'in-progress' || jobStatus === 'completed' ? 'bg-orange-500' : 'bg-neutral-200'}`} />
              <div className={`w-full h-2 rounded-full ${jobStatus === 'completed' ? 'bg-green-500' : 'bg-neutral-200'}`} />
            </div>
            <div className="flex justify-between text-xs text-neutral-600">
              <span>Assigned</span>
              <span>In Progress</span>
              <span>Completed</span>
            </div>

            {/* Quick Actions for Testing */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button 
                onClick={() => setJobStatus('assigned')} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Set Assigned
              </Button>
              <Button 
                onClick={simulateCleanerArrival} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Simulate Arrival
              </Button>
              <Button 
                onClick={() => setJobStatus('in-progress')} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Set In Progress
              </Button>
              <Button 
                onClick={() => setJobStatus('completed')} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Set Completed
              </Button>
            </div>
          </div>

          {/* Assigned Cleaner */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Assigned Cleaner</h3>
            <div className="flex items-center gap-4">
              <img 
                src={cleaner.photo} 
                alt={cleaner.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-neutral-900">{cleaner.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <IdCard className="w-4 h-4 text-neutral-600" />
                  <span className="text-sm text-neutral-600">ID: {cleaner.id}</span>
                </div>
              </div>
            </div>
            
            {/* Verification Notice for Assigned Status */}
            {jobStatus === 'assigned' && !cleanerArrived && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900 mb-1">Verification Required</p>
                    <p className="text-sm text-blue-800">
                      When the cleaner arrives, they will provide their ID ({cleaner.id}) and the secret code ({displayJob.id}) for you to verify before they begin work.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Pending Verification Alert */}
            {cleanerArrived && jobStatus === 'assigned' && (
              <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg animate-pulse">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <p className="font-semibold text-orange-900">Cleaner has arrived! Please verify their identity.</p>
                </div>
              </div>
            )}
          </div>

          {/* Job Information */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Job Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-600">Date & Time</p>
                  <p className="font-medium text-neutral-900">
                    {typeof displayJob.date === 'string' ? displayJob.date : new Date(displayJob.date).toLocaleDateString()} at {displayJob.time}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-600">Location</p>
                  <p className="font-medium text-neutral-900">{displayJob.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-600">Service</p>
                  <p className="font-medium text-neutral-900">{displayJob.service || displayJob.serviceType} - ${Number(displayJob.totalAmount).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Completion Actions - Only shown when completed */}
          {jobStatus === 'completed' && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              {/* Accept/Reject Actions */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">Review the completed work</p>
                  <p className="text-sm text-neutral-600">Please confirm the cleaning is complete or request revisions within 24 hours</p>
                </div>
              </div>

              {/* Revision Policy Notice */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-6">
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-orange-900 mb-1">24-Hour Revision Policy</p>
                    <p className="text-sm text-orange-800">
                      You have 24 hours from the completion time ({displayJob.time}) to request any revisions. After this period, the job will be automatically marked as accepted.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleAcceptWork}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Accept
                </Button>
                <Button 
                  onClick={handleRejectWork}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Request Revision
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment View */}
      {workflowStep === 'payment' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">Payment Details</h2>
              <p className="text-neutral-600">Secure payment processing with end-to-end encryption</p>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-sm font-semibold text-green-900">Secure Payment</div>
                <div className="text-xs text-green-700">256-bit SSL encryption • PCI DSS compliant</div>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                <TabsTrigger value="debit-card">Debit Card</TabsTrigger>
              </TabsList>

              <TabsContent value="credit-card" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="card-number">Card Number *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="card-number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="pl-10"
                    />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date *</Label>
                    <Input
                      id="expiry"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      type="password"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="card-name">Cardholder Name *</Label>
                  <Input
                    id="card-name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1.5"
                  />
                </div>
              </TabsContent>

              <TabsContent value="debit-card" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="debit-card-number">Card Number *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="debit-card-number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="pl-10"
                    />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="debit-expiry">Expiry Date *</Label>
                    <Input
                      id="debit-expiry"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="debit-cvv">CVV *</Label>
                    <Input
                      id="debit-cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      type="password"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="debit-card-name">Cardholder Name *</Label>
                  <Input
                    id="debit-card-name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1.5"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Payment Breakdown */}
            <div className="border-t border-neutral-200 pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Deposit Paid at Booking</span>
                <span className="text-green-600 font-medium">-${(Number(displayJob.totalAmount) * 0.2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-200">
                <span className="font-semibold text-neutral-900">Balance Due</span>
                <span className="font-bold text-2xl text-secondary-500">${(Number(displayJob.totalAmount) * 0.8).toFixed(2)}</span>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <h4 className="font-semibold text-orange-900">Cancellation Policy</h4>
              </div>
              <ul className="text-sm text-orange-800 space-y-1 ml-7">
                <li>• Free cancellation up to 24 hours before service</li>
                <li>• 50% charge for cancellations within 24 hours</li>
                <li>• 100% charge for no-shows</li>
              </ul>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Notification Preferences</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-notif"
                    checked={emailNotif}
                    onCheckedChange={(checked) => setEmailNotif(checked as boolean)}
                  />
                  <label
                    htmlFor="email-notif"
                    className="text-sm text-neutral-700 cursor-pointer"
                  >
                    Email notifications (confirmations, reminders)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms-notif"
                    checked={smsNotif}
                    onCheckedChange={(checked) => setSmsNotif(checked as boolean)}
                  />
                  <label
                    htmlFor="sms-notif"
                    className="text-sm text-neutral-700 cursor-pointer"
                  >
                    SMS notifications (24h and 2h reminders)
                  </label>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm text-neutral-700 cursor-pointer leading-relaxed"
              >
                I agree to the{' '}
                <button className="text-secondary-500 hover:underline">Terms & Conditions</button>,{' '}
                <button className="text-secondary-500 hover:underline">Privacy Policy</button>, and{' '}
                <button className="text-secondary-500 hover:underline">Cancellation Policy</button> *
              </label>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              onClick={() => setWorkflowStep('job-details')}
              variant="outline"
              className="px-8"
            >
              Back
            </Button>
            <Button
              onClick={handlePaymentComplete}
              disabled={!cardNumber || !expiryDate || !cvv || !cardName || !agreedToTerms}
              className="bg-secondary-500 hover:bg-secondary-600 px-8"
            >
              Complete Payment - ${(Number(displayJob.totalAmount) * 0.8).toFixed(2)}
            </Button>
          </div>
        </div>
      )}

      {/* Revision Request View */}
      {workflowStep === 'revision-request' && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <ThumbsDown className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">Request Revision</h3>
              <p className="text-sm text-neutral-600">Please describe the issues and provide proof</p>
            </div>
          </div>

          {/* Revision Policy Notice */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-6">
            <div className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900 mb-1">24-Hour Revision Policy</p>
                <p className="text-sm text-orange-800">
                  Revision requests must be submitted within 24 hours from the completion time ({displayJob.time} on {typeof displayJob.date === 'string' ? displayJob.date : new Date(displayJob.date).toLocaleDateString()}). Photo proof is required for all revision requests.
                </p>
              </div>
            </div>
          </div>

          {/* Revision Reason */}
          <div className="mb-6">
            <label className="block font-medium text-neutral-900 mb-2">Describe the Issues *</label>
            <textarea 
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="Please provide detailed description of what needs to be corrected..."
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 min-h-[120px] resize-none"
            />
            <p className="text-xs text-neutral-500 mt-1">{revisionReason.length}/500 characters</p>
          </div>

          {/* Photo Upload */}
          <div className="mb-6">
            <label className="block font-medium text-neutral-900 mb-2">Upload Proof Photos *</label>
            <p className="text-sm text-neutral-600 mb-3">Please upload photos showing the areas that need revision</p>
            
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-secondary-500 transition-colors">
              <input
                type="file"
                id="revision-photos"
                accept="image/*"
                multiple
                onChange={handleRevisionPhotosChange}
                className="hidden"
              />
              <label htmlFor="revision-photos" className="cursor-pointer">
                <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-900 font-medium mb-1">Click to upload photos</p>
                <p className="text-sm text-neutral-600">PNG, JPG up to 10MB each</p>
              </label>
            </div>

            {/* Photo Previews */}
            {revisionPhotosPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {revisionPhotosPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Revision proof ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveRevisionPhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {revisionPhotos.length > 0 && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <FileImage className="w-4 h-4" />
                {revisionPhotos.length} photo(s) selected
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                setWorkflowStep('job-details');
                setRevisionReason('');
                setRevisionPhotos([]);
                setRevisionPhotosPreviews([]);
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRevisionRequest}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              Submit Revision Request
            </Button>
          </div>
        </div>
      )}

      {/* Review View */}
      {workflowStep === 'review' && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">Rate Your Experience</h3>
              <p className="text-sm text-neutral-600">How was your cleaning service?</p>
            </div>
          </div>

          {/* Cleaner Info */}
          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg mb-6">
            <img 
              src={cleaner.photo} 
              alt={cleaner.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h4 className="font-medium text-neutral-900">{cleaner.name}</h4>
              <p className="text-sm text-neutral-600">{displayJob.service || displayJob.serviceType}</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block font-medium text-neutral-900 mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-neutral-600 mt-2">
                {rating === 5 && 'Excellent!'}
                {rating === 4 && 'Very Good!'}
                {rating === 3 && 'Good'}
                {rating === 2 && 'Fair'}
                {rating === 1 && 'Poor'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block font-medium text-neutral-900 mb-2">Your Review (Optional)</label>
            <textarea 
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share details of your experience..."
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 min-h-[120px] resize-none"
            />
            <p className="text-xs text-neutral-500 mt-1">{reviewText.length}/500 characters</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                setWorkflowStep('job-details');
                setRating(0);
                setReviewText('');
              }}
              variant="outline"
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button 
              onClick={handleSubmitReview}
              className="flex-1 bg-secondary-500 hover:bg-secondary-600"
            >
              Submit Review
            </Button>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button 
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img 
            src={selectedPhoto} 
            alt="Completion photo"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowVerificationModal(false);
            setCleanerArrived(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Verify Cleaner Identity</h3>
              <p className="text-neutral-600">Please verify the cleaner's credentials before they start</p>
            </div>

            {/* Cleaner Information */}
            <div className="bg-neutral-50 rounded-xl p-6 mb-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-neutral-200">
                <img 
                  src={cleaner.photo} 
                  alt={cleaner.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-secondary-500"
                />
                <div>
                  <h4 className="font-bold text-lg text-neutral-900">{cleaner.name}</h4>
                  <p className="text-sm text-neutral-600">Professional Cleaner</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <IdCard className="w-5 h-5 text-secondary-500" />
                    <span className="text-sm font-medium text-neutral-600">Cleaner ID</span>
                  </div>
                  <span className="font-bold text-neutral-900">{cleaner.id}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-secondary-500" />
                    <span className="text-sm font-medium text-neutral-600">Secret Code</span>
                  </div>
                  <span className="font-bold text-2xl text-secondary-500 tracking-wider">{displayJob.id}</span>
                </div>
              </div>
            </div>

            {/* Verification Instructions */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-semibold mb-1">Please verify:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Check the cleaner's ID matches: {cleaner.id}</li>
                    <li>• Confirm they can provide secret code: {displayJob.id}</li>
                    <li>• Verify the person matches their photo</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleRejectVerification}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                Reject
              </Button>
              <Button 
                onClick={handleVerifyAndStartJob}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify & Start
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}