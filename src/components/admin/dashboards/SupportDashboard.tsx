import { MessageSquare, Calendar, CheckCircle2, Clock, AlertCircle, User } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

// Mock data
const tickets = [
  {
    id: 1,
    customer: 'Sarah Johnson',
    subject: 'Reschedule Request',
    status: 'New',
    priority: 'High',
    time: '5 min ago',
  },
  {
    id: 2,
    customer: 'Michael Chen',
    subject: 'Payment Issue',
    status: 'In Progress',
    priority: 'Medium',
    time: '15 min ago',
  },
  {
    id: 3,
    customer: 'Emily Rodriguez',
    subject: 'Service Inquiry',
    status: 'New',
    priority: 'Low',
    time: '1 hour ago',
  },
];

const upcomingFollowUps = [
  {
    id: 1,
    customer: 'John Smith',
    reason: 'Post-service follow-up',
    dueDate: new Date('2025-11-23'),
    status: 'Pending',
  },
  {
    id: 2,
    customer: 'Lisa Wang',
    reason: 'Resolve complaint',
    dueDate: new Date('2025-11-23'),
    status: 'Overdue',
  },
];

export function SupportDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Support Dashboard</h1>
        <p className="text-neutral-600 mt-1">Manage customer inquiries and support tickets</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-secondary-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">12</div>
          <div className="text-sm text-neutral-600">Open Tickets</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">3</div>
          <div className="text-sm text-neutral-600">Pending Follow-ups</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">45</div>
          <div className="text-sm text-neutral-600">Resolved Today</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">4.8</div>
          <div className="text-sm text-neutral-600">Avg Response Time (min)</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">Recent Tickets</h2>
            <Button variant="ghost" className="text-secondary-500">View All</Button>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 border border-neutral-200 rounded-lg hover:border-secondary-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">{ticket.subject}</h3>
                    <p className="text-sm text-neutral-600">{ticket.customer}</p>
                  </div>
                  <Badge
                    className={
                      ticket.status === 'New'
                        ? 'bg-secondary-100 text-secondary-700'
                        : 'bg-orange-100 text-orange-700'
                    }
                  >
                    {ticket.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Badge
                    variant="outline"
                    className={
                      ticket.priority === 'High'
                        ? 'border-red-500 text-red-700'
                        : ticket.priority === 'Medium'
                        ? 'border-orange-500 text-orange-700'
                        : 'border-green-500 text-green-700'
                    }
                  >
                    {ticket.priority}
                  </Badge>
                  <span className="text-neutral-500">{ticket.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-ups */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">Upcoming Follow-ups</h2>
            <Button variant="ghost" className="text-secondary-500">View All</Button>
          </div>

          <div className="space-y-4">
            {upcomingFollowUps.map((followUp) => (
              <div
                key={followUp.id}
                className="p-4 border border-neutral-200 rounded-lg hover:border-secondary-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{followUp.customer}</h3>
                    <p className="text-sm text-neutral-600">{followUp.reason}</p>
                  </div>
                  <Badge
                    className={
                      followUp.status === 'Overdue'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-secondary-100 text-secondary-700'
                    }
                  >
                    {followUp.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {followUp.dueDate.toLocaleDateString()}</span>
                </div>
                <Button size="sm" className="mt-3 w-full">Complete Follow-up</Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <MessageSquare className="w-6 h-6" />
            <span className="text-sm">New Ticket</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Calendar className="w-6 h-6" />
            <span className="text-sm">Schedule Call</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm">Create Alert</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <CheckCircle2 className="w-6 h-6" />
            <span className="text-sm">View Templates</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
