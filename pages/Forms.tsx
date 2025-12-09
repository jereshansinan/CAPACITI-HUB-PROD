
import React, { useState, useEffect } from 'react';
import { LeaveRequest, ITSupportTicket, User } from '../types';
import { createLeaveRequest, createITTicket, getUserRequests } from '../services/firebase';
import { CheckCircle, Loader2, History, Clock, AlertTriangle, Check, X } from 'lucide-react';

interface FormsProps {
    user: User | null;
}

const Forms: React.FC<FormsProps> = ({ user }) => {
  // --- LEAVE FORM STATE ---
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // --- IT FORM STATE ---
  const [itCategory, setItCategory] = useState('Hardware Fault');
  const [itPriority, setItPriority] = useState('Low');
  const [itDescription, setItDescription] = useState('');
  const [itSubmitting, setItSubmitting] = useState(false);
  const [itSuccess, setItSuccess] = useState(false);

  // --- HISTORY STATE ---
  const [requestHistory, setRequestHistory] = useState<(LeaveRequest | ITSupportTicket)[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    if (user) {
        setLoadingHistory(true);
        const data = await getUserRequests(user.id);
        setRequestHistory(data);
        setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveReason) return;
    if (!user) {
        alert("User session not found. Please log in.");
        return;
    }
    
    setLeaveSubmitting(true);
    
    const newRequest: Omit<LeaveRequest, 'id'> = {
        userId: user.id,
        userName: user.name,
        type: leaveType,
        dates: `${startDate} to ${endDate}`,
        reason: leaveReason,
        status: 'Pending',
        submittedDate: new Date().toISOString().split('T')[0]
    };

    const result = await createLeaveRequest(newRequest);

    setLeaveSubmitting(false);

    if (result.success) {
        setLeaveSuccess(true);
        // Reset form
        setStartDate('');
        setEndDate('');
        setLeaveReason('');
        
        // Refresh history
        fetchHistory();

        // Clear success message after 3 seconds
        setTimeout(() => setLeaveSuccess(false), 3000);
    } else {
        alert("Failed to submit leave request: " + result.error);
    }
  };

  const handleITSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itDescription) return;
    if (!user) {
        alert("User session not found. Please log in.");
        return;
    }

    setItSubmitting(true);

    const newTicket: Omit<ITSupportTicket, 'id'> = {
        userId: user.id,
        userName: user.name,
        category: itCategory,
        priority: itPriority,
        description: itDescription,
        status: 'Open',
        submittedDate: new Date().toISOString().split('T')[0]
    };

    const result = await createITTicket(newTicket);

    setItSubmitting(false);

    if (result.success) {
        setItSuccess(true);
        // Reset Form
        setItDescription('');
        setItPriority('Low');
        
        // Refresh History
        fetchHistory();

        setTimeout(() => setItSuccess(false), 3000);
    } else {
        alert("Failed to create ticket: " + result.error);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'Approved':
        case 'Resolved':
            return <span className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded"><Check size={12} /> {status}</span>;
        case 'Rejected':
            return <span className="flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded"><X size={12} /> {status}</span>;
        case 'In Progress':
            return <span className="flex items-center gap-1 text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded"><Loader2 size={12} className="animate-spin" /> {status}</span>;
        default: // Pending, Open
            return <span className="flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded"><Clock size={12} /> {status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-slate-800">Digital Forms</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
         {/* Leave Request */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-4 text-blue-700">Leave Request</h3>
            
            {leaveSuccess ? (
                <div className="h-[300px] flex flex-col items-center justify-center animate-in fade-in">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">Request Sent</h4>
                    <p className="text-slate-500 mt-2 text-center">Your leave request has been submitted for approval.</p>
                    <button onClick={() => setLeaveSuccess(false)} className="mt-6 text-blue-600 text-sm font-medium hover:underline">Submit another request</button>
                </div>
            ) : (
                <form className="space-y-4" onSubmit={handleLeaveSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                        <select 
                            value={leaveType}
                            onChange={(e) => setLeaveType(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900"
                        >
                            <option>Annual Leave</option>
                            <option>Sick Leave</option>
                            <option>Family Responsibility</option>
                            <option>Study Leave</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900" 
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900" 
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                        <textarea 
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm h-24 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="Please provide a brief reason..."
                            required
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        disabled={leaveSubmitting}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {leaveSubmitting && <Loader2 size={16} className="animate-spin" />}
                        {leaveSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            )}
         </div>

         {/* IT Support */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-4 text-slate-700">IT Support Ticket</h3>
            
            {itSuccess ? (
                <div className="h-[300px] flex flex-col items-center justify-center animate-in fade-in">
                    <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">Ticket Logged</h4>
                    <p className="text-slate-500 mt-2 text-center">Support ticket created. IT will contact you shortly.</p>
                    <button onClick={() => setItSuccess(false)} className="mt-6 text-slate-600 text-sm font-medium hover:underline">Log another issue</button>
                </div>
            ) : (
                <form className="space-y-4" onSubmit={handleITSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select 
                            value={itCategory}
                            onChange={(e) => setItCategory(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900"
                        >
                            <option>Hardware Fault</option>
                            <option>Software Installation</option>
                            <option>Network/Connectivity</option>
                            <option>Account Access</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                        <select 
                            value={itPriority}
                            onChange={(e) => setItPriority(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900"
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Critical</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea 
                            value={itDescription}
                            onChange={(e) => setItDescription(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm h-24 text-slate-900 focus:ring-2 focus:ring-slate-500 outline-none" 
                            placeholder="Describe the issue..."
                            required
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        disabled={itSubmitting}
                        className="w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-900 transition flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {itSubmitting && <Loader2 size={16} className="animate-spin" />}
                        {itSubmitting ? 'Logging Ticket...' : 'Log Ticket'}
                    </button>
                </form>
            )}
         </div>
      </div>

      {/* REQUEST HISTORY SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
             <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                 <History size={18} className="text-slate-500" /> My Request History
             </h3>
             <button onClick={fetchHistory} className="text-xs text-blue-600 hover:underline">Refresh</button>
        </div>
        
        {loadingHistory ? (
            <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
        ) : requestHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
                You haven't submitted any requests yet.
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Date Submitted</th>
                            <th className="px-6 py-3">Details</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {requestHistory.map((req) => {
                            const isLeave = 'type' in req;
                            const leaveReq = req as LeaveRequest;
                            const itReq = req as ITSupportTicket;

                            return (
                                <tr key={req.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-800">
                                            {isLeave ? 'Leave Request' : 'IT Ticket'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {isLeave ? leaveReq.type : itReq.category}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {req.submittedDate}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isLeave ? (
                                            <div>
                                                <div className="text-xs font-semibold text-slate-600">Dates: {leaveReq.dates}</div>
                                                <div className="text-xs text-slate-500 truncate max-w-[200px]">{leaveReq.reason}</div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-xs font-semibold text-slate-600">Priority: {itReq.priority}</div>
                                                <div className="text-xs text-slate-500 truncate max-w-[200px]">{itReq.description}</div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={req.status} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default Forms;
