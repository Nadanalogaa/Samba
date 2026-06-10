import { useState, useEffect } from 'react';
import { Building2, Phone, Mail, MapPin, User } from 'lucide-react';
import { schoolService } from '../../services/api';
import type { School } from '../../types';

export default function MySchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  useEffect(() => {
    schoolService.getAll().then(setSchools);
  }, []);

  const filtered = selectedDistrict
    ? schools.filter((s) => s.district === selectedDistrict)
    : schools;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Schools</h1>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white text-sm"
        >
          <option value="">All Districts</option>
          {schoolService.getDistricts().map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((school) => (
          <div
            key={school.id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <Building2 className="text-primary-500" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{school.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-info-100 dark:bg-info-900/30 text-info-700 dark:text-info-400 rounded-full">
                  {school.district}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User size={15} className="text-gray-400" />
                <span>{school.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone size={15} className="text-gray-400" />
                <span>{school.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail size={15} className="text-gray-400" />
                <span>{school.email}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={15} className="text-gray-400 mt-0.5" />
                <span>{school.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
