
import React, { useState, useEffect } from 'react';
import { Role, User } from '../types';
import { createProfileUpdateRequest, getUserPendingUpdates } from '../services/firebase';
import { User as UserIcon, Mail, Phone, MapPin, Edit2, X, Check, Clock, Loader2 } from 'lucide-react';

interface ProfileProps {
    role: Role;
    user: User | null;
}

const Profile: React.FC<ProfileProps> = ({ role, user }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [hasPendingUpdate, setHasPendingUpdate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editForm, setEditForm] = useState({
    phone: '',
    location: '',
    bio: ''
  });

  useEffect(() => {
    // If user prop changes (e.g. from app state), update local state
    if (user) {
        setCurrentUser(user);
        setEditForm({
            phone: user.phone || '',
            location: user.location || '',
            bio: user.bio || ''
        });
        
        // Check for pending updates from Firebase
        getUserPendingUpdates(user.id).then(hasPending => {
            setHasPendingUpdate(hasPending);
        });
    }
  }, [user]);

  const handleSaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);

    const result = await createProfileUpdateRequest({
        userId: currentUser.id,
        userName: currentUser.name,
        status: 'Pending',
        submittedDate: new Date().toISOString().split('T')[0],
        updates: {
            phone: editForm.phone,
            location: editForm.location,
            bio: editForm.bio
        }
    });

    setIsSubmitting(false);

    if (result.success) {
        setHasPendingUpdate(true);
        setIsEditing(false);
    } else {
        alert("Failed to submit update: " + result.error);
    }
  };

  if (!currentUser) return <div>Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {hasPendingUpdate && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in">
          <Clock size={20} />
          <div>
            <p className="font-bold text-sm">Update Pending Approval</p>
            <p className="text-xs opacity-90">Your profile changes have been submitted and are waiting for admin approval.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        {/* Edit Button */}
        {!isEditing && !hasPendingUpdate && (
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
            title="Request Profile Update"
          >
            <Edit2 size={18} />
          </button>
        )}

        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
               <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={40} />
                  )}
               </div>
            </div>
          </div>
          
          <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">{currentUser.name}</h1>
              <div className="flex gap-2 mt-2">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                    {currentUser.role}
                </span>
                <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium">
                    {currentUser.department || 'General'}
                </span>
              </div>
          </div>

          <div className="space-y-4">
              <div className="flex items-center space-x-3 text-slate-600">
                  <Mail size={18} className="text-slate-400" />
                  <span>{currentUser.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                  <Phone size={18} className="text-slate-400" />
                  <span>{currentUser.phone || 'Not set'}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                  <MapPin size={18} className="text-slate-400" />
                  <span>{currentUser.location || 'Not set'}</span>
              </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">Bio</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                  {currentUser.bio || "No bio added yet."}
              </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Edit Profile</h3>
                <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">✕</button>
             </div>
             <form onSubmit={handleSaveRequest} className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 mb-4">
                   Note: Profile updates require admin approval. Changes will not appear immediately.
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                   <input 
                      type="text" 
                      value={editForm.phone} 
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Location / Campus</label>
                   <input 
                      type="text" 
                      value={editForm.location} 
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                   <textarea 
                      value={editForm.bio} 
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                   ></textarea>
                </div>
                
                <div className="pt-2 flex gap-3">
                   <button 
                     type="button" 
                     onClick={() => setIsEditing(false)}
                     className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                   >
                     {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                     <span>Submit Request</span>
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
