import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, DollarSign, Search, Filter, Eye, Edit } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { AddCustomerFlow } from '../AddCustomerFlow';

// Mock data
const customers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Apt 4B, New York, NY',
    joinDate: new Date('2024-05-15'),
    totalBookings: 12,
    totalSpent: 2340,
    status: 'Active',
    lastBooking: new Date('2025-11-15'),
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '(555) 234-5678',
    address: '456 Oak Ave, Suite 12, New York, NY',
    joinDate: new Date('2024-07-20'),
    totalBookings: 8,
    totalSpent: 1560,
    status: 'Active',
    lastBooking: new Date('2025-11-10'),
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    phone: '(555) 345-6789',
    address: '789 Pine Rd, New York, NY',
    joinDate: new Date('2024-03-10'),
    totalBookings: 18,
    totalSpent: 3420,
    status: 'VIP',
    lastBooking: new Date('2025-11-20'),
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '(555) 456-7890',
    address: '321 Elm St, New York, NY',
    joinDate: new Date('2024-09-05'),
    totalBookings: 4,
    totalSpent: 780,
    status: 'Active',
    lastBooking: new Date('2025-10-25'),
  },
  {
    id: 5,
    name: 'Lisa Wang',
    email: 'lisa.wang@example.com',
    phone: '(555) 567-8901',
    address: '555 Maple Dr, New York, NY',
    joinDate: new Date('2023-12-15'),
    totalBookings: 25,
    totalSpent: 4850,
    status: 'VIP',
    lastBooking: new Date('2025-11-18'),
  },
];

const statusColors = {
  'Active': 'bg-green-100 text-green-700',
  'VIP': 'bg-purple-100 text-purple-700',
  'Inactive': 'bg-neutral-100 text-neutral-700',
};

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (showAddCustomer) {
    return (
      <AddCustomerFlow
        onComplete={() => setShowAddCustomer(false)}
        onCancel={() => setShowAddCustomer(false)}
      />
    );
  }

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
          <div className="text-2xl font-bold text-neutral-900">{customers.length}</div>
          <div className="text-sm text-neutral-600">Total Customers</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {customers.filter(c => c.status === 'Active').length}
          </div>
          <div className="text-sm text-neutral-600">Active</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {customers.filter(c => c.status === 'VIP').length}
          </div>
          <div className="text-sm text-neutral-600">VIP Members</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-secondary-500">$14.2K</div>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Contact</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Location</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Join Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Bookings</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Total Spent</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Status</th>
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
                        <div className="text-sm text-neutral-600">ID: #{customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="max-w-xs truncate">{customer.address}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Calendar className="w-4 h-4" />
                      {customer.joinDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-neutral-900">{customer.totalBookings}</div>
                      <div className="text-xs text-neutral-600">bookings</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-neutral-900 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      {customer.totalSpent.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge className={statusColors[customer.status as keyof typeof statusColors]}>
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
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
            Showing <span className="font-medium">1-{filteredCustomers.length}</span> of <span className="font-medium">{filteredCustomers.length}</span> customers
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="bg-secondary-500 text-white hover:bg-secondary-600">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}