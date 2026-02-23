import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import logo from '../assets/logo.svg'; 
import { 
  LayoutDashboard, UserPlus, Users, GraduationCap, 
  Archive, LogOut, BookDashed, 
  Calendar as CalendarIcon 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [pendingLogbook, setPendingLogbook] = useState(0);
  const [pendingApps, setPendingApps] = useState(0); // State baru untuk pendaftaran

  const fetchCounts = async () => {
    try {
      // Mengambil data logbook count dan pendaftaran sekaligus
      const [logbookRes, appsRes] = await Promise.all([
        api.get('/admin/logbook-count'),
        api.get('/admin/applications') // Mengambil semua aplikasi untuk dihitung yang Pending
      ]);
      
      setPendingLogbook(logbookRes.data.count);
      
      // Hitung manual data yang statusnya 'Pending' dari list pendaftaran
      const countPending = appsRes.data.filter(app => app.status === 'Pending').length;
      setPendingApps(countPending);
    } catch (err) {
      console.error("Gagal mengambil notifikasi:", err);
    }
  };

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // Auto refresh setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { 
      path: '/admin/pendaftaran', 
      name: 'Pendaftaran', 
      icon: <UserPlus size={20}/>,
      badge: pendingApps // Tambahkan badge di sini
    },
    { path: '/admin/peserta', name: 'Data Peserta', icon: <Users size={20}/> },
    { path: '/admin/mentors', name: 'Manajemen Mentor', icon: <GraduationCap size={20}/> },
    { 
      path: '/admin/logbook', 
      name: 'Logbook Peserta', 
      icon: <BookDashed size={20}/>,
      badge: pendingLogbook 
    },
    { path: '/admin/calendar', name: 'Kalender Magang', icon: <CalendarIcon size={20}/> },
    { path: '/admin/arsip', name: 'Arsip & Alumni', icon: <Archive size={20}/> },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50 shadow-sm text-left">
      
      {/* --- BAGIAN LOGO --- */}
      <div className="py-10 flex flex-col items-center justify-center border-b border-gray-50 bg-gradient-to-b from-blue-50/30 to-white">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-blue-100 blur-2xl rounded-full opacity-40"></div>
          <img 
            src={logo} 
            alt="Logo" 
            className="relative h-24 w-auto object-contain transition-transform hover:scale-105 duration-300" 
          />
        </div>
        
        <div className="text-center">
          <h1 className="text-lg font-black text-gray-800 uppercase tracking-tighter leading-none">
            Intern<span className="text-blue-600">-Gate</span>
          </h1>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1 text-center">
            Management System
          </p>
        </div>
      </div>
      
      {/* NAVIGASI MENU */}
      <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 ${
              location.pathname === item.path 
              ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 translate-x-1' 
              : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`${location.pathname === item.path ? 'text-white' : 'text-blue-500'}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </div>

            {item.badge > 0 && (
              <span className={`flex items-center justify-center min-w-[22px] h-5 px-1.5 text-[10px] font-black rounded-lg transition-all ${
                location.pathname === item.path 
                ? 'bg-white text-blue-600' 
                : 'bg-red-500 text-white shadow-lg shadow-red-200 animate-bounce'
              }`}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* FOOTER LOGOUT */}
      <div className="p-6 border-t border-gray-50">
        <button 
          onClick={() => {
            if(window.confirm("Keluar dari sistem?")) {
              localStorage.removeItem('token'); 
              localStorage.removeItem('user'); 
              window.location.href='/';
            }
          }} 
          className="flex items-center justify-center gap-3 px-4 py-3.5 w-full text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl border border-transparent hover:border-red-100 transition-all"
        >
          <LogOut size={18}/> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;