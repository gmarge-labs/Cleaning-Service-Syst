import { useState } from 'react';
import { MapPin, Clock, User, CheckCircle2, XCircle, AlertCircle, Phone, Navigation } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

// Mock data
const activeJobs = [
  {
    id: 1,
    cleaner: 'Maria Garcia',
    customer: 'Sarah Johnson',
    address: '123 Main St, Apt 4B',
    serviceType: 'Deep Cleaning',
    status: 'In Progress',
    startTime: '10:00 AM',
    estimatedEnd: '1:00 PM',
    progress: 65,
    location: { lat: 40.7128, lng: -74.0060 },
  },
  {
    id: 2,
    cleaner: 'John Smith',
    customer: 'Michael Chen',
    address: '456 Oak Ave, Suite 12',
    serviceType: 'Standard Cleaning',
    status: 'In Progress',
    startTime: '11:00 AM',
    estimatedEnd: '1:00 PM',
    progress: 40,
    location: { lat: 40.7580, lng: -73.9855 },
  },
  {
    id: 3,
    cleaner: 'Emily Chen',
    customer: 'Robert Williams',
    address: '789 Elm Street',
    serviceType: 'Move In/Out',
    status: 'Pending Review',
    startTime: '9:00 AM',
    estimatedEnd: '12:00 PM',
    progress: 100,
    location: { lat: 40.7489, lng: -73.9680 },
  },
];

const unassignedJobs = [
  {
    id: 4,
    customer: 'Lisa Anderson',
    address: '321 Pine Rd',
    serviceType: 'Deep Cleaning',
    scheduledTime: '2:00 PM',
    priority: 'high',
  },
  {
    id: 5,
    customer: 'David Martinez',
    address: '654 Maple Dr',
    serviceType: 'Standard Cleaning',
    scheduledTime: '3:00 PM',
    priority: 'normal',
  },
];

const availableCleaners = [
  { id: 1, name: 'Carlos Rodriguez', rating: 4.8, jobsToday: 2, available: true },
  { id: 2, name: 'Sarah Johnson', rating: 4.9, jobsToday: 1, available: true },
  { id: 3, name: 'Mike Wilson', rating: 4.7, jobsToday: 0, available: true },
];

const pendingInspections = [
  {
    id: 1,
    cleaner: 'Emily Chen',
    customer: 'Robert Williams',
    jobType: 'Move In/Out',
    completedAt: '12:00 PM',
    address: '789 Elm Street',
    photos: 12,
    checklist: { completed: 24, total: 24 },
  },
  {
    id: 2,
    cleaner: 'Maria Garcia',
    customer: 'Jennifer Lee',
    jobType: 'Deep Cleaning',
    completedAt: '11:45 AM',
    address: '234 Oak Lane',
    photos: 8,
    checklist: { completed: 18, total: 18 },
  },
];

export function SupervisorDashboard() {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Supervisor Dashboard</h1>
          <p className="text-neutral-600 mt-1">Monitor active jobs and manage assignments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Phone className="w-4 h-4 mr-2" />
            Emergency Contact
          </Button>
          <Button className="bg-secondary-500 hover:bg-secondary-600">Refresh Status</Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-secondary-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{activeJobs.length}</div>
              <div className="text-sm text-neutral-600">Active Jobs</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{unassignedJobs.length}</div>
              <div className="text-sm text-neutral-600">Unassigned</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{pendingInspections.length}</div>
              <div className="text-sm text-neutral-600">Pending Review</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
              <User className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{availableCleaners.length}</div>
              <div className="text-sm text-neutral-600">Available Staff</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          <TabsTrigger value="assignment">Job Assignment</TabsTrigger>
          <TabsTrigger value="inspection">Inspection Queue</TabsTrigger>
        </TabsList>

        {/* Active Jobs Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Live Job Tracking</h2>
            
            {/* Map Placeholder */}
            <div className="bg-neutral-100 rounded-xl h-96 mb-6 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 to-accent-50" />
              <div className="relative z-10 text-center">
                <MapPin className="w-16 h-16 text-secondary-500 mx-auto mb-3" />
                <p className="text-neutral-600">Interactive Map View</p>
                <p className="text-sm text-neutral-500">Real-time GPS tracking of active jobs</p>
              </div>
              
              {/* Mock map markers */}
              {activeJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="absolute w-8 h-8 bg-secondary-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    left: `${30 + index * 20}%`,
                    top: `${40 + index * 15}%`,
                  }}
                >
                  {index + 1}
                </div>
              ))}
            </div>

            {/* Job Cards */}
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-neutral-200 rounded-lg p-4 hover:border-secondary-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-neutral-900">{job.cleaner}</h3>
                        <Badge className={
                          job.status === 'In Progress' ? 'bg-secondary-500 text-white border-0' :
                          job.status === 'Pending Review' ? 'bg-orange-600 text-white border-0' :
                          'bg-neutral-600 text-white border-0'
                        }>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{job.customer} • {job.serviceType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{job.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{job.startTime} - {job.estimatedEnd}</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {job.status === 'In Progress' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                            <span>Progress</span>
                            <span>{job.progress}%</span>
                          </div>
                          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-secondary-500 transition-all"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        <Navigation className="w-4 h-4 mr-2" />
                        Track
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Job Assignment Tab */}
        <TabsContent value="assignment" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Unassigned Jobs */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Unassigned Jobs</h2>
              <div className="space-y-3">
                {unassignedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-4 cursor-move hover:border-secondary-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-neutral-900">{job.customer}</h3>
                      <Badge className={
                        job.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-700'
                      }>
                        {job.priority}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-neutral-600">
                      <div>{job.serviceType}</div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {job.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {job.scheduledTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Cleaners */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Available Cleaners</h2>
              <div className="space-y-3">
                {availableCleaners.map((cleaner) => (
                  <div
                    key={cleaner.id}
                    className="border border-neutral-200 rounded-lg p-4 hover:border-secondary-400 hover:bg-secondary-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                          {cleaner.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">{cleaner.name}</div>
                          <div className="text-sm text-neutral-600">
                            ⭐ {cleaner.rating} • {cleaner.jobsToday} jobs today
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Available</Badge>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      Assign Job
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Inspection Queue Tab */}
        <TabsContent value="inspection" className="space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Jobs Pending Approval</h2>
            <div className="space-y-4">
              {pendingInspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-neutral-900">{inspection.customer}</h3>
                      <p className="text-sm text-neutral-600">{inspection.jobType} by {inspection.cleaner}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700">Needs Review</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <MapPin className="w-4 h-4" />
                      <span>{inspection.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Clock className="w-4 h-4" />
                      <span>Completed: {inspection.completedAt}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Checklist: {inspection.checklist.completed}/{inspection.checklist.total}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <span>📷 {inspection.photos} photos uploaded</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Photos
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <XCircle className="w-4 h-4 mr-2" />
                      Request Re-clean
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
