import { useState } from 'react';
import { User, Mail, Phone, MapPin, Building2, Save, Camera } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    district: user?.district || '',
    schoolName: user?.schoolName || '',
  });

  const handleSave = () => {
    setIsEditing(false);
    // TODO: API call to update profile
  };

  const roleLabels = {
    admin: 'Administrator',
    representative: 'Sales Representative',
    school: 'School',
    individual: 'Individual Buyer',
  };

  const roleBadgeColors = {
    admin: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
    representative: 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400',
    school: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
    individual: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-info-500" />
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-slate-800">
                {user.name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-white hover:bg-secondary-600 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <div className="ml-4 mb-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${roleBadgeColors[user.role]}`}>
                {roleLabels[user.role]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 rounded-lg transition-colors"
            >
              <Save size={16} />
              Save Changes
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <User className="text-primary-500" size={20} />
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg text-gray-900 dark:text-white text-sm"
                />
              ) : (
                <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <Mail className="text-primary-500" size={20} />
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg text-gray-900 dark:text-white text-sm"
                />
              ) : (
                <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <Phone className="text-primary-500" size={20} />
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg text-gray-900 dark:text-white text-sm"
                />
              ) : (
                <p className="text-gray-900 dark:text-white font-medium">{user.phone}</p>
              )}
            </div>
          </div>

          {user.district && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <MapPin className="text-primary-500" size={20} />
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">District</label>
                <p className="text-gray-900 dark:text-white font-medium">{user.district}</p>
              </div>
            </div>
          )}

          {user.schoolName && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <Building2 className="text-primary-500" size={20} />
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">School Name</label>
                <p className="text-gray-900 dark:text-white font-medium">{user.schoolName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
