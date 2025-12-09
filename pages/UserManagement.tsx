
import React, { useState } from 'react';
import { Role, User } from '../types';
import { USERS, COHORTS } from '../services/mockDatabase';
import { registerNewUser, deleteUserDocument } from '../services/firebase';
import { Search, Plus, Filter, Edit2, Trash2, Loader2, Save } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: Role.EMPLOYEE,
    cohortId: '',
    password: 'password123' // Default password
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this user? This cannot be undone.')) {
      setIsProcessing(true);
      const result = await deleteUserDocument(id);
      setIsProcessing(false);
      
      if (result.success) {
          setUsers(users.filter(u => u.id !== id));
          alert("User deleted successfully.");
      } else {
          alert("Error deleting user: " + result.error);
      }
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email || '',
        role: user.role,
        cohortId: user.cohortId || '',
        password: '' // Don't show password for edit
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: Role.EMPLOYEE,
        cohortId: '',
        password: 'password123'
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (editingUser) {
        // Edit Mode (Mock update only for now as full update requires more Firebase logic)
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        setShowModal(false);
        setIsProcessing(false);
        alert('User updated locally.');
    } else {
        // Create Mode (Firebase)
        const result = await registerNewUser({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            cohortId: formData.cohortId
        }, formData.password);

        if (result.success && result.user) {
            setUsers([result.user, ...users]);
            setShowModal(false);
            alert(`User created successfully in Firebase!\nEmail: ${result.user.email}\nPassword: ${formData.password}`);
        } else {
            alert(`Error: ${result.error}`);
        }
        setIsProcessing(false);
    }
  };

  const RoleBadge = ({ role }: { role: Role }) => {
    const styles = {
      [Role.EMPLOYEE]: 'bg-blue-100 text-blue-700',
      [Role.TECH_CHAMPION]: 'bg-purple-100 text-purple-700',
      [Role.MANAGER]: 'bg-orange-100 text-orange-700',
      [Role.ADMIN]: 'bg-red-100 text-red-700',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-500">Manage access and roles.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-slate-500" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] text-slate-900"
          >
            <option value="All">All Roles</option>
            {Object.values(Role).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Cohort</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const userCohort = COHORTS.find(c => c.id === user.cohortId);
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {userCohort ? userCohort.name : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No users found matching your criteria.
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  required
                />
              </div>

              {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input 
                      type="text" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                      required
                    />
                  </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.values(Role).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {formData.role === Role.EMPLOYEE && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign Cohort</label>
                    <select 
                        value={formData.cohortId}
                        onChange={(e) => setFormData({...formData, cohortId: e.target.value})}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">No Cohort Assigned</option>
                        {COHORTS.map(cohort => (
                            <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                        ))}
                    </select>
                </div>
              )}
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>{editingUser ? 'Update User' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
