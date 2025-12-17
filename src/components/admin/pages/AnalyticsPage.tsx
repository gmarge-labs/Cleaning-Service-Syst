import { TrendingUp, DollarSign, Users, Calendar, Download, FileText, CalendarIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock data
const revenueData = [
  { name: 'Mon', revenue: 2400, bookings: 12 },
  { name: 'Tue', revenue: 1800, bookings: 9 },
  { name: 'Wed', revenue: 3200, bookings: 16 },
  { name: 'Thu', revenue: 2800, bookings: 14 },
  { name: 'Fri', revenue: 3600, bookings: 18 },
  { name: 'Sat', revenue: 4200, bookings: 21 },
  { name: 'Sun', revenue: 3400, bookings: 17 },
];

const serviceTypeData = [
  { name: 'Standard Cleaning', value: 45, color: '#FF1493' },
  { name: 'Deep Cleaning', value: 30, color: '#8b5cf6' },
  { name: 'Move In/Out', value: 15, color: '#FF69B4' },
  { name: 'Post-Construction', value: 10, color: '#f59e0b' },
];

const cleanerPerformance = [
  { name: 'Maria Garcia', rating: 4.9, jobs: 234 },
  { name: 'John Smith', rating: 4.8, jobs: 189 },
  { name: 'Emily Chen', rating: 4.95, jobs: 312 },
  { name: 'Carlos Rodriguez', rating: 4.7, jobs: 156 },
  { name: 'Sarah Johnson', rating: 4.85, jobs: 201 },
];

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('week');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get date 7 days ago
  const getWeekAgoDate = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return weekAgo.toISOString().split('T')[0];
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    if (value === 'custom') {
      setShowCustomRange(true);
      setDateFrom(getWeekAgoDate());
      setDateTo(getTodayDate());
    } else {
      setShowCustomRange(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Analytics & Reports</h1>
            <p className="text-neutral-600 mt-1">Track performance and generate insights</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="week" onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Custom Date Range Filter */}
        {showCustomRange && (
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="dateFrom" className="text-sm font-medium text-neutral-700 mb-1.5 block">
                  Date From
                </Label>
                <div className="relative">
                  <input
                    type="date"
                    id="dateFrom"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    max={dateTo || getTodayDate()}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex-1">
                <Label htmlFor="dateTo" className="text-sm font-medium text-neutral-700 mb-1.5 block">
                  Date To
                </Label>
                <div className="relative">
                  <input
                    type="date"
                    id="dateTo"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    min={dateFrom}
                    max={getTodayDate()}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <Button className="bg-primary-500 hover:bg-primary-600">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Apply Filter
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-secondary-500" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">$21,400</div>
          <div className="text-sm text-neutral-600">Revenue This Week</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+8.2%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">107</div>
          <div className="text-sm text-neutral-600">Bookings This Week</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-accent-500" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+15.3%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">32</div>
          <div className="text-sm text-neutral-600">New Customers</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+2.1%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">4.8</div>
          <div className="text-sm text-neutral-600">Average Rating</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FF1493"
                strokeWidth={2}
                dot={{ fill: '#FF1493', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Service Type Distribution */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Service Type Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {serviceTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bookings Chart */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Weekly Bookings</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="bookings" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Cleaners */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Top Performing Cleaners</h2>
          <div className="space-y-4">
            {cleanerPerformance.map((cleaner, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-neutral-900">{cleaner.name}</span>
                    <span className="text-sm text-neutral-600">{cleaner.jobs} jobs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-secondary-500 to-primary-600 rounded-full"
                        style={{ width: `${(cleaner.rating / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-neutral-900">{cleaner.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Generate Reports</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <FileText className="w-6 h-6" />
            <span>Revenue Report</span>
            <span className="text-xs text-neutral-600">PDF / Excel</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <FileText className="w-6 h-6" />
            <span>Bookings Report</span>
            <span className="text-xs text-neutral-600">PDF / Excel</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <FileText className="w-6 h-6" />
            <span>Cleaner Performance</span>
            <span className="text-xs text-neutral-600">PDF / Excel</span>
          </Button>
        </div>
      </div>
    </div>
  );
}