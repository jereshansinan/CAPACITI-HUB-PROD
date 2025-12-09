import React, { useState, useEffect } from 'react';
import { getPendingProfileUpdates, processProfileUpdate, getPendingRequests, updateRequestStatus } from '../services/firebase';
import { ProfileUpdateRequest, LeaveRequest, ITSupportTicket } from '../types';
import { Check, X, Clock, FileText, UserCog, ArrowRight, LayoutList, Loader2 } from 'lucide-react';

const Approvals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'profiles'>('requests');
  const [requests, setRequests] = useState<(LeaveRequest | ITSupportTicket)[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [profileUpdates, setProfileUpdates] = useState<ProfileUpdateRequest[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  useEffect(() => {
    // Fetch generic requests when 'requests' tab is active
    if (activeTab === 'requests') {
        setLoadingRequests(true);
        getPendingRequests().then(data => {
            setRequests(data);
            setLoadingRequests(false);
        });
    }

    // Fetch profile updates when 'profiles' tab is active
    if (activeTab === 'profiles') {
        setLoadingProfiles(true);
        getPendingProfileUpdates().then(data => {
            setProfileUpdates(data);
            setLoadingProfiles(false);
        });
    }
  }, [activeTab]);

  // --- General Request Handlers ---
  const handleRequestAction = async (id: string, action: 'Approved' | 'Rejected' | 'Resolved', item: LeaveRequest | ITSupportTicket) => {
      // Determine type based on properties
      const isLeave = 'type' in item;
      
      const statusToSet = action === 'Resolved' ? 'Resolved' : action;
      
      const result = await updateRequestStatus(id, isLeave, statusToSet);

      if (result.success) {
          setRequests(requests.filter(r => r.id !== id));
          alert(`Request ${action} successfully.`);
      } else {
          alert(`Error updating request: ${result.error}`);
      }
  };

  // --- Profile Update Handlers ---
  const handleProfileApprove = async (request: ProfileUpdateRequest) => {
    const result = await processProfileUpdate(request.id, 'Approved', request.userId, request.updates);
    if (result.success) {
      setProfileUpdates(profileUpdates.filter(u => u.id !== request.id));
      alert("Profile update applied to user record.");
    } else {
        alert("Error approving: " + result.error);
    }
  };

  const handleProfileReject = async (id: string) => {
    const result = await processProfileUpdate(id, 'Rejected');
    if (result.success) {
      setProfileUpdates(profileUpdates.filter(u => u.id !== id));
      alert("Profile update rejected.");
    } else {
        alert("Error rejecting: " + result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Approvals & Workflow</h2>
          <p className="text-slate-500">Review pending requests and profile changes.</p>
        </div>
        
        {/* Toggle Tabs */}
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <LayoutList size={16} />
            <span>Leave & IT ({requests.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('profiles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'profiles' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <UserCog size={16} />
            <span>Profile Updates</span>
          </button>
        </div>
      </div>

      {activeTab === 'requests' ? (
        <div className="grid gap-4">
            {loadingRequests ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center border border-slate-200">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">All Caught Up!</h3>
                    <p className="text-slate-500">There are no pending leave or IT requests.</p>
                </div>
            ) : (
                requests.map(req => {
                    // Type Guard to distinguish
                    const isLeave = 'type' in req;
                    const leaveReq = req as LeaveRequest;
                    const itReq = req as ITSupportTicket;

                    return (
                        <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800">
                                            {isLeave ? `${leaveReq.type} Request` : `IT Support: ${itReq.category}`}
                                        </h3>
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">#{req.id.slice(0, 8)}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-1">
                                        Requested by <span className="font-semibold text-slate-800">{req.userName}</span> on {req.submittedDate}
                                    </p>
                                    
                                    {isLeave ? (
                                        <>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded w-fit mt-2">
                                                <Clock size={14} />
                                                <span>{leaveReq.dates}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-2 italic">Reason: "{leaveReq.reason}"</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded w-fit mt-2">
                                                <span className={`w-2 h-2 rounded-full ${itReq.priority === 'High' || itReq.priority === 'Critical' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                                <span>Priority: {itReq.priority}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-2 italic">Description: "{itReq.description}"</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex gap-3 w-full md:w-auto">
                                <button 
                                  onClick={() => handleRequestAction(req.id, isLeave ? 'Rejected' : 'Resolved', req)}
                                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                >
                                    <X size={18} /> {isLeave ? 'Reject' : 'Close Ticket'}
                                </button>
                                <button 
                                  onClick={() => handleRequestAction(req.id, isLeave ? 'Approved' : 'Resolved', req)}
                                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                >
                                    <Check size={18} /> {isLeave ? 'Approve' : 'Resolve'}
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      ) : (
        <div className="grid gap-4">
            {loadingProfiles ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : profileUpdates.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center border border-slate-200">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No Profile Updates</h3>
                    <p className="text-slate-500">There are no pending profile changes to review.</p>
                </div>
            ) : (
                profileUpdates.map(update => (
                    <div key={update.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                   <UserCog size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Profile Update Request</h3>
                                    <p className="text-sm text-slate-500">Submitted by <span className="font-medium text-slate-700">{update.userName}</span> on {update.submittedDate}</p>
                                </div>
                            </div>
                            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded font-bold">PENDING</span>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-100">
                             <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Proposed Changes</h4>
                             <div className="space-y-3">
                                 {Object.entries(update.updates).map(([key, value]) => {
                                     // Only show fields that actually have a value for simplicity
                                     if (!value) return null; 
                                     return (
                                        <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                                            <span className="font-medium text-slate-600 capitalize">{key}</span>
                                            <div className="md:col-span-2 flex items-center gap-2">
                                                <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-400 text-xs italic">Current Value (Hidden)</span>
                                                <ArrowRight size={14} className="text-slate-400" />
                                                <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 font-medium">{value as string}</span>
                                            </div>
                                        </div>
                                     );
                                 })}
                             </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => handleProfileReject(update.id)}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                            >
                                <X size={16} /> Reject
                            </button>
                            <button 
                                onClick={() => handleProfileApprove(update)}
                                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
                            >
                                <Check size={16} /> Approve Changes
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      )}
    </div>
  );
};

export default Approvals;