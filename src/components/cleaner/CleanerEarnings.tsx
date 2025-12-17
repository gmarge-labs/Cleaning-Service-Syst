import { ArrowLeft, DollarSign, TrendingUp, Calendar, Clock, CheckCircle, Award, Target } from 'lucide-react';
import { Badge } from '../ui/badge';
import { BottomNavigation } from './BottomNavigation';
import { CleanerView } from './CleanerApp';

interface CleanerEarningsProps {
  currentView: CleanerView;
  onNavigate: (view: CleanerView) => void;
}

interface EarningRecord {
  id: string;
  jobId: string;
  customer: string;
  serviceType: string;
  date: Date;
  duration: string;
  amount: number;
  status: 'paid' | 'pending' | 'processing';
}

// Mock earnings data
const earningsData: EarningRecord[] = [
  {
    id: 'E-001',
    jobId: 'JOB-245',
    customer: 'Sarah Johnson',
    serviceType: 'Deep Cleaning',
    date: new Date(Date.now() - 86400000),
    duration: '3 hours',
    amount: 189.00,
    status: 'paid',
  },
  {
    id: 'E-002',
    jobId: 'JOB-244',
    customer: 'Michael Chen',
    serviceType: 'Standard Cleaning',
    date: new Date(Date.now() - 172800000),
    duration: '2 hours',
    amount: 120.00,
    status: 'paid',
  },
  {
    id: 'E-003',
    jobId: 'JOB-243',
    customer: 'Emily Rodriguez',
    serviceType: 'Move In/Out',
    date: new Date(Date.now() - 259200000),
    duration: '5 hours',
    amount: 249.00,
    status: 'paid',
  },
  {
    id: 'E-004',
    jobId: 'JOB-242',
    customer: 'David Wilson',
    serviceType: 'Deep Cleaning',
    date: new Date(Date.now() - 345600000),
    duration: '3 hours',
    amount: 189.00,
    status: 'paid',
  },
  {
    id: 'E-005',
    jobId: 'JOB-241',
    customer: 'Lisa Anderson',
    serviceType: 'Standard Cleaning',
    date: new Date(Date.now() - 432000000),
    duration: '2 hours',
    amount: 120.00,
    status: 'processing',
  },
  {
    id: 'E-006',
    jobId: 'JOB-240',
    customer: 'James Taylor',
    serviceType: 'Deep Cleaning',
    date: new Date(Date.now() - 518400000),
    duration: '4 hours',
    amount: 210.00,
    status: 'paid',
  },
  {
    id: 'E-007',
    jobId: 'JOB-239',
    customer: 'Maria Santos',
    serviceType: 'Standard Cleaning',
    date: new Date(Date.now() - 604800000),
    duration: '2 hours',
    amount: 120.00,
    status: 'paid',
  },
];

export function CleanerEarnings({ currentView, onNavigate }: CleanerEarningsProps) {
  // Calculate totals
  const totalEarnings = earningsData.reduce((sum, record) => sum + record.amount, 0);
  const weeklyEarnings = earningsData
    .filter(record => record.date.getTime() > Date.now() - 7 * 86400000)
    .reduce((sum, record) => sum + record.amount, 0);
  const monthlyEarnings = earningsData
    .filter(record => record.date.getTime() > Date.now() - 30 * 86400000)
    .reduce((sum, record) => sum + record.amount, 0);
  
  const totalJobs = earningsData.length;
  const totalHours = earningsData.reduce((sum, record) => {
    const hours = parseFloat(record.duration.split(' ')[0]);
    return sum + hours;
  }, 0);
  const averagePerJob = totalEarnings / totalJobs;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: EarningRecord['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-700">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-secondary-500 to-accent-500 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">My Earnings</h1>
            <p className="text-sm text-white/80">Track your income and performance</p>
          </div>
        </div>

        {/* Total Earnings Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="text-center mb-4">
            <div className="text-sm text-white/80 mb-2">Total Earnings (All Time)</div>
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="w-8 h-8" />
              <span className="text-4xl font-bold">{totalEarnings.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold">${weeklyEarnings.toFixed(0)}</div>
              <div className="text-xs text-white/80">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${monthlyEarnings.toFixed(0)}</div>
              <div className="text-xs text-white/80">This Month</div>
            </div>
          </div>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-neutral-200 p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-neutral-900">{totalJobs}</div>
            <div className="text-xs text-neutral-600">Jobs Done</div>
          </div>
          
          <div className="bg-white rounded-xl border border-neutral-200 p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-xl font-bold text-neutral-900">{totalHours.toFixed(0)}</div>
            <div className="text-xs text-neutral-600">Hours</div>
          </div>
          
          <div className="bg-white rounded-xl border border-neutral-200 p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-xl font-bold text-neutral-900">${averagePerJob.toFixed(0)}</div>
            <div className="text-xs text-neutral-600">Avg/Job</div>
          </div>
        </div>

        {/* Performance Bonus Banner */}
        <div className="bg-gradient-to-r from-secondary-500 to-accent-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Holiday Bonus Progress</h3>
              <p className="text-xs text-white/90 mb-2">Complete 50 jobs with 4.8+ rating to earn $500</p>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${(totalJobs / 50) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-white/90">{totalJobs} / 50 jobs</span>
                <span className="text-xs font-semibold">{Math.round((totalJobs / 50) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings History */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="mb-3">
          <h2 className="font-semibold text-neutral-900">Recent Earnings</h2>
          <p className="text-sm text-neutral-600">Your payment history</p>
        </div>
        
        <div className="space-y-3 pb-4">
          {earningsData.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl border border-neutral-200 p-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-900">{record.customer}</h3>
                    {getStatusBadge(record.status)}
                  </div>
                  <p className="text-sm text-neutral-600">{record.serviceType}</p>
                  <p className="text-xs text-neutral-500 mt-1">Job ID: {record.jobId}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600 font-bold text-xl">
                    <DollarSign className="w-5 h-5" />
                    <span>{record.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex items-center gap-4 pt-3 border-t border-neutral-100 text-sm">
                <div className="flex items-center gap-1 text-neutral-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(record.date)}</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-600">
                  <Clock className="w-4 h-4" />
                  <span>{record.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <p className="text-xs text-blue-900 text-center">
            Earnings are processed weekly and deposited every Friday. Processing time: 1-2 business days.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        currentView={currentView} 
        onNavigate={onNavigate}
      />
    </div>
  );
}