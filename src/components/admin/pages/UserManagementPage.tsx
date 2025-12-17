import { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { 
  Users, 
  Search, 
  UserPlus, 
  Mail, 
  Shield, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Filter,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'support';
  status: 'active' | 'pending' | 'suspended';
  joinedDate: string;
  lastActive: string;
}

export function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<string>('support');

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Admin',
      email: 'john@admin.com',
      role: 'admin',
      status: 'active',
      joinedDate: '2024-01-15',
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Sarah Supervisor',
      email: 'sarah@supervisor.com',
      role: 'supervisor',
      status: 'active',
      joinedDate: '2024-02-20',
      lastActive: '1 hour ago'
    },
    {
      id: '3',
      name: 'Mike Support',
      email: 'mike@support.com',
      role: 'support',
      status: 'active',
      joinedDate: '2024-03-10',
      lastActive: '30 minutes ago'
    },
    {
      id: '4',
      name: 'Emily Pending',
      email: 'emily@supervisor.com',
      role: 'supervisor',
      status: 'pending',
      joinedDate: '2024-11-20',
      lastActive: 'Never'
    }
  ]);

  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 'req1',
      name: 'Tom Wilson',
      email: 'tom@supervisor.com',
      requestedRole: 'supervisor',
      requestDate: '2024-11-22'
    },
    {
      id: 'req2',
      name: 'Lisa Chen',
      email: 'lisa@support.com',
      requestedRole: 'support',
      requestDate: '2024-11-21'
    }
  ]);

  const handleApproveRequest = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: request.name,
        email: request.email,
        role: request.requestedRole as 'supervisor' | 'support',
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        lastActive: 'Just now'
      };
      setUsers([...users, newUser]);
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
  };

  const handleAddUser = () => {
    if (newUserName && newUserEmail && newUserRole) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: newUserName,
        email: newUserEmail,
        role: newUserRole as 'admin' | 'supervisor' | 'support',
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        lastActive: 'Just now'
      };
      setUsers([...users, newUser]);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('support');
      setIsAddUserModalOpen(false);
    }
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'suspended' as const } : user
    ));
  };

  const handleActivateUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'active' as const } : user
    ));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'supervisor': return 'bg-secondary-100 text-secondary-800 border-secondary-200';
      case 'support': return 'bg-accent-100 text-accent-800 border-accent-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">User Management</h1>
          <p className="text-neutral-500 mt-1">Manage staff accounts and access control</p>
        </div>
        <Button onClick={() => setIsAddUserModalOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Pending Access Requests */}
      {pendingRequests.length > 0 && (
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-amber-900">Pending Access Requests ({pendingRequests.length})</h2>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">{request.name}</div>
                    <div className="text-sm text-neutral-500">{request.email}</div>
                  </div>
                  <Badge className={getRoleBadgeColor(request.requestedRole)}>
                    {request.requestedRole.charAt(0).toUpperCase() + request.requestedRole.slice(1)}
                  </Badge>
                  <div className="text-xs text-neutral-400">Requested {request.requestDate}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproveRequest(request.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectRequest(request.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Users List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-neutral-700">User</th>
                <th className="text-left p-4 font-medium text-neutral-700">Role</th>
                <th className="text-left p-4 font-medium text-neutral-700">Status</th>
                <th className="text-left p-4 font-medium text-neutral-700">Joined Date</th>
                <th className="text-left p-4 font-medium text-neutral-700">Last Active</th>
                <th className="text-right p-4 font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-neutral-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{user.name}</div>
                        <div className="text-sm text-neutral-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="p-4 text-neutral-600">{user.joinedDate}</td>
                  <td className="p-4 text-neutral-600">{user.lastActive}</td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {user.status === 'active' ? (
                          <DropdownMenuItem 
                            onClick={() => handleSuspendUser(user.id)}
                            className="text-red-600"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleActivateUser(user.id)}
                            className="text-green-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new staff account with specific role and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
              <p className="text-xs text-neutral-500">
                Use @admin.com, @supervisor.com, or @support.com domain
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (Full Access)</SelectItem>
                  <SelectItem value="supervisor">Supervisor (Limited Access)</SelectItem>
                  <SelectItem value="support">Support (Customer Service)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
