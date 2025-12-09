
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CertVerifier from './pages/CertVerifier';
import RiskAnalytics from './pages/RiskAnalytics';
import Profile from './pages/Profile';
import Forms from './pages/Forms';
import UserManagement from './pages/UserManagement';
import Directory from './pages/Directory';
import Documents from './pages/Documents';
import Learning from './pages/Learning';
import Performance from './pages/Performance';
import Approvals from './pages/Approvals';
import Login from './pages/Login';
import StudentFeedback from './pages/StudentFeedback';
import CreateAnnouncement from './pages/CreateAnnouncement';
import Cohorts from './pages/Cohorts';
import { Role, User } from './types';
import { Menu, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role>(Role.EMPLOYEE);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setIsAuthenticated(true);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRole(Role.EMPLOYEE);
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  // Helper to render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard role={currentRole} user={currentUser} />;
      case 'certs':
        return <CertVerifier />;
      case 'risk':
        return <RiskAnalytics />;
      case 'profile':
        return <Profile role={currentRole} user={currentUser} />;
      case 'forms':
        return <Forms user={currentUser} />;
      case 'admin':
        return <UserManagement />;
      case 'directory':
        return <Directory />;
      case 'documents':
        return <Documents />;
      case 'learning':
        return <Learning user={currentUser} />;
      case 'performance':
        return <Performance role={currentRole} user={currentUser} />;
      case 'approvals':
        return <Approvals />;
      case 'feedback':
        return <StudentFeedback role={currentRole} user={currentUser} />;
      case 'announcements':
        return <CreateAnnouncement />;
      case 'cohorts':
        return <Cohorts />;
      default:
        return <Dashboard role={currentRole} user={currentUser} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar - Desktop */}
      <Sidebar 
        currentRole={currentRole} 
        activeView={activeView} 
        onNavigate={(view) => {
            setActiveView(view);
            setMobileMenuOpen(false);
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="md:ml-64 transition-all duration-300">
        
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-500 hover:text-slate-800">
                <Menu size={24} />
             </button>
             <h2 className="text-xl font-semibold text-slate-800 hidden sm:block">
                {activeView === 'dashboard' ? 'Dashboard' : 
                 activeView === 'risk' ? 'Risk Analytics' :
                 activeView === 'certs' ? 'Upload Certificate' :
                 activeView === 'admin' ? 'User Management' :
                 activeView === 'announcements' ? 'Broadcast Center' :
                 activeView === 'cohorts' ? 'Cohort Management' :
                 activeView === 'feedback' ? (currentRole === Role.EMPLOYEE ? 'My Voice' : 'Student Voice Analytics') :
                 activeView.charAt(0).toUpperCase() + activeView.slice(1)}
             </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* User Profile Summary */}
             <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800 leading-none">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{currentRole}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shadow-sm border border-blue-200 overflow-hidden">
                    {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon size={20} />
                    )}
                </div>
             </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
             <div className="fixed inset-0 z-50 bg-slate-900 bg-opacity-95 text-white p-6 md:hidden flex flex-col">
                <div className="flex justify-between items-center mb-8">
                     <h2 className="text-2xl font-bold">CAPACITI</h2>
                     <button onClick={() => setMobileMenuOpen(false)} className="p-2">✕</button>
                </div>
                <div className="flex-col flex space-y-4">
                     <button onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">Dashboard</button>
                     <button onClick={() => { setActiveView('profile'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">Profile</button>
                     <button onClick={() => { setActiveView('directory'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">Directory</button>
                     <button onClick={() => { setActiveView('documents'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">Documents</button>
                     <button onClick={() => { setActiveView('feedback'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">Student Voice</button>

                     {(currentRole === Role.TECH_CHAMPION || currentRole === Role.MANAGER || currentRole === Role.ADMIN) && (
                         <>
                             <button onClick={() => { setActiveView('cohorts'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">Cohorts</button>
                             <button onClick={() => { setActiveView('announcements'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">Broadcast</button>
                         </>
                     )}

                     {(currentRole === Role.TECH_CHAMPION || currentRole === Role.MANAGER) && (
                         <>
                            <button onClick={() => { setActiveView('risk'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">Risk Analytics</button>
                            <button onClick={() => { setActiveView('performance'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">Score Cards</button>
                         </>
                     )}
                     {(currentRole === Role.MANAGER) && (
                         <button onClick={() => { setActiveView('approvals'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">Approvals</button>
                     )}
                     {(currentRole === Role.EMPLOYEE) && (
                         <>
                            <button onClick={() => { setActiveView('certs'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">Upload Certificate</button>
                            <button onClick={() => { setActiveView('learning'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">Learning</button>
                         </>
                     )}
                     {(currentRole === Role.ADMIN) && (
                         <button onClick={() => { setActiveView('admin'); setMobileMenuOpen(false); }} className="text-lg font-medium text-left">User Management</button>
                     )}
                     <button onClick={handleLogout} className="text-lg font-medium text-left text-red-400 mt-4 pt-4 border-t border-slate-700">Sign Out</button>
                </div>
             </div>
        )}

        {/* Page Content */}
        <main className="p-6 max-w-7xl mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
