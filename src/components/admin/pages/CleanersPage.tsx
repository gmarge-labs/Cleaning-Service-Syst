import { useState } from 'react';
import { Star, MapPin, Calendar, DollarSign, Phone, Mail, Search, Filter, Eye, Edit, X, Send, Clock } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { CleanerOnboardingFlow } from '../CleanerOnboardingFlow';
import { Pagination } from '../../ui/pagination';
import { toast } from 'sonner@2.0.3';

// Mock data
const cleaners = [
  {
    id: 1,
    name: 'Maria Garcia',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    rating: 4.9,
    jobsCompleted: 234,
    status: 'Active',
    phone: '(555) 123-4567',
    email: 'maria.garcia@example.com',
    joinDate: new Date('2024-01-15'),
    earnings: 12450,
    specialties: ['Deep Cleaning', 'Move In/Out'],
    address: '123 Main St, New York, NY 10001',
    emergencyContact: '(555) 123-9999',
    certifications: ['EPA Lead-Safe Certified', 'OSHA Safety Trained'],
  },
  {
    id: 2,
    name: 'John Smith',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    rating: 4.8,
    jobsCompleted: 189,
    status: 'On Job',
    phone: '(555) 234-5678',
    email: 'john.smith@example.com',
    joinDate: new Date('2024-03-20'),
    earnings: 9870,
    specialties: ['Standard Cleaning', 'Deep Cleaning'],
    address: '456 Oak Ave, Los Angeles, CA 90001',
    emergencyContact: '(555) 234-8888',
    certifications: ['First Aid Certified'],
  },
  {
    id: 3,
    name: 'Emily Chen',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    rating: 4.95,
    jobsCompleted: 312,
    status: 'Active',
    phone: '(555) 345-6789',
    email: 'emily.chen@example.com',
    joinDate: new Date('2023-11-10'),
    earnings: 15230,
    specialties: ['Move In/Out', 'Post-Construction'],
    address: '789 Pine Rd, Chicago, IL 60601',
    emergencyContact: '(555) 345-7777',
    certifications: ['EPA Lead-Safe Certified', 'OSHA Safety Trained', 'Green Cleaning Certified'],
  },
  {
    id: 4,
    name: 'Carlos Rodriguez',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    rating: 4.7,
    jobsCompleted: 156,
    status: 'Off Duty',
    phone: '(555) 456-7890',
    email: 'carlos.rodriguez@example.com',
    joinDate: new Date('2024-06-05'),
    earnings: 7820,
    specialties: ['Standard Cleaning', 'Post-Construction'],
    address: '321 Elm St, Houston, TX 77001',
    emergencyContact: '(555) 456-6666',
    certifications: ['OSHA Safety Trained'],
  },
];

const statusColors = {
  'Active': 'bg-green-100 text-green-700',
  'On Job': 'bg-secondary-100 text-secondary-700',
  'Off Duty': 'bg-neutral-100 text-neutral-700',
  'Inactive': 'bg-red-100 text-red-700',
};

export function CleanersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCleaner, setSelectedCleaner] = useState<typeof cleaners[0] | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const itemsPerPage = 10;

  const filteredCleaners = cleaners.filter((cleaner) => {
    const matchesSearch = cleaner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cleaner.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cleaner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginated data
  const paginatedCleaners = filteredCleaners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCleaners.length / itemsPerPage);

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    // In a real app, would refresh the cleaners list
  };

  // Cleaner Detail Modal
  const CleanerDetailModal = () => {
    if (!selectedCleaner) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedCleaner(null)}
      >
        <div 
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Cleaner Profile</h2>
              <p className="text-sm text-neutral-600">Complete profile details</p>
            </div>
            <button
              onClick={() => setSelectedCleaner(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Profile Header */}
            <div className="flex items-center gap-6 mb-6 p-6 bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg">
              <img
                src={selectedCleaner.photo}
                alt={selectedCleaner.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900">{selectedCleaner.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{selectedCleaner.rating}</span>
                  </div>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-600">{selectedCleaner.jobsCompleted} jobs completed</span>
                  <span className="text-neutral-600">•</span>
                  <Badge className={statusColors[selectedCleaner.status as keyof typeof statusColors]}>
                    {selectedCleaner.status}
                  </Badge>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="performance" className="flex-1">Performance</TabsTrigger>
                <TabsTrigger value="contact" className="flex-1">Contact Info</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-3">Basic Information</h4>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Status</span>
                      <Badge className={statusColors[selectedCleaner.status as keyof typeof statusColors]}>
                        {selectedCleaner.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Join Date</span>
                      <span className="font-medium text-neutral-900">
                        {selectedCleaner.joinDate.toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Total Earnings</span>
                      <span className="font-medium text-neutral-900">${selectedCleaner.earnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Jobs Completed</span>
                      <span className="font-medium text-neutral-900">{selectedCleaner.jobsCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Rating</span>
                      <span className="font-medium text-neutral-900 flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        {selectedCleaner.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 mb-3">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCleaner.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="bg-secondary-100 text-secondary-700">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 mb-3">Certifications</h4>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedCleaner.certifications.map((cert, index) => (
                        <li key={index} className="flex items-center gap-2 text-neutral-700">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6 mt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-700">{selectedCleaner.jobsCompleted}</div>
                    <div className="text-sm text-green-600 mt-1">Jobs Completed</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                    <div className="text-3xl font-bold text-yellow-700">{selectedCleaner.rating}</div>
                    <div className="text-sm text-yellow-600 mt-1">Average Rating</div>
                  </div>
                  <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg p-4">
                    <div className="text-3xl font-bold text-secondary-700">${selectedCleaner.earnings.toLocaleString()}</div>
                    <div className="text-sm text-secondary-600 mt-1">Total Earnings</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 mb-3">Performance Metrics</h4>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-neutral-600">On-Time Rate</span>
                        <span className="text-sm font-medium text-neutral-900">98%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-neutral-600">Customer Satisfaction</span>
                        <span className="text-sm font-medium text-neutral-900">96%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-secondary-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-neutral-600">Job Acceptance Rate</span>
                        <span className="text-sm font-medium text-neutral-900">92%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Contact Info Tab */}
              <TabsContent value="contact" className="space-y-6 mt-6">
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-3">Contact Details</h4>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-secondary-500" />
                      <div className="flex-1">
                        <div className="text-xs text-neutral-600">Phone Number</div>
                        <div className="font-medium text-neutral-900">{selectedCleaner.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-secondary-500" />
                      <div className="flex-1">
                        <div className="text-xs text-neutral-600">Email Address</div>
                        <div className="font-medium text-neutral-900">{selectedCleaner.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-secondary-500" />
                      <div className="flex-1">
                        <div className="text-xs text-neutral-600">Address</div>
                        <div className="font-medium text-neutral-900">{selectedCleaner.address}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 mb-3">Emergency Contact</h4>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <div className="text-xs text-neutral-600">Emergency Phone</div>
                        <div className="font-medium text-neutral-900">{selectedCleaner.emergencyContact}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-200">
              <Button variant="outline" className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowSchedule(true)}>
                View Schedule
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowMessage(true)}>
                Message Cleaner
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If onboarding a new cleaner, show the onboarding flow page
  if (showOnboarding) {
    return (
      <CleanerOnboardingFlow
        onComplete={handleCompleteOnboarding}
        onCancel={() => setShowOnboarding(false)}
      />
    );
  }

  // Schedule Modal
  const ScheduleModal = () => {
    if (!showSchedule || !selectedCleaner) return null;

    // Mock schedule data
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule = {
      Monday: [{ time: '9:00 AM - 12:00 PM', job: 'Deep Cleaning - 123 Main St' }, { time: '2:00 PM - 5:00 PM', job: 'Standard Cleaning - 456 Oak Ave' }],
      Tuesday: [{ time: '10:00 AM - 1:00 PM', job: 'Move In/Out - 789 Pine Rd' }],
      Wednesday: [{ time: '9:00 AM - 12:00 PM', job: 'Post-Construction - 321 Elm St' }],
      Thursday: [{ time: '1:00 PM - 4:00 PM', job: 'Deep Cleaning - 555 Maple Dr' }],
      Friday: [{ time: '9:00 AM - 3:00 PM', job: 'Standard Cleaning - 888 Cedar Ln' }],
      Saturday: [],
      Sunday: [],
    };

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
        onClick={() => setShowSchedule(false)}
      >
        <div 
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Weekly Schedule</h2>
              <p className="text-sm text-neutral-600">{selectedCleaner.name}'s work schedule</p>
            </div>
            <button
              onClick={() => setShowSchedule(false)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {weekDays.map((day) => {
                const daySchedule = schedule[day as keyof typeof schedule];
                const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'long' });

                return (
                  <div 
                    key={day} 
                    className={`border rounded-lg p-4 ${isToday ? 'border-secondary-500 bg-secondary-50' : 'border-neutral-200'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-semibold ${isToday ? 'text-secondary-700' : 'text-neutral-900'}`}>
                        {day}
                        {isToday && <span className="ml-2 text-xs bg-secondary-500 text-white px-2 py-1 rounded-full">Today</span>}
                      </h3>
                      <span className="text-sm text-neutral-600">{daySchedule.length} {daySchedule.length === 1 ? 'job' : 'jobs'}</span>
                    </div>

                    {daySchedule.length === 0 ? (
                      <div className="text-sm text-neutral-500 italic">No jobs scheduled</div>
                    ) : (
                      <div className="space-y-2">
                        {daySchedule.map((item, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-neutral-200">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-secondary-500" />
                              <span className="font-medium text-neutral-900">{item.time}</span>
                            </div>
                            <div className="text-sm text-neutral-600 mt-1 ml-6">{item.job}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Message Modal
  const MessageModal = () => {
    if (!showMessage || !selectedCleaner) return null;

    const handleSendMessage = () => {
      if (messageText.trim()) {
        toast.success(`Message sent to ${selectedCleaner.name}!`);
        setMessageText('');
        setShowMessage(false);
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
        onClick={() => setShowMessage(false)}
      >
        <div 
          className="bg-white rounded-xl max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Send Message</h2>
              <p className="text-sm text-neutral-600">Send a direct message to {selectedCleaner.name}</p>
            </div>
            <button
              onClick={() => setShowMessage(false)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Recipient Info */}
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg mb-4">
              <img
                src={selectedCleaner.photo}
                alt={selectedCleaner.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-neutral-900">{selectedCleaner.name}</div>
                <div className="text-sm text-neutral-600">{selectedCleaner.email}</div>
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Message
              </label>
              <textarea
                className="w-full border border-neutral-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 min-h-[150px]"
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowMessage(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-secondary-500 hover:bg-secondary-600"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Otherwise show the cleaners list
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Cleaner Management</h1>
          <p className="text-neutral-600 mt-1">Manage your cleaning professionals</p>
        </div>
        <Button className="bg-secondary-500 hover:bg-secondary-600" onClick={() => setShowOnboarding(true)}>
          + Onboard New Cleaner
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-neutral-900">{cleaners.length}</div>
          <div className="text-sm text-neutral-600">Total Cleaners</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {cleaners.filter(c => c.status === 'Active').length}
          </div>
          <div className="text-sm text-neutral-600">Active</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-secondary-500">
            {cleaners.filter(c => c.status === 'On Job').length}
          </div>
          <div className="text-sm text-neutral-600">On Job</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">4.8</div>
          <div className="text-sm text-neutral-600">Avg Rating</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Search cleaners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Job">On Job</SelectItem>
              <SelectItem value="Off Duty">Off Duty</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Cleaners Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Cleaner</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Contact</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Rating</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Jobs</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Earnings</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {paginatedCleaners.map((cleaner) => (
                <tr key={cleaner.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={cleaner.photo}
                        alt={cleaner.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-neutral-900">{cleaner.name}</div>
                        <div className="text-xs text-neutral-500">
                          Joined {cleaner.joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-neutral-900">
                        <Phone className="w-3 h-3" />
                        {cleaner.phone}
                      </div>
                      <div className="flex items-center gap-1 text-neutral-600 mt-1">
                        <Mail className="w-3 h-3" />
                        {cleaner.email}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-neutral-900">{cleaner.rating}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-neutral-900">{cleaner.jobsCompleted}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-neutral-900 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      {cleaner.earnings.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge className={statusColors[cleaner.status as keyof typeof statusColors]}>
                      {cleaner.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm hover:bg-neutral-100 rounded-lg transition-colors"
                      onClick={() => {
                        console.log('View button clicked for:', cleaner.name);
                        setSelectedCleaner(cleaner);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredCleaners.length}
        />
      </div>

      {filteredCleaners.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Cleaners Found</h3>
          <p className="text-neutral-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Cleaner Detail Modal */}
      {selectedCleaner && <CleanerDetailModal />}
      {/* Schedule Modal */}
      {showSchedule && <ScheduleModal />}
      {/* Message Modal */}
      {showMessage && <MessageModal />}
    </div>
  );
}