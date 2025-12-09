import React from 'react';
import { Role } from '../types';

interface RoleSwitcherProps {
  currentRole: Role;
  onChange: (role: Role) => void;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
      {Object.values(Role).map((role) => (
        <button
          key={role}
          onClick={() => onChange(role)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            currentRole === role
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );
};

export default RoleSwitcher;