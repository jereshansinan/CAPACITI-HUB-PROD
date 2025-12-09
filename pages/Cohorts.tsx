
import React, { useState } from 'react';
import { COHORTS, USERS } from '../services/mockDatabase';
import { Users, Calendar, Briefcase, Search, Mail, Phone, ChevronRight, X, ArrowLeft, User as UserIcon } from 'lucide-react';
import { Role, User } from '../types';

const Cohorts: React.FC = () => {
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewProfile, setViewProfile] = useState<User | null>(null);

  const selectedCohort = COHORTS.find(c => c.id === selectedCohortId);

  // Filter candidates belonging to selected cohort
  const cohortCandidates = USERS.filter(
    u => u.role === Role.EMPLOYEE && u.cohortId === selectedCohortId
  ).filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedCohortId && selectedCohort) {
    // Detail View
    return (
      <div className="space-y-6 relative">
        <button 
          onClick={() => setSelectedCohortId(null)}
          className="flex items-center text-slate-500 hover:text-blue-600 transition-colors gap-2 font-medium"
        >
          <ArrowLeft size={18} /> Back to Cohorts
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <h2 className="text-3xl font-bold text-slate-800">{selectedCohort.name}</h2>
               {selectedCohort.sponsor && (
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 uppercase tracking-wide">
                     Sponsored by {selectedCohort.sponsor}
                  </span>
               )}
            </div>
            <p className="text-slate-500 flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Briefcase size={16} /> {selectedCohort.program}</span>
              <span className="flex items-center gap-1.5"><Calendar size={16} /> Started: {selectedCohort.startDate}</span>
            </p>
          </div>
          <div className="bg-blue-50 px-6 py-4 rounded-xl border border-blue-100 text-center min-w-[150px]">
            <span className="block text-2xl font-bold text-blue-700">{cohortCandidates.length}</span>
            <span className="text-xs font-bold text-blue-400 uppercase">Candidates</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <h3 className="font-semibold text-slate-800">Candidate Roster</h3>
             <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search candidates..."
                   className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cohortCandidates.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-slate-600">
                        <span className="flex items-center gap-2"><Mail size={14} /> {user.email}</span>
                        <span className="flex items-center gap-2"><Phone size={14} /> {user.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        user.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{user.lastActive}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setViewProfile(user)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
                {cohortCandidates.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No candidates found in this cohort.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PROFILE POPUP MODAL */}
        {viewProfile && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
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
                                    <UserIcon size={32} />
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mt-3">{viewProfile.name}</h3>
                        <p className="text-sm text-slate-500 mb-4">{viewProfile.role}</p>

                        <div className="space-y-3 text-sm text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                             <div className="flex items-center gap-3 text-slate-700">
                                 <Mail size={16} className="text-slate-400 shrink-0" />
                                 <span className="truncate">{viewProfile.email}</span>
                             </div>
                             <div className="flex items-center gap-3 text-slate-700">
                                 <Phone size={16} className="text-slate-400 shrink-0" />
                                 <span>{viewProfile.phone || 'N/A'}</span>
                             </div>
                             <div className="flex items-center gap-3 text-slate-700">
                                 <Briefcase size={16} className="text-slate-400 shrink-0" />
                                 <span>{selectedCohort.name}</span>
                             </div>
                             <div className="flex items-center gap-3 text-slate-700">
                                 <div className={`w-4 h-4 rounded-full flex items-center justify-center ${viewProfile.status === 'Active' ? 'bg-green-100' : 'bg-slate-200'}`}>
                                     <div className={`w-2 h-2 rounded-full ${viewProfile.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                                 </div>
                                 <span>{viewProfile.status}</span>
                             </div>
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
  }

  // Master View (List of Cohorts)
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Cohort Management</h2>
        <p className="text-slate-500">View and manage all active cohorts and their candidates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COHORTS.map(cohort => {
          const count = USERS.filter(u => u.cohortId === cohort.id).length;
          return (
            <div 
              key={cohort.id} 
              onClick={() => setSelectedCohortId(cohort.id)}
              className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4 pl-4">
                <div>
                   <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{cohort.name}</h3>
                   <p className="text-sm text-slate-500 mt-1">{cohort.program}</p>
                </div>
                {cohort.sponsor && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center" title={cohort.sponsor}>
                    <Briefcase size={16} className="text-slate-500" />
                  </div>
                )}
              </div>

              <div className="pl-4 space-y-3">
                 <div className="flex items-center justify-between text-sm text-slate-600">
                    <span className="flex items-center gap-2"><Users size={16} className="text-slate-400" /> Candidates</span>
                    <span className="font-bold">{count} / {cohort.size}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm text-slate-600">
                    <span className="flex items-center gap-2"><Calendar size={16} className="text-slate-400" /> Start Date</span>
                    <span>{cohort.startDate}</span>
                 </div>
                 
                 <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-end text-blue-600 text-sm font-medium gap-1 group-hover:translate-x-1 transition-transform">
                    View Roster <ChevronRight size={16} />
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Cohorts;
