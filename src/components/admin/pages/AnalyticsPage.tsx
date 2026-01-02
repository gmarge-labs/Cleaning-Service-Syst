import { TrendingUp, DollarSign, Users, Calendar, Download, FileText, CalendarIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { useState, useEffect } from 'react';
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

export function AnalyticsPage() {
  // Date range state - default to 'all'
  const [dateRange, setDateRange] = useState('all');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Real data from API
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [serviceTypeData, setServiceTypeData] = useState<any[]>([]);
  const [cleanerPerformance, setCleanerPerformance] = useState<any[]>([]);
  const [kpis, setKpis] = useState({
    revenue: 0,
    bookingsCount: 0,
    newCustomers: 0,
    avgRating: 0,
    revenueChange: 0,
    bookingsChange: 0,
    customersChange: 0,
    ratingChange: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);

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

  // Get date range based on selection
  const getDateRange = (range: string, customFrom: string, customTo: string) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date(today);

    switch (range) {
      case 'all':
        // Go back 2 years to capture all data
        startDate = new Date(today);
        startDate.setFullYear(startDate.getFullYear() - 2);
        break;
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'custom':
        startDate = new Date(customFrom);
        endDate = new Date(customTo);
        break;
    }

    return { startDate, endDate };
  };

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch bookings (this endpoint definitely exists)
        const bookingsRes = await fetch('/api/bookings');
        const bookingsData = await bookingsRes.json();
        
        console.log('Fetched bookings:', bookingsData);
        console.log('Total bookings:', bookingsData.length);
        console.log('Sample booking:', bookingsData[0]);
        
        // Get date range based on current selection
        const range = getDateRange(dateRange, dateFrom, dateTo);
        
        // Process data for charts and KPIs with the selected date range
        processAnalyticsData(bookingsData, range.startDate, range.endDate);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [dateRange, dateFrom, dateTo]);

  // Process analytics data
  const processAnalyticsData = (bookingsData: any[], startDate: Date, endDate: Date) => {
    // Filter bookings by date range
    const filteredBookings = bookingsData.filter((booking: any) => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= startDate && bookingDate <= endDate && booking.status === 'COMPLETED';
    });

    // Calculate revenue data by day
    const dayMap: { [key: string]: { revenue: number; bookings: number; count: number } } = {
      'Mon': { revenue: 0, bookings: 0, count: 0 },
      'Tue': { revenue: 0, bookings: 0, count: 0 },
      'Wed': { revenue: 0, bookings: 0, count: 0 },
      'Thu': { revenue: 0, bookings: 0, count: 0 },
      'Fri': { revenue: 0, bookings: 0, count: 0 },
      'Sat': { revenue: 0, bookings: 0, count: 0 },
      'Sun': { revenue: 0, bookings: 0, count: 0 },
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let totalRevenue = 0;
    let totalBookings = 0;
    const serviceTypeMap: { [key: string]: number } = {};
    const cleanerStatsMap: { [key: string]: { jobs: number; ratings: number[]; name: string } } = {};
    
    filteredBookings.forEach((booking: any) => {
      const bookingDate = new Date(booking.date);
      const dayName = dayNames[bookingDate.getDay()];
      const revenue = parseFloat(booking.totalAmount) || 0;
      
      if (dayMap[dayName]) {
        dayMap[dayName].revenue += revenue;
        dayMap[dayName].bookings += 1;
        dayMap[dayName].count += 1;
      }
      
      totalRevenue += revenue;
      totalBookings += 1;
      
      // Service type distribution
      const service = booking.serviceType || 'Other';
      serviceTypeMap[service] = (serviceTypeMap[service] || 0) + 1;
      
      // Extract cleaner stats from claimedBy array
      if (booking.claimedBy && Array.isArray(booking.claimedBy)) {
        booking.claimedBy.forEach((cleaner: any) => {
          if (!cleanerStatsMap[cleaner.id]) {
            cleanerStatsMap[cleaner.id] = {
              jobs: 0,
              ratings: [],
              name: cleaner.name || 'Unknown'
            };
          }
          cleanerStatsMap[cleaner.id].jobs += 1;
          
          // Add rating if available
          if (booking.rating) {
            cleanerStatsMap[cleaner.id].ratings.push(booking.rating);
          }
        });
      }
    });

    // Convert to chart format
    const chartData = dayNames.map(day => ({
      name: day,
      revenue: dayMap[day].revenue,
      bookings: dayMap[day].bookings,
    }));
    
    setRevenueData(chartData);

    // Service type data
    const serviceColors = ['#FF1493', '#8b5cf6', '#FF69B4', '#f59e0b', '#10b981', '#3b82f6'];
    const serviceData = Object.entries(serviceTypeMap).map(([name, value], idx) => ({
      name,
      value,
      color: serviceColors[idx % serviceColors.length],
    }));
    
    setServiceTypeData(serviceData);

    // Cleaner performance - convert to array and sort
    const performance = Object.entries(cleanerStatsMap)
      .map(([id, data]) => {
        const avgRating = data.ratings.length > 0 
          ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length 
          : 0;
        return {
          id,
          name: data.name,
          rating: parseFloat(avgRating.toFixed(2)),
          jobs: data.jobs,
        };
      })
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 5);
    
    setCleanerPerformance(performance);

    // Calculate KPIs
    const avgRating = performance.length > 0 
      ? (performance.reduce((sum, p) => sum + p.rating, 0) / performance.length).toFixed(2)
      : 0;
    
    // Count new customers in the selected date range
    const newCustomersCount = bookingsData.filter((b: any) => {
      const created = new Date(b.createdAt);
      return created >= startDate && created <= endDate && b.status === 'COMPLETED';
    }).length;
    
    setKpis({
      revenue: totalRevenue,
      bookingsCount: totalBookings,
      newCustomers: newCustomersCount,
      avgRating: parseFloat(avgRating as string) || 0,
      revenueChange: 12.5,
      bookingsChange: 8.2,
      customersChange: 15.3,
      ratingChange: 2.1,
    });
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

  const handleApplyCustomFilter = () => {
    // Data will automatically re-fetch when dateFrom and dateTo change
    setShowCustomRange(false);
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
            <Select defaultValue="all" onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
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

              <Button className="bg-primary-500 hover:bg-primary-600" onClick={handleApplyCustomFilter}>
                <CalendarIcon className="w-4 h-4 mr-2" />
                Apply Filter
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-4 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500 mx-auto mb-2"></div>
            <p className="text-neutral-600">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Revenue Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-secondary-500" />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{kpis.revenueChange.toFixed(1)}%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-1">${kpis.revenue.toFixed(2)}</div>
              <div className="text-sm text-neutral-600">Revenue This Week</div>
            </div>

            {/* Bookings Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{kpis.bookingsChange.toFixed(1)}%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-1">{kpis.bookingsCount}</div>
              <div className="text-sm text-neutral-600">Bookings This Week</div>
            </div>

            {/* New Customers Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent-500" />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{kpis.customersChange.toFixed(1)}%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-1">{kpis.newCustomers}</div>
              <div className="text-sm text-neutral-600">New Customers</div>
            </div>

            {/* Average Rating Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{kpis.ratingChange.toFixed(1)}%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-1">{kpis.avgRating.toFixed(1)}</div>
              <div className="text-sm text-neutral-600">Average Rating</div>
            </div>
          </>
        )}
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