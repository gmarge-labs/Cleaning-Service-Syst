import { useState } from 'react';
import { Star, Calendar, DollarSign, FileText, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// Mock data
const pastBookings = [
  {
    id: 1,
    serviceType: 'Deep Cleaning',
    date: new Date('2025-11-15'),
    cleaner: {
      name: 'Maria Garcia',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    },
    rating: 5,
    total: 189.00,
    reviewed: true,
  },
  {
    id: 2,
    serviceType: 'Standard Cleaning',
    date: new Date('2025-11-08'),
    cleaner: {
      name: 'John Smith',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    },
    rating: 5,
    total: 120.00,
    reviewed: true,
  },
  {
    id: 3,
    serviceType: 'Move In/Out',
    date: new Date('2025-10-28'),
    cleaner: {
      name: 'Emily Chen',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    },
    rating: 4,
    total: 249.00,
    reviewed: true,
  },
  {
    id: 4,
    serviceType: 'Standard Cleaning',
    date: new Date('2025-10-15'),
    cleaner: {
      name: 'Carlos Rodriguez',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
    rating: 5,
    total: 120.00,
    reviewed: true,
  },
  {
    id: 5,
    serviceType: 'Deep Cleaning',
    date: new Date('2025-10-01'),
    cleaner: {
      name: 'Sarah Johnson',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    },
    rating: 5,
    total: 189.00,
    reviewed: true,
  },
];

export function PastBookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredBookings = pastBookings.filter((booking) => {
    const matchesSearch = booking.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.cleaner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || booking.serviceType === filterType;
    return matchesSearch && matchesFilter;
  });

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
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neutral-900">${booking.total.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{booking.date.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                  
                  {booking.reviewed && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < booking.rating
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
                  {!booking.reviewed && (
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
