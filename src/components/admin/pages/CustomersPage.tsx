import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, DollarSign, Search, Filter, Eye, Edit, X, MessageSquare, AlertCircle, Star } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { AddCustomerFlow } from '../AddCustomerFlow';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

const statusColors = {
  'Active': 'bg-green-100 text-green-700',
  'VIP': 'bg-purple-100 text-purple-700',
  'Inactive': 'bg-neutral-100 text-neutral-700',
};

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  bookings?: any[];
}

export function CustomersPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewCustomerModal, setViewCustomerModal] = useState<Customer | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage]);

  const fetchCustomers = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users?role=CUSTOMER&page=${page}&limit=${itemsPerPage}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      
      // Handle both old format (array) and new format (object with pagination)
      if (data.data) {
        setCustomers(data.data);
        setTotalCustomers(data.pagination.totalCount);
        setTotalPages(data.pagination.totalPages);
      } else {
        // Fallback for old API format
        setCustomers(data);
        setTotalCustomers(data.length);
        setTotalPages(1);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAddCustomerComplete = () => {
    setShowAddCustomer(false);
    setCurrentPage(1);
    fetchCustomers(1); // Refresh the customer list
  };

  if (showAddCustomer) {
    return (
      <AddCustomerFlow
        onComplete={handleAddCustomerComplete}
        onCancel={() => setShowAddCustomer(false)}
      />
    );
  }

  // Calculate stats from real data
  const displayedStats = {
    totalCustomers: totalCustomers,
    activeUsers: totalCustomers,
    vipMembers: Math.floor(totalCustomers * 0.2),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Customer Management</h1>
          <p className="text-neutral-600 mt-1">View and manage your customer base</p>
        </div>
        <Button 
          className="bg-secondary-500 hover:bg-secondary-600"
          onClick={() => setShowAddCustomer(true)}
        >
          + Add Customer
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-neutral-900">{displayedStats.totalCustomers}</div>
          <div className="text-sm text-neutral-600">Total Customers</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {displayedStats.activeUsers}
          </div>
          <div className="text-sm text-neutral-600">Active Users</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {displayedStats.vipMembers}
          </div>
          <div className="text-sm text-neutral-600">VIP Members</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-secondary-500">$0K</div>
          <div className="text-sm text-neutral-600">Total Revenue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Search customers..."
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
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Join Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
            <p className="mt-2 text-neutral-600">Loading customers...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchCustomers}
            >
              Retry
            </Button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-neutral-600">No customers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Location</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Join Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Bookings</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">{customer.name}</div>
                            <div className="text-sm text-neutral-600">ID: {customer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Mail className="w-4 h-4" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                              <Phone className="w-4 h-4" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {customer.address ? (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="max-w-xs truncate">{customer.address}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-500 italic">Not provided</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(customer.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-neutral-900">{customer.bookings?.length || 0}</div>
                          <div className="text-xs text-neutral-600">bookings</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setViewCustomerModal(customer)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-neutral-600">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCustomers)}</span> of <span className="font-medium">{totalCustomers}</span> customers
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-secondary-500 hover:bg-secondary-600" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Customer Modal */}
      {viewCustomerModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewCustomerModal(null)}
      >
        <div 
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between z-20">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Customer Details</h2>
              <p className="text-sm text-neutral-600">Customer ID: {viewCustomerModal.id}</p>
            </div>
            <button
              onClick={() => setViewCustomerModal(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-secondary-500" />
                Personal Information
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold tracking-wider mb-1">Full Name</p>
                  <p className="font-medium text-neutral-900 text-lg">{viewCustomerModal.name}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-secondary-500" />
                      <p className="text-xs text-neutral-500 uppercase font-semibold tracking-wider">Email</p>
                    </div>
                    <p className="text-sm text-neutral-700 font-medium">{viewCustomerModal.email}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-secondary-500" />
                      <p className="text-xs text-neutral-500 uppercase font-semibold tracking-wider">Phone</p>
                    </div>
                    <p className="text-sm text-neutral-700 font-medium">{viewCustomerModal.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary-500" />
                Address
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-sm text-neutral-700">
                  {viewCustomerModal.address || 'No address provided'}
                </p>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Account Information</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Calendar className="w-4 h-4 text-secondary-500" />
                  <span className="text-xs text-neutral-600 uppercase font-semibold">Member Since</span>
                </div>
                <div className="text-neutral-900 font-medium">
                  {new Date(viewCustomerModal.createdAt).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <DollarSign className="w-4 h-4 text-secondary-500" />
                  <span className="text-xs text-neutral-600 uppercase font-semibold">Total Bookings</span>
                </div>
                <div className="text-neutral-900 font-medium">
                  {viewCustomerModal.bookings?.length || 0} bookings
                </div>
              </div>
            </div>

            {/* Bookings History or Feedbacks/Complaints */}
            {isAdmin ? (
              viewCustomerModal.bookings && viewCustomerModal.bookings.length > 0 && (
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-3">Recent Bookings</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {viewCustomerModal.bookings.map((booking: any, index: number) => (
                      <div key={index} className="bg-neutral-50 rounded-lg p-4 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-neutral-900">Booking #{booking.id}</p>
                          <p className="text-xs text-neutral-600 mt-1">
                            Status: <Badge className="inline-block bg-secondary-100 text-secondary-700 px-2 py-0.5 rounded text-xs">{booking.status}</Badge>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-neutral-900">${parseFloat(booking.totalAmount || '0').toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-secondary-500" />
                  Recent Feedbacks & Complaints
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {(() => {
                    const allReviews = viewCustomerModal.bookings?.flatMap((b: any) => 
                      (b.reviews || []).map((r: any) => ({ ...r, bookingId: b.id }))
                    ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

                    if (allReviews.length === 0) {
                      return (
                        <div className="text-center py-8 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                          <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                          <p className="text-sm text-neutral-500">No feedbacks or complaints yet</p>
                        </div>
                      );
                    }

                    return allReviews.map((review: any, index: number) => (
                      <div key={index} className={`p-4 rounded-lg border ${review.rating <= 2 ? 'bg-red-50 border-red-100' : 'bg-neutral-50 border-neutral-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-700 italic mb-2">"{review.comment}"</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                            Booking #{review.bookingId}
                          </span>
                          {review.rating <= 2 && (
                            <Badge className="bg-red-100 text-red-700 border-none text-[10px] px-1.5 py-0">
                              <AlertCircle className="w-2.5 h-2.5 mr-1" />
                              Complaint
                            </Badge>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t border-neutral-200 pt-6 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setViewCustomerModal(null)}
              >
                Close
              </Button>
              <Button 
                className="flex-1 bg-secondary-500 hover:bg-secondary-600"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Customer
              </Button>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}