import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, DollarSign, Phone, MessageSquare, Navigation, CheckCircle, AlertCircle, Package, Key, IdCard, Shield, Send, ListChecks } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Job } from './CleanerApp';
import { toast } from 'sonner@2.0.3';

interface JobDetailsProps {
  job: Job;
  isClockIn: boolean;
  onBack: () => void;
  onCompleteJob: () => void;
  onClaimJob: (jobId: string) => void;
}

export function JobDetails({ job, isClockIn, onBack, onCompleteJob, onClaimJob }: JobDetailsProps) {
  const [isClockedIn, setIsClockedIn] = useState(isClockIn);
  const [startTime, setStartTime] = useState<Date | null>(isClockIn ? new Date() : null);
  const [hasArrived, setHasArrived] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [securityCodeInput, setSecurityCodeInput] = useState('');
  const [cleanerIdInput, setCleanerIdInput] = useState('');
  const [showTaskList, setShowTaskList] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Generate cleaner ID and security code (in production, these would come from backend)
  const cleanerId = 'CLN-12845';
  const jobSecurityCode = '4738';

  // Define cleaning tasks based on service type
  const getCleaningTasks = () => {
    const commonTasks = [
      'Dust all surfaces',
      'Vacuum all floors',
      'Mop hard floors',
      'Empty trash bins',
      'Wipe down light switches and door handles',
    ];

    const kitchenTasks = [
      'Clean and sanitize countertops',
      'Clean appliances (microwave, stove, refrigerator)',
      'Clean sink and faucet',
      'Wipe down cabinets',
      'Clean backsplash',
    ];

    const bathroomTasks = [
      'Clean and sanitize toilet',
      'Clean shower/tub',
      'Clean sink and countertop',
      'Clean mirrors',
      'Scrub tiles and grout',
      'Replace towels',
    ];

    const bedroomTasks = [
      'Make beds',
      'Dust furniture',
      'Organize items',
      'Clean mirrors',
      'Vacuum under beds',
    ];

    let tasks = [...commonTasks];

    if (job.serviceType.toLowerCase().includes('deep')) {
      tasks = [
        ...tasks,
        ...kitchenTasks,
        ...bathroomTasks,
        ...bedroomTasks,
        'Clean baseboards',
        'Wipe down walls',
        'Clean windows and window sills',
        'Dust ceiling fans and light fixtures',
        'Clean inside cabinets',
      ];
    } else if (job.serviceType.toLowerCase().includes('standard')) {
      tasks = [
        ...tasks,
        'Wipe kitchen counters',
        'Clean bathroom surfaces',
        'Tidy up living areas',
        'Dust furniture',
      ];
    }

    // Add add-on specific tasks
    if (job.addOns) {
      job.addOns.forEach(addon => {
        if (addon.toLowerCase().includes('window')) {
          tasks.push('Clean all windows inside and out');
        }
        if (addon.toLowerCase().includes('oven')) {
          tasks.push('Deep clean oven');
        }
        if (addon.toLowerCase().includes('fridge')) {
          tasks.push('Clean inside refrigerator');
        }
        if (addon.toLowerCase().includes('laundry')) {
          tasks.push('Wash and fold laundry');
        }
      });
    }

    return tasks;
  };

  const cleaningTasks = getCleaningTasks();

  const handleArrival = () => {
    setHasArrived(true);
    setShowVerificationModal(true);
  };

  const handleClaimJob = () => {
    onClaimJob(job.id);
    toast.success('🎉 Congratulations! You have successfully claimed this job!', {
      description: `${job.serviceType} at ${job.address}`,
      duration: 2000,
    });
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  const handleSendToCustomer = () => {
    // Validate inputs
    if (!securityCodeInput || !cleanerIdInput) {
      toast.error('Please enter both Security Code and Cleaner ID');
      return;
    }

    if (securityCodeInput !== jobSecurityCode) {
      toast.error('Invalid Security Code');
      return;
    }

    if (cleanerIdInput !== cleanerId) {
      toast.error('Invalid Cleaner ID');
      return;
    }

    // Success - send to customer and start job
    toast.success('✅ Verification Sent to Customer!', {
      description: 'Job started. Timer is now running.',
      duration: 2000,
    });
    
    setShowVerificationModal(false);
    setIsClockedIn(true);
    setStartTime(new Date());
    setShowTaskList(true);
    setSecurityCodeInput('');
    setCleanerIdInput('');
  };

  const handleCloseModal = () => {
    setShowVerificationModal(false);
    setSecurityCodeInput('');
    setCleanerIdInput('');
  };

  const handleGetDirections = () => {
    if (job.lat && job.lng) {
      // Open in maps app
      window.open(`https://maps.google.com/?q=${job.lat},${job.lng}`, '_blank');
    }
  };

  const handleToggleTask = (task: string) => {
    if (completedTasks.includes(task)) {
      setCompletedTasks(completedTasks.filter(t => t !== task));
    } else {
      setCompletedTasks([...completedTasks, task]);
      toast.success('Task completed!', {
        description: task,
        duration: 2000,
      });
    }
  };

  const getElapsedTime = () => {
    if (!startTime) return '0:00';
    const now = new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  // Check if all tasks are completed
  const allTasksCompleted = completedTasks.length === cleaningTasks.length && cleaningTasks.length > 0;

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-accent-500 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{job.customer}</h1>
            <p className="text-sm text-white/80">{job.id}</p>
          </div>
          <Badge
            className={
              isClockedIn
                ? 'bg-green-500 text-white'
                : 'bg-white/20 text-white'
            }
          >
            {isClockedIn ? 'In Progress' : 'Not Started'}
          </Badge>
        </div>

        {/* Timer */}
        {isClockedIn && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-center">
              <div className="text-xs text-white/80 mb-1">Time Elapsed</div>
              <div className="text-3xl font-bold font-mono">{getElapsedTime()}</div>
              <div className="text-xs text-white/80 mt-1">Expected: {job.duration}</div>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showTaskList ? (
          /* Cleaning Task Checklist */
          <>
            {/* Progress Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-green-700" />
                  <span className="font-semibold text-green-900">Task Progress</span>
                </div>
                <span className="text-2xl font-bold text-green-700">
                  {completedTasks.length}/{cleaningTasks.length}
                </span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-600 to-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(completedTasks.length / cleaningTasks.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Task Checklist */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
              <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-secondary-500" />
                Cleaning Checklist
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {cleaningTasks.map((task, index) => {
                  const isCompleted = completedTasks.includes(task);
                  return (
                    <button
                      key={index}
                      onClick={() => handleToggleTask(task)}
                      className="flex items-start gap-2 p-3 rounded-lg hover:bg-neutral-50 transition-colors text-left border border-neutral-200"
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-neutral-300 bg-white'
                      }`}>
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className={`flex-1 text-sm ${isCompleted ? 'text-neutral-500 line-through' : 'text-neutral-900'}`}>
                        {task}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions - Show if exists */}
            {job.instructions && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <h2 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Special Instructions
                </h2>
                <p className="text-sm text-orange-800">{job.instructions}</p>
              </div>
            )}
          </>
        ) : (
          /* Job Details View (Before Task List) */
          <>
            {/* Location Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
              <h2 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary-500" />
                Location
              </h2>
              <div className="space-y-2">
                <p className="text-neutral-900">{job.address}</p>
                {job.unit && (
                  <p className="text-neutral-600">{job.unit}</p>
                )}
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={handleGetDirections}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
              <h2 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary-500" />
                Schedule
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-neutral-600 mb-1">Start Time</div>
                  <div className="font-semibold text-neutral-900">{job.startTime}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600 mb-1">End Time</div>
                  <div className="font-semibold text-neutral-900">{job.endTime}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-neutral-600 mb-1">Duration</div>
                  <div className="font-semibold text-neutral-900">{job.duration}</div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
              <h2 className="font-semibold text-neutral-900 mb-3">Service Details</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-neutral-600 mb-1">Service Type</div>
                  <div className="font-semibold text-neutral-900">{job.serviceType}</div>
                </div>
                
                {job.addOns && job.addOns.length > 0 && (
                  <div>
                    <div className="text-sm text-neutral-600 mb-2">Add-ons</div>
                    <div className="flex flex-wrap gap-2">
                      {job.addOns.map((addon, index) => (
                        <Badge key={index} variant="secondary" className="bg-secondary-100 text-secondary-700">
                          {addon}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-neutral-600 mb-1">Payment</div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-neutral-900">${job.payment.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {job.instructions && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <h2 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Special Instructions
                </h2>
                <p className="text-sm text-orange-800">{job.instructions}</p>
              </div>
            )}

            {/* Required Supplies */}
            {job.supplies && job.supplies.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                <h2 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-secondary-500" />
                  Required Supplies
                </h2>
                <div className="space-y-2">
                  {job.supplies.map((supply, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border-2 border-neutral-300 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-neutral-900">{supply}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="bg-white border-t border-neutral-200 p-4 space-y-3">
        {/* For Available Jobs - Show Claim Button */}
        {job.isAvailableJob && !isClockIn ? (
          <Button
            className="w-full h-14 bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-lg font-semibold"
            onClick={handleClaimJob}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Claim Job
          </Button>
        ) : !isClockedIn ? (
          <Button
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-lg font-semibold"
            onClick={handleArrival}
          >
            <Navigation className="w-5 h-5 mr-2" />
            Arrive
          </Button>
        ) : (
          <>
            <Button
              className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onCompleteJob}
              disabled={!allTasksCompleted}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete Job
            </Button>
            {!allTasksCompleted ? (
              <p className="text-xs text-center text-orange-600 font-medium">
                Please complete all {cleaningTasks.length} tasks to finish the job
              </p>
            ) : (
              <p className="text-xs text-center text-neutral-600">
                You'll be asked to upload photos and submit a report
              </p>
            )}
          </>
        )}
      </div>

      {/* Verification Info Modal */}
      {showVerificationModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Arrival Verification</h3>
              <p className="text-neutral-600">Enter your credentials to verify arrival</p>
            </div>

            {/* Display Credentials */}
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl p-6 mb-6 text-white">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-white/80 mb-2">Job Security Code</div>
                  <div className="flex items-center justify-center gap-3">
                    <Key className="w-8 h-8" />
                    <div className="text-5xl font-bold tracking-widest font-mono">{jobSecurityCode}</div>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <div className="text-center">
                    <div className="text-sm text-white/80 mb-2">Your Cleaner ID</div>
                    <div className="flex items-center justify-center gap-3">
                      <IdCard className="w-8 h-8" />
                      <div className="text-3xl font-bold tracking-wider">{cleanerId}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Enter Security Code
                </label>
                <input
                  type="text"
                  value={securityCodeInput}
                  onChange={(e) => setSecurityCodeInput(e.target.value)}
                  placeholder="Enter 4-digit code"
                  maxLength={4}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Enter Your Cleaner ID
                </label>
                <input
                  type="text"
                  value={cleanerIdInput}
                  onChange={(e) => setCleanerIdInput(e.target.value)}
                  placeholder="Enter Cleaner ID"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-center text-lg font-medium"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 text-center">
                Enter both codes to send verification to the customer and start the job timer
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleSendToCustomer}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white text-base font-semibold"
              >
                <Send className="w-5 h-5 mr-2" />
                Send to Customer
              </Button>
              <Button 
                onClick={handleCloseModal}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}