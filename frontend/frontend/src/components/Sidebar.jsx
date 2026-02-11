import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, GraduationCap, Archive, LogOut } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { path: '/admin/pendaftaran', name: 'Pendaftaran', icon: <UserPlus size={20}/> },
    { path: '/admin/peserta', name: 'Data Peserta', icon: <Users size={20}/> },
    { path: '/admin/mentors', name: 'Manajemen Mentor', icon: <GraduationCap size={20}/> },
    { path: '/admin/arsip', name: 'Arsip & Alumni', icon: <Archive size={20}/> },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col fixed left-0 top-0">
      <div className="p-8">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2 uppercase tracking-tighter">
          <GraduationCap size={28}/> Intern-Gate
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              location.pathname === item.path 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            {item.icon} {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button onClick={() => {localStorage.removeItem('token'); window.location.href='/'}} className="flex items-center gap-3 px-4 py-3 w-full text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
          <LogOut size={20}/> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;