import { useState, useEffect } from 'react';
import { MapPin, Clock, User, CheckCircle2, XCircle, AlertCircle, Phone, Navigation } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { toast } from 'sonner';

export function SupervisorDashboard() {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/supervisor/stats');
      const data = await response.json();
      if (response.ok) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Fetch supervisor dashboard data error:', error);
      toast.error('Failed to load supervisor dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  const activeJobs = (dashboardData?.activeJobs || []).map((job: any) => {
    const startTime = new Date(job.date);
    if (job.time) {
      const [time, period] = job.time.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      startTime.setHours(hour24, minutes, 0, 0);
    }

    const estimatedEnd = job.estimatedDuration 
      ? new Date(startTime.getTime() + job.estimatedDuration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'TBD';

    return {
      id: job.id,
      cleaner: 'Unassigned', // Placeholder
      customer: job.guestName || 'Unknown',
      address: job.address || 'No address',
      serviceType: job.serviceType,
      status: job.status,
      startTime: job.time || 'TBD',
      estimatedEnd,
      progress: job.status === 'COMPLETED' ? 100 : 50,
      location: { lat: 40.7128, lng: -74.0060 },
    };
  });

  const unassignedJobs = (dashboardData?.unassignedJobs || []).map((job: any) => ({
    id: job.id,
    customer: job.guestName || 'Unknown',
    address: job.address || 'No address',
    serviceType: job.serviceType,
    scheduledTime: new Date(job.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    priority: 'normal',
  }));

  const availableCleaners = (dashboardData?.availableCleaners || []).map((cleaner: any) => ({
    id: cleaner.id,
    name: cleaner.name,
    rating: cleaner.rating,
    jobsToday: cleaner.jobsToday,
    available: true,
  }));

  const pendingInspections = dashboardData?.pendingInspections || [];

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
