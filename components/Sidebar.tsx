
import React from 'react';
import { Role } from '../types';
import { 
  LayoutDashboard, 
  FileCheck, 
  BarChart3, 
  UserCircle, 
  FileText,
  LogOut,
  ShieldCheck,
  Users,
  Library,
  GraduationCap,
  ClipboardList,
  MessageSquareQuote,
  Megaphone,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  currentRole: Role;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, activeView, onNavigate, onLogout }) => {
  
  const getMenuItems = () => {
    // Global items accessible to everyone
    const globalItems = [
      { id: 'directory', label: 'Directory', icon: Users },
      { id: 'documents', label: 'Documents', icon: Library },
      { id: 'feedback', label: currentRole === Role.EMPLOYEE ? 'My Voice' : 'Student Voice', icon: MessageSquareQuote },
    ];

    const common = [
      { id: 'profile', label: 'My Profile', icon: UserCircle },
    ];

    const broadcastItem = { id: 'announcements', label: 'Broadcast', icon: Megaphone };
    const cohortItem = { id: 'cohorts', label: 'Cohorts', icon: Briefcase };

    switch (currentRole) {
      case Role.EMPLOYEE:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          ...common,
          { id: 'learning', label: 'Learning & Badges', icon: GraduationCap },
          { id: 'performance', label: 'My Performance', icon: ClipboardList },
          { id: 'forms', label: 'Digital Forms', icon: FileText },
          { id: 'certs', label: 'Upload Certificate', icon: FileCheck },
          ...globalItems,
        ];
      case Role.TECH_CHAMPION:
        return [
          { id: 'dashboard', label: 'Talent Dashboard', icon: LayoutDashboard },
          ...common,
          { id: 'risk', label: 'Risk Analytics (AI)', icon: BarChart3 },
          { id: 'performance', label: 'Score Cards', icon: ClipboardList },
          cohortItem,
          broadcastItem,
          ...globalItems,
        ];
      case Role.MANAGER:
        return [
          { id: 'dashboard', label: 'Manager Dashboard', icon: LayoutDashboard },
          ...common,
          { id: 'approvals', label: 'Approvals', icon: ShieldCheck },
          { id: 'risk', label: 'Team Analytics (AI)', icon: BarChart3 },
          cohortItem,
          broadcastItem,
          ...globalItems,
        ];
      case Role.ADMIN:
        return [
          { id: 'dashboard', label: 'HR Dashboard', icon: LayoutDashboard },
          ...common,
          { id: 'admin', label: 'User Management', icon: UserCircle },
          { id: 'risk', label: 'Global Analytics', icon: BarChart3 },
          cohortItem,
          broadcastItem,
          ...globalItems,
        ];
      default:
        return common;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-20 hidden md:flex">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-tight text-blue-400">CAPACITI</h1>
        <p className="text-xs text-slate-400 mt-1">Intelligent Talent Hub</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={onLogout}
          className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors px-4 py-2 w-full"
        >
          <LogOut size={18} />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
