import { useState } from 'react';
import { Calendar, Clock, MapPin, DollarSign, Filter, Search, Eye, Edit, X, CheckCircle, Users, Wrench, FileText, User, Star, Phone, Mail, Send } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ManualBookingFlow } from '../ManualBookingFlow';
import { toast } from 'sonner@2.0.3';
import { Pagination } from '../../ui/pagination';

// Mock data for unpublished bookings
const unpublishedBookings = [
  {
    id: 'BK-001',
    customer: 'Sarah Johnson',
    service: 'Deep Cleaning',
    date: new Date('2025-12-15'),
    time: '10:00 AM',
    address: '123 Main St, Apt 4B, New York, NY 10001',
    total: 189.00,
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    addOns: ['Inside Windows', 'Pet Hair Removal'],
    frequency: 'Weekly',
    estimatedDuration: '3 hours',
  },
  {
    id: 'BK-002',
    customer: 'Michael Chen',
    service: 'Standard Cleaning',
    date: new Date('2025-12-16'),
    time: '2:00 PM',
    address: '456 Oak Ave, Suite 12, Los Angeles, CA 90001',
    total: 120.00,
    propertyType: 'House',
    bedrooms: 3,
    bathrooms: 2,
    addOns: [],
    frequency: 'Bi-weekly',
    estimatedDuration: '2.5 hours',
  },
  {
    id: 'BK-003',
    customer: 'Emily Rodriguez',
    service: 'Move In/Out',
    date: new Date('2025-12-17'),
    time: '9:00 AM',
    address: '789 Pine Rd, Chicago, IL 60601',
    total: 249.00,
    propertyType: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    addOns: ['Inside Fridge', 'Inside Cabinets'],
    frequency: 'One-time',
    estimatedDuration: '4 hours',
  },
];

// Mock data for published jobs
const publishedJobs = [
  {
    id: 'BK-004',
    customer: 'David Wilson',
    service: 'Post-Construction',
    date: new Date('2025-12-18'),
    time: '1:00 PM',
    address: '321 Elm St, Houston, TX 77001',
    total: 299.00,
    status: 'Open',
    claimedBy: [],
    requiredCleaners: 3,
    toolsRequired: ['Vacuum', 'Mop', 'Disinfectant', 'Microfiber Cloths'],
    specialInstructions: 'Focus on removing construction dust. Client will be on-site.',
  },
  {
    id: 'BK-005',
    customer: 'Lisa Wang',
    service: 'Deep Cleaning',
    date: new Date('2025-12-19'),
    time: '11:00 AM',
    address: '555 Maple Dr, Phoenix, AZ 85001',
    total: 189.00,
    status: 'In Progress',
    claimedBy: [
      {
        id: 1,
        name: 'Maria Garcia',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        rating: 4.9,
        completedJobs: 234,
      },
      {
        id: 2,
        name: 'John Smith',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
        rating: 4.8,
        completedJobs: 189,
      },
    ],
    requiredCleaners: 2,
    toolsRequired: ['Vacuum', 'Mop', 'All-purpose Cleaner'],
    specialInstructions: 'Pet-friendly products only. Two cats in the home.',
  },
  {
    id: 'BK-006',
    customer: 'James Anderson',
    service: 'Standard Cleaning',
    date: new Date('2025-12-20'),
    time: '3:00 PM',
    address: '888 Cedar Ln, Seattle, WA 98101',
    total: 120.00,
    status: 'Assigned',
    claimedBy: [
      {
        id: 1,
        name: 'Maria Garcia',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        rating: 4.9,
        completedJobs: 234,
      },
    ],
    requiredCleaners: 1,
    toolsRequired: ['Standard Cleaning Kit'],
    specialInstructions: 'No special instructions.',
  },
];

type Tab = 'unpublished' | 'published';

const statusColors = {
  'Open': 'bg-yellow-100 text-yellow-700',
  'Assigned': 'bg-green-100 text-green-700',
  'In Progress': 'bg-secondary-100 text-secondary-700',
  'Completed': 'bg-neutral-100 text-neutral-700',
};

export function BookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('unpublished');
  const [searchTerm, setSearchTerm] = useState('');
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState<any>(null);
  const [editJobModal, setEditJobModal] = useState<any>(null);
  const [viewCleanersModal, setViewCleanersModal] = useState<any>(null);
  const [selectedCleanerProfile, setSelectedCleanerProfile] = useState<any>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  // Pagination state
  const [unpublishedPage, setUnpublishedPage] = useState(1);
  const [publishedPage, setPublishedPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUnpublishedBookings = unpublishedBookings.filter((booking) =>
    booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPublishedJobs = publishedJobs.filter((job) =>
    job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginated data
  const paginatedUnpublished = filteredUnpublishedBookings.slice(
    (unpublishedPage - 1) * itemsPerPage,
    unpublishedPage * itemsPerPage
  );

  const paginatedPublished = filteredPublishedJobs.slice(
    (publishedPage - 1) * itemsPerPage,
    publishedPage * itemsPerPage
  );

  const unpublishedTotalPages = Math.ceil(filteredUnpublishedBookings.length / itemsPerPage);
  const publishedTotalPages = Math.ceil(filteredPublishedJobs.length / itemsPerPage);

  const handleCompleteBooking = () => {
    setShowManualBooking(false);
  };

  const handlePublishJob = (jobData: any) => {
    toast.success(`Job ${jobData.bookingId} has been published successfully!`);
    setEditJobModal(null);
  };

  // View Details Modal (for unpublished bookings)
  const ViewDetailsModal = () => {
    if (!viewDetailsModal) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setViewDetailsModal(null)}
      >
        <div 
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Booking Details</h2>
              <p className="text-sm text-neutral-600">Booking ID: {viewDetailsModal.id}</p>
            </div>
            <button
              onClick={() => setViewDetailsModal(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-secondary-500" />
                Customer Information
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="font-medium text-neutral-900">{viewDetailsModal.customer}</p>
              </div>
            </div>

            {/* Service Info */}
            <div className="bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">{viewDetailsModal.service}</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Calendar className="w-4 h-4 text-secondary-500" />
                  <span>{viewDetailsModal.date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="w-4 h-4 text-secondary-500" />
                  <span>{viewDetailsModal.time}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="w-4 h-4 text-secondary-500" />
                  <span>{viewDetailsModal.estimatedDuration}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Calendar className="w-4 h-4 text-secondary-500" />
                  <span>{viewDetailsModal.frequency}</span>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Property Details</h4>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Property Type:</span>
                  <span className="font-medium text-neutral-900">{viewDetailsModal.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Bedrooms:</span>
                  <span className="font-medium text-neutral-900">{viewDetailsModal.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Bathrooms:</span>
                  <span className="font-medium text-neutral-900">{viewDetailsModal.bathrooms}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary-500" />
                Service Location
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-neutral-700">{viewDetailsModal.address}</p>
              </div>
            </div>

            {/* Add-ons */}
            {viewDetailsModal.addOns && viewDetailsModal.addOns.length > 0 && (
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Add-ons</h4>
                <div className="flex flex-wrap gap-2">
                  {viewDetailsModal.addOns.map((addon: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-secondary-100 text-secondary-700">
                      {addon}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-neutral-900">Total Amount</span>
                <span className="text-3xl font-bold text-neutral-900">${viewDetailsModal.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Job Modal (for setting job parameters before publishing)
  const EditJobModal = () => {
    if (!editJobModal) return null;

    const [jobData, setJobData] = useState({
      bookingId: editJobModal.id,
      requiredCleaners: 1,
      paymentPerHour: 25,
      toolsRequired: '',
      specialInstructions: '',
    });

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setEditJobModal(null)}
      >
        <div 
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Set Job Parameters</h2>
              <p className="text-sm text-neutral-600">Configure and publish job {editJobModal.id}</p>
            </div>
            <button
              onClick={() => setEditJobModal(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Booking Summary */}
            <div className="bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg p-4">
              <div className="font-semibold text-neutral-900 mb-1">{editJobModal.service}</div>
              <div className="text-sm text-neutral-600">{editJobModal.customer}</div>
              <div className="text-sm text-neutral-600">
                {editJobModal.date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })} at {editJobModal.time}
              </div>
            </div>

            {/* Number of Cleaners and Payment per Hour - Same Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                  <Users className="w-5 h-5 text-secondary-500" />
                  Number of Cleaners Needed
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={jobData.requiredCleaners}
                  onChange={(e) => setJobData({ ...jobData, requiredCleaners: parseInt(e.target.value) || 1 })}
                  placeholder="Enter number of cleaners"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                  <DollarSign className="w-5 h-5 text-secondary-500" />
                  Payment per Hour
                </label>
                <Input
                  type="number"
                  min="1"
                  step="0.5"
                  value={jobData.paymentPerHour}
                  onChange={(e) => setJobData({ ...jobData, paymentPerHour: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 25.00"
                />
              </div>
            </div>

            {/* Tools Required */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                <Wrench className="w-5 h-5 text-secondary-500" />
                Tools Required
              </label>
              <textarea
                className="w-full border border-neutral-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                rows={3}
                value={jobData.toolsRequired}
                onChange={(e) => setJobData({ ...jobData, toolsRequired: e.target.value })}
                placeholder="e.g., Vacuum, Mop, Disinfectant, Microfiber Cloths"
              />
              <p className="text-xs text-neutral-500 mt-1">Separate items with commas</p>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                <FileText className="w-5 h-5 text-secondary-500" />
                Special Instructions
              </label>
              <textarea
                className="w-full border border-neutral-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                rows={4}
                value={jobData.specialInstructions}
                onChange={(e) => setJobData({ ...jobData, specialInstructions: e.target.value })}
                placeholder="Add any special instructions for the cleaners..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-neutral-200">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setEditJobModal(null)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-secondary-500 hover:bg-secondary-600"
                onClick={() => handlePublishJob(jobData)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Publish Job
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // View Cleaners Modal (for published jobs)
  const ViewCleanersModal = () => {
    if (!viewCleanersModal) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setViewCleanersModal(null)}
      >
        <div 
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Cleaner Profiles</h2>
              <p className="text-sm text-neutral-600">Job ID: {viewCleanersModal.id}</p>
            </div>
            <button
              onClick={() => setViewCleanersModal(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {viewCleanersModal.claimedBy.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-600">No cleaners have claimed this job yet</p>
              </div>
            ) : (
              viewCleanersModal.claimedBy.map((cleaner: any) => (
                <div key={cleaner.id} className="bg-neutral-50 rounded-lg p-4 flex items-center gap-4">
                  <img
                    src={cleaner.photo}
                    alt={cleaner.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">{cleaner.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-600 mt-1">
                      <span className="flex items-center gap-1">
                        ⭐ {cleaner.rating}
                      </span>
                      <span>{cleaner.completedJobs} jobs completed</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedCleanerProfile(cleaner);
                      // Close the cleaners modal and open the profile modal
                    }}
                  >
                    View Full Profile
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Cleaner Profile Modal
  const CleanerProfileModal = () => {
    if (!selectedCleanerProfile) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
        onClick={() => setSelectedCleanerProfile(null)}
      >
        <div 
          className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Cleaner Full Profile</h2>
              <p className="text-sm text-neutral-600">Complete cleaner information</p>
            </div>
            <button
              onClick={() => setSelectedCleanerProfile(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg">
              <img
                src={selectedCleanerProfile.photo}
                alt={selectedCleanerProfile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900">{selectedCleanerProfile.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{selectedCleanerProfile.rating}</span>
                  </div>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-600">{selectedCleanerProfile.completedJobs} jobs completed</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-700">{selectedCleanerProfile.completedJobs}</div>
                <div className="text-sm text-green-600 mt-1">Jobs Completed</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-700">{selectedCleanerProfile.rating}</div>
                <div className="text-sm text-yellow-600 mt-1">Average Rating</div>
              </div>
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-secondary-700">98%</div>
                <div className="text-sm text-secondary-600 mt-1">On-Time Rate</div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Contact Information</h4>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-secondary-500" />
                  <div className="flex-1">
                    <div className="text-xs text-neutral-600">Phone Number</div>
                    <div className="font-medium text-neutral-900">(555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-secondary-500" />
                  <div className="flex-1">
                    <div className="text-xs text-neutral-600">Email Address</div>
                    <div className="font-medium text-neutral-900">{selectedCleanerProfile.name.toLowerCase().replace(' ', '.')}@example.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-secondary-500" />
                  <div className="flex-1">
                    <div className="text-xs text-neutral-600">Address</div>
                    <div className="font-medium text-neutral-900">123 Main St, New York, NY 10001</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
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

            {/* Specialties */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-secondary-100 text-secondary-700">
                  Deep Cleaning
                </Badge>
                <Badge variant="secondary" className="bg-secondary-100 text-secondary-700">
                  Standard Cleaning
                </Badge>
                <Badge variant="secondary" className="bg-secondary-100 text-secondary-700">
                  Move In/Out
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-neutral-200">
              <Button variant="outline" className="flex-1" onClick={() => setShowSchedule(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                View Schedule
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowMessage(true)}>
                <Send className="w-4 h-4 mr-2" />
                Message Cleaner
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Schedule Modal
  const ScheduleModal = () => {
    if (!showSchedule || !selectedCleanerProfile) return null;

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
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
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
              <p className="text-sm text-neutral-600">{selectedCleanerProfile.name}'s work schedule</p>
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
    if (!showMessage || !selectedCleanerProfile) return null;

    const handleSendMessage = () => {
      if (messageText.trim()) {
        toast.success(`Message sent to ${selectedCleanerProfile.name}!`);
        setMessageText('');
        setShowMessage(false);
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
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
              <p className="text-sm text-neutral-600">Send a direct message to {selectedCleanerProfile.name}</p>
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
                src={selectedCleanerProfile.photo}
                alt={selectedCleanerProfile.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-neutral-900">{selectedCleanerProfile.name}</div>
                <div className="text-sm text-neutral-600">{selectedCleanerProfile.name.toLowerCase().replace(' ', '.')}@example.com</div>
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

  // If creating manual booking, show the booking flow page
  if (showManualBooking) {
    return (
      <ManualBookingFlow
        onComplete={handleCompleteBooking}
        onCancel={() => setShowManualBooking(false)}
      />
    );
  }

  // Otherwise show the bookings list
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">All Bookings</h1>
          <p className="text-neutral-600 mt-1">Manage and monitor all cleaning bookings</p>
        </div>
        <Button 
          onClick={() => setShowManualBooking(true)}
          className="bg-secondary-500 hover:bg-secondary-600"
        >
          + Create Manual Booking
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{unpublishedBookings.length}</div>
          <div className="text-sm text-neutral-600">Unpublished</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{publishedJobs.filter(j => j.status === 'Open').length}</div>
          <div className="text-sm text-neutral-600">Open Jobs</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-secondary-500">{publishedJobs.filter(j => j.status === 'In Progress').length}</div>
          <div className="text-sm text-neutral-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-green-600">{publishedJobs.filter(j => j.status === 'Assigned').length}</div>
          <div className="text-sm text-neutral-600">Assigned</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="border-b border-neutral-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('unpublished')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'unpublished'
                  ? 'text-secondary-500 border-b-2 border-secondary-500 bg-secondary-50/50'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Unpublished ({unpublishedBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'published'
                  ? 'text-secondary-500 border-b-2 border-secondary-500 bg-secondary-50/50'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Published ({publishedJobs.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Unpublished Tab Content */}
        {activeTab === 'unpublished' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Booking ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Service</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Total</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {paginatedUnpublished.map((booking) => (
                  <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono font-semibold text-secondary-500">{booking.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-neutral-900">{booking.customer}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-neutral-900">{booking.service}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-neutral-900">
                          <Calendar className="w-4 h-4" />
                          {booking.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1 text-neutral-600">
                          <Clock className="w-4 h-4" />
                          {booking.time}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-neutral-900 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        {booking.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setViewDetailsModal(booking)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditJobModal(booking)}
                          className="text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Publish
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={unpublishedPage}
              totalPages={unpublishedTotalPages}
              onPageChange={setUnpublishedPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredUnpublishedBookings.length}
            />
          </div>
        )}

        {/* Published Tab Content */}
        {activeTab === 'published' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Booking ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Service</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Cleaners</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {paginatedPublished.map((job) => (
                  <tr key={job.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono font-semibold text-secondary-500">{job.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-neutral-900">{job.customer}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-neutral-900">{job.service}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-neutral-900">
                          <Calendar className="w-4 h-4" />
                          {job.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1 text-neutral-600">
                          <Clock className="w-4 h-4" />
                          {job.time}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          job.claimedBy.length >= job.requiredCleaners 
                            ? 'text-green-600' 
                            : job.claimedBy.length > 0 
                            ? 'text-orange-600'
                            : 'text-red-600'
                        }`}>
                          {job.claimedBy.length}/{job.requiredCleaners}
                        </span>
                        <span className="text-sm text-neutral-600">claimed</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={statusColors[job.status as keyof typeof statusColors]}>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setViewCleanersModal(job)}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        View Cleaners
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={publishedPage}
              totalPages={publishedTotalPages}
              onPageChange={setPublishedPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredPublishedJobs.length}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {viewDetailsModal && <ViewDetailsModal />}
      {editJobModal && <EditJobModal />}
      {viewCleanersModal && <ViewCleanersModal />}
      {selectedCleanerProfile && <CleanerProfileModal />}
      {showSchedule && <ScheduleModal />}
      {showMessage && <MessageModal />}
    </div>
  );
}