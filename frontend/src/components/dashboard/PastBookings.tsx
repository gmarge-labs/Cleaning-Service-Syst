import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Star, Calendar, DollarSign, FileText, RefreshCw, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api } from '../../utils/api';

export function PastBookings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchPastBookings();
    }
  }, [user?.id]);

  const fetchPastBookings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/bookings?userId=${user?.id}&status=COMPLETED`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching past bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const serviceType = booking.serviceType || '';
    const cleanerName = booking.claimedBy?.[0]?.name || 'Cleaner';
    
    const matchesSearch = serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cleanerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || serviceType === filterType;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-secondary-500 animate-spin mb-4" />
        <p className="text-neutral-600">Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Booking History</h1>
        <p className="text-neutral-600">View past cleanings and leave reviews</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Search by service or cleaner name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="Standard Cleaning">Standard Cleaning</SelectItem>
              <SelectItem value="Deep Cleaning">Deep Cleaning</SelectItem>
              <SelectItem value="Move In/Out">Move In/Out</SelectItem>
              <SelectItem value="Post-Construction">Post-Construction</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Details */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900">{booking.serviceType}</h3>
                    <p className="text-sm text-neutral-500">Cleaner: {booking.claimedBy?.[0]?.name || 'Professional Cleaner'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neutral-900">${Number(booking.totalAmount).toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(booking.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                  
                  {booking.reviews && booking.reviews.length > 0 && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < booking.reviews[0].rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Completed
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Rebook
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    View Receipt
                  </Button>
                  {(!booking.reviews || booking.reviews.length === 0) && (
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Leave Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Bookings Found</h3>
          <p className="text-neutral-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
