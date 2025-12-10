
import React, { useState, useMemo } from 'react';
import { USERS, COHORTS } from '../services/mockDatabase';
import { Search, Mail, Phone, MapPin, Briefcase, Filter, MessageSquare, ExternalLink, BadgeCheck, X, Users as UsersIcon, User } from 'lucide-react';
import { Role, User as UserType } from '../types';

const Directory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedCohort, setSelectedCohort] = useState('All');
  const [viewProfile, setViewProfile] = useState<UserType | null>(null);

  // Extract unique departments
  const departments = useMemo(() => {
    const depts = new Set(USERS.map(u => u.department).filter(Boolean));
    return ['All', ...Array.from(depts)];
  }, []);

  const roles = ['All', ...Object.values(Role)];
  const cohorts = ['All', ...COHORTS.map(c => c.name)];

  const filteredUsers = USERS.filter(user => {
    const term = searchTerm.toLowerCase();
    const userCohort = COHORTS.find(c => c.id === user.cohortId);
    
    const matchesSearch = 
      user.name.toLowerCase().includes(term) || 
      user.email?.toLowerCase().includes(term) ||
      user.department?.toLowerCase().includes(term);
    
    const matchesDept = selectedDept === 'All' || user.department === selectedDept;
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    
    const matchesCohort = selectedCohort === 'All' || (userCohort && userCohort.name === selectedCohort);

    return matchesSearch && matchesDept && matchesRole && matchesCohort;
  });

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return 'bg-red-50 text-red-700 border-red-200';
      case Role.MANAGER: return 'bg-orange-50 text-orange-700 border-orange-200';
      case Role.TECH_CHAMPION: return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getBannerColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return 'from-red-500 to-pink-600';
      case Role.MANAGER: return 'from-orange-400 to-amber-500';
      case Role.TECH_CHAMPION: return 'from-purple-500 to-indigo-600';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDept('All');
    setSelectedRole('All');
    setSelectedCohort('All');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Employee Directory</h2>
          <p className="text-slate-500 mt-2">Connect with {USERS.length} talented individuals across the organization.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
             <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Users</div>
             <div className="text-2xl font-bold text-slate-800">{USERS.length}</div>
           </div>
           <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
             <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active Now</div>
             <div className="text-2xl font-bold text-green-600">{USERS.filter(u => u.status === 'Active').length}</div>
           </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 sticky top-20 z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-900"
          />
          {searchTerm && (
            <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
                <X size={16} />
            </button>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative min-w-[180px]">
             <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer text-sm font-medium text-slate-900"
             >
                {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
             </select>
             <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>

          <div className="relative min-w-[180px]">
             <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer text-sm font-medium text-slate-900"
             >
                {roles.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
             </select>
             <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>

          <div className="relative min-w-[180px]">
             <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer text-sm font-medium text-slate-900"
             >
                {cohorts.map(c => <option key={c} value={c}>{c === 'All' ? 'All Cohorts' : c}</option>)}
             </select>
             <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map(user => {
            const cohort = COHORTS.find(c => c.id === user.cohortId);
            return (
              <div key={user.id} className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                {/* Card Banner */}
                <div className={`h-20 w-full bg-gradient-to-r ${getBannerColor(user.role)} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className="px-5 flex-1 flex flex-col relative">
                  {/* Avatar */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                      <div className="w-20 h-20 rounded-full bg-white p-1.5 shadow-md">
                          <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 border border-slate-200 overflow-hidden">
                              {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                  <span className="uppercase">{user.name.charAt(0)}</span>
                              )}
                          </div>
                          {/* Status Dot */}
                          <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
                              user.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'
                          }`} title={user.status}></div>
                      </div>
                  </div>

                  <div className="mt-12 text-center mb-6">
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{user.name}</h3>
                    <div className="flex justify-center mt-2 flex-wrap gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                      </span>
                      {cohort?.sponsor && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100">
                             {cohort.sponsor}
                          </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm text-slate-600 mb-6">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-colors">
                      <Briefcase size={16} className="text-slate-400 shrink-0" />
                      <div className="overflow-hidden">
                          <p className="truncate font-medium">{user.department || 'General Staff'}</p>
                          {cohort && <p className="text-xs text-slate-400 truncate">{cohort.name}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-2">
                      <Mail size={16} className="text-slate-400 shrink-0" />
                      <a href={`mailto:${user.email}`} className="truncate hover:text-blue-600 transition-colors">{user.email}</a>
                    </div>
                    <div className="flex items-center gap-3 px-2">
                      <Phone size={16} className="text-slate-400 shrink-0" />
                      <span className="truncate">{user.phone || 'Extension N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 px-2">
                      <MapPin size={16} className="text-slate-400 shrink-0" />
                      <span>{user.location || 'Cape Town Campus'}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                      <a 
                        href={`mailto:${user.email}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-900 transition-colors shadow-sm"
                      >
                          <MessageSquare size={14} /> Message
                      </a>
                      <button 
                        onClick={() => setViewProfile(user)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors border border-slate-200"
                      >
                          <ExternalLink size={14} /> Profile
                      </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-slate-200 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No employees found</h3>
            <p className="text-slate-500 max-w-md text-center mb-8">
                We couldn't find any team members matching your current filters. 
                Try adjusting your search criteria or looking for a different department.
            </p>
            <button 
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
                <X size={18} />
                Clear all filters
            </button>
        </div>
      )}

      {/* PROFILE POPUP MODAL */}
      {viewProfile && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className={`h-24 bg-gradient-to-r ${getBannerColor(viewProfile.role)} relative`}>
                    <button 
                        onClick={() => setViewProfile(null)}
                        className="absolute top-2 right-2 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="px-6 pb-6 text-center -mt-10">
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-white mx-auto shadow-md overflow-hidden flex items-center justify-center">
                        {viewProfile.avatar ? (
                            <img src={viewProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                <User size={32} />
                            </div>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mt-3">{viewProfile.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{viewProfile.role}</p>

                    <div className="space-y-3 text-sm text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <div className="flex items-center gap-3 text-slate-700">
                             <Mail size={16} className="text-slate-400 shrink-0" />
                             <a href={`mailto:${viewProfile.email}`} className="truncate hover:text-blue-600 underline-offset-2 hover:underline">
                                {viewProfile.email}
                             </a>
                         </div>
                         <div className="flex items-center gap-3 text-slate-700">
                             <Phone size={16} className="text-slate-400 shrink-0" />
                             <span>{viewProfile.phone || 'N/A'}</span>
                         </div>
                         <div className="flex items-center gap-3 text-slate-700">
                             <Briefcase size={16} className="text-slate-400 shrink-0" />
                             <span>{viewProfile.department || 'General'}</span>
                         </div>
                         <div className="flex items-center gap-3 text-slate-700">
                             <MapPin size={16} className="text-slate-400 shrink-0" />
                             <span>{viewProfile.location || 'Cape Town Campus'}</span>
                         </div>
                         <div className="flex items-center gap-3 text-slate-700">
                             <div className={`w-4 h-4 rounded-full flex items-center justify-center ${viewProfile.status === 'Active' ? 'bg-green-100' : 'bg-slate-200'}`}>
                                 <div className={`w-2 h-2 rounded-full ${viewProfile.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                             </div>
                             <span>{viewProfile.status || 'Active'}</span>
                         </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                       <p className="text-xs text-slate-500 italic text-left">
                         "{viewProfile.bio || 'No bio available.'}"
                       </p>
                    </div>

                    <button 
                        onClick={() => setViewProfile(null)}
                        className="mt-6 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Directory;
