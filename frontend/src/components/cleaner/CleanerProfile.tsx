import { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Clock, Save, Edit2, IdCard, CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { BottomNavigation } from './BottomNavigation';
import { CleanerView } from './CleanerApp';

interface CleanerProfileProps {
  currentView: CleanerView;
  onNavigate: (view: CleanerView) => void;
}

interface ProfileData {
  name: string;
  cleanerId: string;
  email: string;
  phone: string;
  address: string;
  preferredWorkingDays: string[];
  preferredWorkingShift: string;
  isActive: boolean;
  joinDate: string;
  rating: number;
  completedJobs: number;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const shifts = ['Morning (6 AM - 12 PM)', 'Afternoon (12 PM - 6 PM)', 'Evening (6 PM - 12 AM)', 'Flexible'];

export function CleanerProfile({ currentView, onNavigate }: CleanerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Maria Garcia',
    cleanerId: 'CLN-12845',
    email: 'maria.garcia@Sparkleville.com',
    phone: '+1 (555) 123-4567',
    address: '456 Maple Avenue, Apt 3B, New York, NY 10001',
    preferredWorkingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    preferredWorkingShift: 'Morning (6 AM - 12 PM)',
    isActive: true,
    joinDate: 'January 15, 2024',
    rating: 4.9,
    completedJobs: 247,
  });

  const [editedProfile, setEditedProfile] = useState<ProfileData>(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast.success('✅ Profile Updated Successfully!', {
      description: 'Your profile information has been saved.',
      duration: 2000,
    });
  };

  const toggleWorkingDay = (day: string) => {
    if (editedProfile.preferredWorkingDays.includes(day)) {
      setEditedProfile({
        ...editedProfile,
        preferredWorkingDays: editedProfile.preferredWorkingDays.filter(d => d !== day),
      });
    } else {
      setEditedProfile({
        ...editedProfile,
        preferredWorkingDays: [...editedProfile.preferredWorkingDays, day],
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-secondary-500 to-accent-500 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold">My Profile</h1>
            <p className="text-sm text-white/80">Manage your information</p>
          </div>
          {!isEditing && (
            <Button
              onClick={handleEdit}
              size="sm"
              className="bg-white/20 hover:bg-white/30 border-0"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <IdCard className="w-4 h-4" />
                <span className="text-sm text-white/90 font-mono">{profile.cleanerId}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.rating}</div>
              <div className="text-xs text-white/80">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.completedJobs}</div>
              <div className="text-xs text-white/80">Jobs Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">8</div>
              <div className="text-xs text-white/80">Months</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 pb-24`}>
        {/* Availability Status */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4">Availability Status</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Accept New Jobs</p>
              <p className="text-sm text-neutral-600">
                {isEditing ? (
                  editedProfile.isActive 
                    ? 'You are currently available for new job assignments' 
                    : 'You will not receive new job assignments'
                ) : (
                  profile.isActive 
                    ? 'You are currently available for new job assignments' 
                    : 'You will not receive new job assignments'
                )}
              </p>
            </div>
            {isEditing ? (
              <button
                onClick={() => setEditedProfile({ ...editedProfile, isActive: !editedProfile.isActive })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  editedProfile.isActive ? 'bg-green-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    editedProfile.isActive ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            ) : (
              <Badge className={profile.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-700'}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-sm"
                />
              ) : (
                <p className="font-medium text-neutral-900">{profile.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedProfile.phone}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-sm"
                />
              ) : (
                <p className="font-medium text-neutral-900">{profile.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                <MapPin className="w-4 h-4" />
                Home Address
              </label>
              {isEditing ? (
                <textarea
                  value={editedProfile.address}
                  onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-sm resize-none"
                />
              ) : (
                <p className="font-medium text-neutral-900">{profile.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Work Preferences */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4">Work Preferences</h3>
          
          {/* Preferred Working Days */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
              <Calendar className="w-4 h-4" />
              Preferred Working Days
            </label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleWorkingDay(day)}
                    className={`px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                      editedProfile.preferredWorkingDays.includes(day)
                        ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    {editedProfile.preferredWorkingDays.includes(day) && (
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                    )}
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.preferredWorkingDays.map((day) => (
                  <Badge key={day} className="bg-secondary-100 text-secondary-700 px-3 py-1">
                    {day}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Preferred Working Shift */}
          <div>
            <label className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
              <Clock className="w-4 h-4" />
              Preferred Working Shift
            </label>
            {isEditing ? (
              <div className="space-y-2">
                {shifts.map((shift) => (
                  <button
                    key={shift}
                    onClick={() => setEditedProfile({ ...editedProfile, preferredWorkingShift: shift })}
                    className={`w-full px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                      editedProfile.preferredWorkingShift === shift
                        ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    {editedProfile.preferredWorkingShift === shift && (
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                    )}
                    {shift}
                  </button>
                ))}
              </div>
            ) : (
              <Badge className="bg-secondary-100 text-secondary-700 text-sm px-3 py-2">
                {profile.preferredWorkingShift}
              </Badge>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Member Since</span>
              <span className="font-medium text-neutral-900">{profile.joinDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Account Status</span>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Verification</span>
              <Badge className="bg-blue-100 text-blue-700">
                <CheckCircle className="w-3 h-3 mr-1 inline" />
                Verified
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="flex-1 h-10 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 h-10 text-sm"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        currentView={currentView} 
        onNavigate={onNavigate}
      />
    </div>
  );
}