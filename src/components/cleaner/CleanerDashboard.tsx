import { useState } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Navigation, MessageSquare, User, LogOut, ChevronRight, Star, TrendingUp, Users, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Job, CleanerView } from './CleanerApp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { BottomNavigation } from './BottomNavigation';

interface CleanerDashboardProps {
  onSelectJob: (job: Job) => void;
  onStartJob: (job: Job) => void;
  onClaimJob: (jobId: string) => void;
  claimedJobs: string[];
  onLogout: () => void;
  onNavigateToMessages: () => void;
  onNavigateToProfile: () => void;
  onNavigateToEarnings: () => void;
  onNavigateToNotifications: () => void;
}

// Mock data
const availableJobs: Job[] = [
  {
    id: 'JOB-001',
    customer: 'Sarah Johnson',
    address: '123 Main St, Apt 4B, New York, NY 10001',
    serviceType: 'Deep Cleaning',
    date: new Date(),
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    duration: '3 hours',
    status: 'upcoming',
    payment: 189.00,
    requiredCleaners: 2,
    isAvailableJob: true,
    instructions: 'Please focus on kitchen and bathrooms. Pet-friendly products preferred.',
    addOns: ['Inside Fridge', 'Inside Oven'],
    supplies: ['All-purpose cleaner', 'Microfiber cloths', 'Vacuum'],
    lat: 40.7580,
    lng: -73.9855,
  },
  {
    id: 'JOB-002',
    customer: 'Michael Chen',
    address: '456 Oak Ave, Suite 12, Los Angeles, CA 90001',
    serviceType: 'Standard Cleaning',
    date: new Date(),
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    duration: '2 hours',
    status: 'upcoming',
    payment: 120.00,
    requiredCleaners: 1,
    isAvailableJob: true,
    instructions: 'Key under mat. Please lock up when done.',
    supplies: ['Standard cleaning kit'],
    lat: 40.7489,
    lng: -73.9680,
  },
  {
    id: 'JOB-004',
    customer: 'Jessica Martinez',
    address: '987 Birch Ln, San Francisco, CA 94102',
    serviceType: 'Move In/Out',
    date: new Date(),
    startTime: '8:00 AM',
    endTime: '2:00 PM',
    duration: '6 hours',
    status: 'upcoming',
    payment: 360.00,
    requiredCleaners: 3,
    isAvailableJob: true,
    instructions: 'Deep clean for new tenants moving in.',
    supplies: ['All cleaning supplies', 'Ladder'],
    lat: 40.7614,
    lng: -73.9776,
  },
];

const upcomingJobs: Job[] = [
  {
    id: 'JOB-003',
    customer: 'Emily Rodriguez',
    address: '789 Pine Rd',
    serviceType: 'Move In/Out',
    date: new Date(Date.now() + 86400000),
    startTime: '9:00 AM',
    endTime: '2:00 PM',
    duration: '5 hours',
    status: 'upcoming',
    payment: 249.00,
    lat: 40.7614,
    lng: -73.9776,
  },
];

const completedJobs: Job[] = [
  {
    id: 'JOB-000',
    customer: 'David Wilson',
    address: '321 Elm St',
    serviceType: 'Deep Cleaning',
    date: new Date(Date.now() - 86400000),
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    duration: '3 hours',
    status: 'completed',
    payment: 189.00,
  },
];

export function CleanerDashboard({ onSelectJob, onStartJob, onClaimJob, claimedJobs, onLogout, onNavigateToMessages, onNavigateToProfile, onNavigateToEarnings, onNavigateToNotifications }: CleanerDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  });

  // Filter available jobs to show only unclaimed jobs
  const filteredAvailableJobs = availableJobs.filter(job => !claimedJobs.includes(job.id));

  // Create my jobs list from claimed jobs
  const myJobs = [...availableJobs.filter(job => claimedJobs.includes(job.id)), ...upcomingJobs];

  const weeklyEarnings = availableJobs.reduce((sum, job) => sum + job.payment, 0) + 
                        completedJobs.reduce((sum, job) => sum + job.payment, 0);

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-secondary-500 to-accent-500 text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Maria Garcia</h1>
              <p className="text-sm text-white/80">Professional Cleaner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToNotifications}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
            </button>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs text-white/80">Today</span>
            </div>
            <div className="text-2xl font-bold">{availableJobs.length}</div>
            <div className="text-xs text-white/80">Jobs</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs text-white/80">Week</span>
            </div>
            <div className="text-2xl font-bold">${weeklyEarnings}</div>
            <div className="text-xs text-white/80">Earned</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs text-white/80">Rating</span>
            </div>
            <div className="text-2xl font-bold">4.9</div>
            <div className="text-xs text-white/80">Average</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="available" className="w-full">
          <div className="sticky top-0 bg-white border-b border-neutral-200 px-4">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="available">Available ({filteredAvailableJobs.length})</TabsTrigger>
              <TabsTrigger value="upcoming">My Jobs ({myJobs.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </div>

          {/* Available Jobs */}
          <TabsContent value="available" className="m-0 p-4 space-y-4">
            {filteredAvailableJobs.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Available Jobs</h3>
                <p className="text-neutral-600">Check back soon for new opportunities!</p>
              </div>
            ) : (
              filteredAvailableJobs.map((job) => (
                <AvailableJobCard
                  key={job.id}
                  job={job}
                  onViewDetails={onSelectJob}
                  onClaim={onClaimJob}
                />
              ))
            )}
          </TabsContent>

          {/* My Jobs (Upcoming) */}
          <TabsContent value="upcoming" className="m-0 p-4 space-y-4">
            {myJobs.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Jobs Yet</h3>
                <p className="text-neutral-600">Claim a job from the Available tab!</p>
              </div>
            ) : (
              myJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelect={onSelectJob}
                  onStart={onStartJob}
                  showStartButton={true}
                />
              ))
            )}
          </TabsContent>

          {/* Completed Jobs */}
          <TabsContent value="completed" className="m-0 p-4 space-y-4">
            {completedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSelect={onSelectJob}
                onStart={onStartJob}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentView="dashboard"
        onNavigate={(view) => {
          if (view === 'earnings') onNavigateToEarnings();
          else if (view === 'messages') onNavigateToMessages();
          else if (view === 'profile') onNavigateToProfile();
          else if (view === 'notifications') onNavigateToNotifications();
        }}
      />
    </div>
  );
}

// Job Card Component
interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
  onStart: (job: Job) => void;
  showStartButton?: boolean;
}

function JobCard({ job, onSelect, onStart, showStartButton }: JobCardProps) {
  const isCompleted = job.status === 'completed';
  
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-neutral-900">{job.id}</h3>
            <p className="text-sm text-neutral-600">{job.serviceType}</p>
          </div>
          <Badge
            className={
              isCompleted
                ? 'bg-green-100 text-green-700'
                : 'bg-secondary-100 text-secondary-700'
            }
          >
            {isCompleted ? 'Completed' : job.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
          </Badge>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-neutral-600">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{job.address}{job.unit ? `, ${job.unit}` : ''}</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-neutral-600">
            <Clock className="w-4 h-4" />
            <span>{job.startTime} - {job.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Calendar className="w-4 h-4" />
            <span>{job.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-xl font-bold text-neutral-900">${job.payment.toFixed(2)}</span>
          </div>
          
          <div className="flex gap-2">
            {showStartButton && !isCompleted && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600"
                onClick={() => onStart(job)}
              >
                Start Job
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelect(job)}
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Available Job Card Component
interface AvailableJobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
  onClaim: (jobId: string) => void;
}

function AvailableJobCard({ job, onViewDetails, onClaim }: AvailableJobCardProps) {
  // Calculate pay per hour
  const durationHours = parseFloat(job.duration.split(' ')[0]);
  const payPerHour = job.payment / durationHours;

  const handleClaim = () => {
    onClaim(job.id);
    toast.success('🎉 Congratulations! You have successfully claimed this job!', {
      description: `${job.serviceType} at ${job.address}`,
      duration: 2000,
    });
  };
  
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-neutral-900">{job.serviceType}</h3>
            <p className="text-sm text-neutral-600">{job.id}</p>
          </div>
          <Badge className="bg-secondary-100 text-secondary-700">
            Available
          </Badge>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-neutral-600">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{job.address}</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* Time and Duration */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-neutral-600">
            <Clock className="w-4 h-4" />
            <span>{job.startTime} - {job.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Calendar className="w-4 h-4" />
            <span>{job.duration}</span>
          </div>
        </div>

        {/* Pay and Cleaners Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-neutral-600">
            <Users className="w-4 h-4" />
            <span>{job.requiredCleaners || 1} {job.requiredCleaners === 1 ? 'cleaner' : 'cleaners'}</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <DollarSign className="w-4 h-4" />
            <span className="font-semibold">${payPerHour.toFixed(2)}/hr</span>
          </div>
        </div>

        {/* Total and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-xl font-bold text-neutral-900">${job.payment.toFixed(2)}</span>
            <span className="text-sm text-neutral-500">total</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(job)}
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600"
              onClick={handleClaim}
            >
              Claim Job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}