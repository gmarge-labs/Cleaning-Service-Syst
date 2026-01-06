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

type JobStatus = 'pending' | 'assigned' | 'arrived' | 'in-progress' | 'completed';
type WorkflowStep = 'job-details' | 'payment' | 'review' | 'revision-request';

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
    if (user?.id && (workflowStep as string) !== 'review') {
      fetchActiveJob();
      
      // Poll for updates every 5 seconds (more frequent for real-time updates)
      // but skip polling while user is writing a review or after review is submitted
      const interval = setInterval(() => {
        if ((workflowStep as string) !== 'review') {
          fetchActiveJob(false); // Pass false to avoid showing loader every time
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user?.id, workflowStep]);

  // Also refetch when workflow step changes to ensure data is synced
  // useEffect(() => {
  //   if (user?.id && workflowStep === 'job-details') {
  //     fetchActiveJob(false);
  //   }
  // }, [workflowStep]);

  const fetchActiveJob = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      const response = await fetch(`/api/dashboard/active-job?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setActiveJob(data);
        
        // Map backend status to frontend status
        if (data.status === 'COMPLETED') {
          setJobStatus('completed');
          if (data.isAccepted) {
            // If already accepted, move to review step if no review exists
            if (!data.reviews || data.reviews.length === 0) {
              setWorkflowStep('review');
            } else {
              setWorkflowStep('job-details');
            }
          }
        }
        else if (data.status === 'REVISION_REQUESTED') {
          setJobStatus('revision-requested' as any);
          setWorkflowStep('job-details');
        }
        else if (data.status === 'IN_PROGRESS') {
          setJobStatus('in-progress');
          setShowVerificationModal(false);
        }
        else if (data.status === 'ARRIVED') {
          setJobStatus('arrived');
          setCleanerArrived(true);
          // Force modal to show when cleaner has arrived and provided credentials
          setShowVerificationModal(true);
        }
        else if (data.status === 'CONFIRMED' || (data.claimedBy && data.claimedBy.length > 0)) {
          setJobStatus('assigned');
          setCleanerArrived(false);
        }
        else {
          setJobStatus('pending');
          setCleanerArrived(false);
        }
      } else {
        setActiveJob(null);
      }
    } catch (error) {
      console.error('Error fetching active job:', error);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch (jobStatus) {
      case 'pending':
        return {
          label: 'Finding Cleaners',
          color: 'text-neutral-600',
          bgColor: 'bg-neutral-50',
          borderColor: 'border-neutral-200',
          icon: Clock
        };
      case 'assigned':
        return {
          label: 'Cleaner Assigned',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: User
        };
      case 'arrived':
        return {
          label: 'Cleaner Arrived',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: Bell
        };
      case 'in-progress':
        return {
          label: 'Cleaning in Progress',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: Clock
        };
      case 'revision-requested' as any:
        return {
          label: 'Revision Requested',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertCircle
        };
      case 'completed':
        return {
          label: activeJob?.isAccepted ? 'Work Accepted' : 'Cleaning Completed',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle
        };
      default:
        return {
          label: 'Booking Pending',
          color: 'text-neutral-600',
          bgColor: 'bg-neutral-50',
          borderColor: 'border-neutral-200',
          icon: Clock
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleAcceptWork = async () => {
    try {
      const response = await fetch(`/api/bookings/${displayJob.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isAccepted: true }),
      });

      if (response.ok) {
        // Update local state immediately to reflect acceptance
        setActiveJob((prev: any) => ({ ...prev, isAccepted: true }));
        toast.success('Work accepted! Thank you.');
        setWorkflowStep('review');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to accept work');
      }
    } catch (error) {
      console.error('Error accepting work:', error);
      toast.error('An error occurred while accepting the work');
    }
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

  const handleSubmitRevisionRequest = async () => {
    if (!revisionReason.trim()) {
      toast.error('Please describe the issues that need to be addressed.');
      return;
    }
    if (revisionPhotos.length === 0) {
      toast.error('Please upload at least one photo as proof.');
      return;
    }

    setIsLoading(true);
    try {
      // Convert photos to base64
      const photoPromises = revisionPhotos.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const base64Photos = await Promise.all(photoPromises);

      const response = await fetch(`/api/bookings/${displayJob.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'REVISION_REQUESTED',
          revisionReason: revisionReason,
          revisionPhotos: base64Photos
        }),
      });

      if (response.ok) {
        toast.success('Revision request submitted successfully! The cleaner will be notified.');
        // Reset form
        setRevisionReason('');
        setRevisionPhotos([]);
        setRevisionPhotosPreviews([]);
        setWorkflowStep('job-details');
        fetchActiveJob(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit revision request');
      }
    } catch (error) {
      console.error('Error submitting revision request:', error);
      toast.error('An error occurred while submitting the revision request');
    } finally {
      setIsLoading(false);
    }
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
        // Clear the active job from state so "No active job" message appears
        setActiveJob(null);
        // Reset form fields
        setRating(0);
        setReviewText('');
        // Don't reset workflowStep to prevent polling from re-fetching the job
        // Keep it as 'review' to maintain the disabled polling state
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('An error occurred while submitting your review');
    }
  };

  const handleVerifyAndStartJob = async () => {
    // Check if cleaner provided a code and if it matches
    if (!displayJob.cleanerProvidedCode) {
      toast.error('Cleaner has not provided a verification code yet.');
      return;
    }

    if (displayJob.cleanerProvidedCode !== displayJob.securityCode) {
      toast.error('Verification code mismatch! Please check with the cleaner.');
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${displayJob.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });

      if (response.ok) {
        setShowVerificationModal(false);
        setJobStatus('in-progress');
        setCleanerArrived(false);
        toast.success('Cleaner verified! Job is now in progress.');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Error verifying cleaner:', error);
      toast.error('An error occurred during verification');
    }
  };

  const handleRejectVerification = () => {
    if (confirm('Are you sure you want to reject this cleaner? This will notify support.')) {
      setShowVerificationModal(false);
      setCleanerArrived(false);
      alert('Verification rejected. Support team has been notified.');
    }
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
  const cleaner = activeJob?.claimedBy?.[0] || activeJob?.cleaner || {
    id: 'CLN-001',
    name: 'Assigned Cleaner',
    profileImage: null,
    rating: 4.8,
    totalReviews: 127,
    phone: '+1 (555) 123-4567'
  };

  // Get customer info for review section
  const customer = activeJob?.user || {
    name: 'Guest User',
    profileImage: null
  };

  if (!activeJob) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-neutral-300">
        <Briefcase className="w-12 h-12 text-neutral-300 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900">No Active Jobs</h3>
        <p className="text-neutral-500 max-w-xs text-center mt-2">
          You don't have any cleaning jobs in progress right now.
        </p>
        <Button 
          className="mt-6 bg-secondary-500 hover:bg-secondary-600 text-white"
          onClick={() => window.location.href = '/booking'}
        >
          Book a Cleaning
        </Button>
      </div>
    );
  }

  // Use real data with fallbacks to prevent crashes
  const displayJob = activeJob;

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
                    <p className="text-sm text-neutral-600">Secret Code: <span className="font-bold text-neutral-900">{displayJob.securityCode || 'Pending'}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Progress */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-full h-2 rounded-full ${['assigned', 'arrived', 'in-progress', 'completed'].includes(jobStatus) ? 'bg-blue-500' : 'bg-neutral-200'}`} />
              <div className={`w-full h-2 rounded-full ${['in-progress', 'completed'].includes(jobStatus) ? 'bg-orange-500' : 'bg-neutral-200'}`} />
              <div className={`w-full h-2 rounded-full ${jobStatus === 'completed' ? 'bg-green-500' : 'bg-neutral-200'}`} />
            </div>
            <div className="flex justify-between text-xs text-neutral-600">
              <span>{jobStatus === 'pending' ? 'Finding Cleaners' : 'Assigned'}</span>
              <span>In Progress</span>
              <span>Completed</span>
            </div>
          </div>

          {/* Assigned Cleaners */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Assigned Cleaners</h3>
            <div className="space-y-4">
              {displayJob.claimedBy && displayJob.claimedBy.length > 0 ? (
                displayJob.claimedBy.map((cleaner: any) => (
                  <div key={cleaner.id} className="flex items-center gap-4 p-3 border border-neutral-100 rounded-lg">
                    <img 
                      src={cleaner.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleaner.name)}&background=random`} 
                      alt={cleaner.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">{cleaner.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <IdCard className="w-4 h-4 text-neutral-600" />
                        <span className="text-sm text-neutral-600">ID: {cleaner.id}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
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
              )}
            </div>
            
            {/* Verification Notice for Assigned Status */}
            {jobStatus === 'assigned' && !cleanerArrived && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900 mb-1">Verification Required</p>
                    <p className="text-sm text-blue-800">
                      When the cleaner arrives, they will provide their ID and the secret code ({displayJob.securityCode || 'Pending'}) for you to verify before they begin work.
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

              {displayJob.revisionReason && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900">Revision Reason</p>
                    <p className="text-sm text-red-800">{displayJob.revisionReason}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-600">Service</p>
                  <p className="font-medium text-neutral-900">{displayJob.service || displayJob.serviceType} - ${Number(displayJob.totalAmount).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Completion Actions - Only shown when completed and not yet accepted */}
          {jobStatus === 'completed' && !displayJob.isAccepted && (
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
                  Accept and Leave Feedback
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
                    onCheckedChange={(checked: any) => setEmailNotif(checked as boolean)}
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
                    onCheckedChange={(checked: any) => setSmsNotif(checked as boolean)}
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
                onCheckedChange={(checked: any) => setAgreedToTerms(checked as boolean)}
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

          {/* Customer Info */}
          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg mb-6">
            {customer.profileImage && (
              <img 
                src={customer.profileImage} 
                alt={customer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className={!customer.profileImage ? "flex-1" : ""}>
              <h4 className="font-medium text-neutral-900">{customer.name}</h4>
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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-neutral-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">Verify Cleaner Identity</h3>
                <p className="text-sm text-neutral-600">Please verify the cleaner's credentials before they start</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Cleaner Information */}
              <div className="bg-neutral-50 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-neutral-200">
                  <img 
                    src={displayJob.claimedBy?.[0]?.profileImage || cleaner.photo} 
                    alt={displayJob.claimedBy?.[0]?.name || cleaner.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-secondary-500"
                  />
                  <div>
                    <h4 className="font-bold text-neutral-900">{displayJob.claimedBy?.[0]?.name || cleaner.name}</h4>
                    <p className="text-xs text-neutral-600">Professional Cleaner</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200">
                    <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-secondary-500" />
                      <span className="text-xs font-medium text-neutral-600">Expected Cleaner ID</span>
                    </div>
                    <span className="font-bold text-sm text-neutral-900">{displayJob.claimedBy?.[0]?.id || cleaner.id}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-secondary-500" />
                      <span className="text-xs font-medium text-neutral-600">Expected Secret Code</span>
                    </div>
                    <span className="font-bold text-lg text-secondary-500 tracking-wider">{displayJob.securityCode}</span>
                  </div>

                  <div className="pt-3 border-t border-neutral-100">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">Cleaner Provided Code</span>
                      </div>
                      <span className="font-bold text-lg text-blue-700 tracking-wider">{displayJob.cleanerProvidedCode || 'Waiting...'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Instructions */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-orange-800">
                    <p className="font-semibold mb-1">Verification Check:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Does the cleaner's badge match the <strong>Expected ID</strong>?</li>
                      <li>• Does the <strong>Cleaner Provided Code</strong> match your <strong>Expected Secret Code</strong>?</li>
                      <li>• Does the person match the photo above?</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-neutral-100 flex gap-3">
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