import { DollarSign, Calendar, Users, Star, TrendingUp, TrendingDown, Activity, FileText, UserPlus, CheckSquare, Wallet, Download, X, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '../../ui/button';
import { useState, useEffect } from 'react';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';

export function ManagementDashboard({ onNavigate }: { onNavigate?: (page: 'bookings' | 'cleaners' | 'analytics' | 'reviews') => void }) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [approvalsModalOpen, setApprovalsModalOpen] = useState(false);
  const [payrollModalOpen, setPayrollModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('weekly');
  const [reviewDetailsOpen, setReviewDetailsOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchApplications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/admin/stats');
      const data = await response.json();
      if (response.ok) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Fetch dashboard data error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/cleaners/applications');
      const data = await response.json();
      if (response.ok) {
        setApplications(data.filter((app: any) => app.status === 'PENDING'));
      }
    } catch (error) {
      console.error('Fetch applications error:', error);
    }
  };
  
  const handleUpdateApplicationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/cleaners/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Application ${status.toLowerCase()} successfully`);
        fetchApplications();
        setReviewDetailsOpen(false);
      } else {
        toast.error('Failed to update application status');
      }
    } catch (error) {
      console.error('Update application status error:', error);
      toast.error('An error occurred while updating status');
    }
  };
  
  const handleGenerateReport = () => {
    toast.success('📊 Report generated successfully!', {
      description: `${selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} report is ready for download.`
    });
    setReportModalOpen(false);
  };

  const handleOnboardCleaner = () => {
    toast.success('👥 Cleaner onboarding initiated!', {
      description: 'You will be redirected to the cleaner onboarding flow.'
    });
    setOnboardModalOpen(false);
  };

  const handleApproveItem = (itemName: string) => {
    toast.success('✅ Approved!', {
      description: `${itemName} has been approved successfully.`
    });
  };

  const handleProcessPayroll = () => {
    toast.success('💰 Payroll processed!', {
      description: 'Payment instructions have been sent to all cleaners.'
    });
    setPayrollModalOpen(false);
  };

  const stats = [
    {
      label: 'Total Bookings',
      value: dashboardData?.stats?.totalBookings?.toString() || '0',
      change: '+0%',
      trend: 'neutral',
      icon: Calendar,
      color: 'from-secondary-500 to-secondary-600',
      navigateTo: 'bookings' as const,
    },
    {
      label: 'Active Cleaners',
      value: dashboardData?.stats?.activeCleaners?.toString() || '0',
      change: '100% capacity',
      trend: 'neutral',
      icon: Users,
      color: 'from-accent-500 to-accent-600',
      navigateTo: 'cleaners' as const,
    },
    {
      label: 'Total Revenue',
      value: `$${dashboardData?.stats?.totalRevenue?.toLocaleString() || '0'}`,
      change: '+0%',
      trend: 'neutral',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      navigateTo: 'analytics' as const,
    },
    {
      label: 'Avg Rating',
      value: dashboardData?.stats?.avgRating?.toString() || '4.8',
      change: '+0.0',
      trend: 'neutral',
      icon: Star,
      color: 'from-orange-500 to-orange-600',
      navigateTo: 'reviews' as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Management Dashboard</h1>
          <p className="text-neutral-600 mt-1">Overview of business performance and operations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Download Report</Button>
          <Button className="bg-secondary-500 hover:bg-secondary-600">+ Create Manual Booking</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <button
              key={index}
              onClick={() => onNavigate?.(stat.navigateTo)}
              className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.trend !== 'neutral' && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
              <div className="text-sm text-neutral-600">{stat.label}</div>
            </button>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Weekly Revenue</h2>
              <p className="text-sm text-neutral-600">Revenue and bookings this week</p>
            </div>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData?.revenueData || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF1493" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FF1493" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#FF1493" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Type Distribution */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Service Distribution</h2>
              <p className="text-sm text-neutral-600">Bookings by service type</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData?.serviceTypeData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {(dashboardData?.serviceTypeData || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cleaner Performance */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Top Performers</h2>
              <p className="text-sm text-neutral-600">Cleaner leaderboard this week</p>
            </div>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {(dashboardData?.cleanerPerformance || []).length > 0 ? (
              dashboardData.cleanerPerformance.map((cleaner: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">{cleaner.name}</div>
                      <div className="text-sm text-neutral-600">{cleaner.jobs} jobs completed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-neutral-900">{cleaner.rating}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">No performance data available</div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Recent Activity</h2>
              <p className="text-sm text-neutral-600">Latest system events</p>
            </div>
            <Activity className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="space-y-4">
            {(dashboardData?.recentActivity || []).map((activity: any) => {
              const Icon = activity.type === 'booking' ? Calendar : 
                           activity.type === 'cleaner' ? Users :
                           activity.type === 'payment' ? DollarSign : Star;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-secondary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900">{activity.message}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <button 
          onClick={() => setReportModalOpen(true)}
          className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-secondary-300 hover:shadow-md transition-all text-left"
        >
          <div className="text-2xl mb-2">📊</div>
          <div className="font-semibold text-neutral-900">Generate Report</div>
          <div className="text-sm text-neutral-600">Weekly summary</div>
        </button>
        <button 
          onClick={() => setOnboardModalOpen(true)}
          className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-secondary-300 hover:shadow-md transition-all text-left"
        >
          <div className="text-2xl mb-2">👥</div>
          <div className="font-semibold text-neutral-900">Onboard Cleaner</div>
          <div className="text-sm text-neutral-600">Add new staff</div>
        </button>
        <button 
          onClick={() => setApprovalsModalOpen(true)}
          className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-secondary-300 hover:shadow-md transition-all text-left relative"
        >
          {applications.length > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {applications.length}
            </span>
          )}
          <div className="text-2xl mb-2">✅</div>
          <div className="font-semibold text-neutral-900">Pending Approvals</div>
          <div className="text-sm text-neutral-600">{applications.length} items waiting</div>
        </button>
        <button 
          onClick={() => setPayrollModalOpen(true)}
          className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-secondary-300 hover:shadow-md transition-all text-left"
        >
          <div className="text-2xl mb-2">💰</div>
          <div className="font-semibold text-neutral-900">Payroll</div>
          <div className="text-sm text-neutral-600">Process payments</div>
        </button>
      </div>

      {/* Generate Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-secondary-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Generate Report</h2>
                  <p className="text-sm text-neutral-600">Select report type to generate</p>
                </div>
              </div>
              <button 
                onClick={() => setReportModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {['weekly', 'monthly', 'quarterly', 'annual'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedReportType(type)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedReportType === type
                      ? 'border-secondary-500 bg-secondary-50'
                      : 'border-neutral-200 hover:border-secondary-300'
                  }`}
                >
                  <div className="font-semibold text-neutral-900 capitalize">{type} Report</div>
                  <div className="text-sm text-neutral-600 mt-1">
                    {type === 'weekly' && 'Last 7 days performance summary'}
                    {type === 'monthly' && 'Last 30 days comprehensive report'}
                    {type === 'quarterly' && 'Last 3 months business overview'}
                    {type === 'annual' && 'Full year performance analysis'}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setReportModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateReport}
                className="flex-1 bg-secondary-500 hover:bg-secondary-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Cleaner Modal */}
      {onboardModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-accent-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Onboard New Cleaner</h2>
                  <p className="text-sm text-neutral-600">Start the cleaner onboarding process</p>
                </div>
              </div>
              <button 
                onClick={() => setOnboardModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-secondary-50 to-accent-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-neutral-900 mb-3">Onboarding Process Includes:</h3>
              <div className="space-y-2 text-sm text-neutral-700">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-secondary-500" />
                  <span>Personal Information & Contact Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-secondary-500" />
                  <span>Background Check & Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-secondary-500" />
                  <span>Skills Assessment & Training</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-secondary-500" />
                  <span>Document Upload & Compliance</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setOnboardModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleOnboardCleaner}
                className="flex-1 bg-secondary-500 hover:bg-secondary-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Start Onboarding
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Approvals Modal */}
      {approvalsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Pending Approvals</h2>
                  <p className="text-sm text-neutral-600">Review and approve pending items</p>
                </div>
              </div>
              <button 
                onClick={() => setApprovalsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {applications.length > 0 ? (
                applications.map((app) => (
                  <div key={app.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-neutral-900">Cleaner Application - {app.firstName} {app.lastName}</h3>
                        <p className="text-sm text-neutral-600 mt-1">New cleaner application submitted</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700">Pending</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleUpdateApplicationStatus(app.id, 'ACCEPTED')}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedApplication(app);
                          setReviewDetailsOpen(true);
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500">No pending applications</div>
              )}

              {/* Other Pending Items (Mock) */}
              <div className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900">Time Off Request - John Smith</h3>
                    <p className="text-sm text-neutral-600 mt-1">December 20-25, 2025 (5 days)</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">Pending</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveItem('John Smith time off request')}
                  >
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">Decline</Button>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900">Refund Request - Booking #1247</h3>
                    <p className="text-sm text-neutral-600 mt-1">Customer requested refund for cancelled booking ($159.00)</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">Pending</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveItem('Refund request #1247')}
                  >
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">Details</Button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                variant="outline" 
                onClick={() => setApprovalsModalOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Modal */}
      {payrollModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Process Payroll</h2>
                  <p className="text-sm text-neutral-600">Review and process cleaner payments</p>
                </div>
              </div>
              <button 
                onClick={() => setPayrollModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 text-2xl">💡</div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Payroll Period</h3>
                  <p className="text-sm text-blue-700">November 27 - December 3, 2025 (Week 49)</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {cleanerPerformance.slice(0, 5).map((cleaner, index) => (
                <div key={index} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                        {cleaner.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900">{cleaner.name}</div>
                        <div className="text-sm text-neutral-600">{cleaner.jobs} jobs completed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-neutral-900">${(cleaner.jobs * 45).toFixed(2)}</div>
                      <div className="text-sm text-neutral-600">Payment due</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-4 mb-6">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-neutral-900">Total Payroll</span>
                <span className="font-bold text-secondary-500">
                  ${cleanerPerformance.slice(0, 5).reduce((sum, c) => sum + (c.jobs * 45), 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setPayrollModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleProcessPayroll}
                className="flex-1 bg-secondary-500 hover:bg-secondary-600"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Process Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Application Review Details Modal */}
      {reviewDetailsOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center text-white text-lg font-semibold">
                  {selectedApplication.firstName[0]}{selectedApplication.lastName[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">
                    {selectedApplication.firstName} {selectedApplication.lastName}
                  </h2>
                  <p className="text-sm text-neutral-600">Cleaner Application Review</p>
                </div>
              </div>
              <button 
                onClick={() => setReviewDetailsOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Application Details */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-neutral-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary-500" />
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-600">Full Name</label>
                    <p className="font-semibold text-neutral-900">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Email</label>
                    <p className="font-semibold text-neutral-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      {selectedApplication.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Phone</label>
                    <p className="font-semibold text-neutral-900 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      {selectedApplication.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Date of Birth</label>
                    <p className="font-semibold text-neutral-900">{selectedApplication.dateOfBirth}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Gender</label>
                    <p className="font-semibold text-neutral-900">{selectedApplication.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">SSN</label>
                    <p className="font-semibold text-neutral-900">{selectedApplication.ssn}</p>
                  </div>
                  {selectedApplication.idUrl && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-neutral-600">ID Document</label>
                      <div className="mt-2">
                        <a 
                          href={selectedApplication.idUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-50 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          View ID Document
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-neutral-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-secondary-500" />
                  Address Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-neutral-600">Street Address</label>
                    <p className="font-semibold text-neutral-900">{selectedApplication.address}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">City</label>
                    <p className="font-semibold text-neutral-900">{selectedApplication.city}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">State</label>
                    <p className="font-semibold text-neutral-900">{selectedApplication.state}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">ZIP Code</label>
                    <p className="font-semibold text-neutral-900">{selectedApplication.zipCode}</p>
                  </div>
                </div>
              </div>

              {/* References */}
              <div className="bg-neutral-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary-500" />
                  Professional References
                </h3>
                <div className="space-y-6">
                  {/* Reference 1 */}
                  <div className="border-l-4 border-secondary-500 pl-4">
                    <h4 className="font-semibold text-neutral-900 mb-3">Reference 1</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-neutral-600">Name</label>
                        <p className="font-semibold text-neutral-900">{selectedApplication.reference1Name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-neutral-600">Phone</label>
                        <p className="font-semibold text-neutral-900">{selectedApplication.reference1Phone}</p>
                      </div>
                      <div>
                        <label className="text-sm text-neutral-600">Relationship</label>
                        <p className="font-semibold text-neutral-900">
                          {selectedApplication.reference1Relationship}
                          {selectedApplication.reference1Relationship === 'Other' && selectedApplication.reference1RelationshipOther && (
                            <span className="text-neutral-500 font-normal ml-1">({selectedApplication.reference1RelationshipOther})</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-neutral-600">Address</label>
                        <p className="font-semibold text-neutral-900">
                          {selectedApplication.reference1Address}, {selectedApplication.reference1City}, {selectedApplication.reference1State}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reference 2 */}
                  <div className="border-l-4 border-accent-500 pl-4">
                    <h4 className="font-semibold text-neutral-900 mb-3">Reference 2</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-neutral-600">Name</label>
                        <p className="font-semibold text-neutral-900">{selectedApplication.reference2Name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-neutral-600">Phone</label>
                        <p className="font-semibold text-neutral-900">{selectedApplication.reference2Phone}</p>
                      </div>
                      <div>
                        <label className="text-sm text-neutral-600">Relationship</label>
                        <p className="font-semibold text-neutral-900">
                          {selectedApplication.reference2Relationship}
                          {selectedApplication.reference2Relationship === 'Other' && selectedApplication.reference2RelationshipOther && (
                            <span className="text-neutral-500 font-normal ml-1">({selectedApplication.reference2RelationshipOther})</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-neutral-600">Address</label>
                        <p className="font-semibold text-neutral-900">
                          {selectedApplication.reference2Address}, {selectedApplication.reference2City}, {selectedApplication.reference2State}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Info & Agreements */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 text-2xl">📅</div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Application Submitted</h3>
                      <p className="text-sm text-blue-700 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {selectedApplication.submittedDate || new Date(selectedApplication.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Agreements
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${selectedApplication.agreedToBackgroundCheck ? 'bg-green-500 text-white' : 'bg-neutral-200'}`}>
                        {selectedApplication.agreedToBackgroundCheck && <CheckSquare className="w-3 h-3" />}
                      </div>
                      <span className={selectedApplication.agreedToBackgroundCheck ? 'text-green-800' : 'text-neutral-500'}>
                        Background Check Authorized
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${selectedApplication.agreedToTerms ? 'bg-green-500 text-white' : 'bg-neutral-200'}`}>
                        {selectedApplication.agreedToTerms && <CheckSquare className="w-3 h-3" />}
                      </div>
                      <span className={selectedApplication.agreedToTerms ? 'text-green-800' : 'text-neutral-500'}>
                        Terms & Conditions Accepted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-200">
              <Button 
                variant="outline" 
                onClick={() => setReviewDetailsOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button 
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'REJECTED')}
              >
                Reject Application
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'ACCEPTED')}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Approve & Proceed to Onboarding
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}