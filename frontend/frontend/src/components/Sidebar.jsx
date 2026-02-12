import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
// Tambahkan BookOpen di import lucide-react
import { 
  LayoutDashboard, UserPlus, Users, GraduationCap, 
  Archive, LogOut, UserCog, BookOpen, 
  EyeClosed,
  LucideEyeClosed,
  BottleWine,
  BookHeart,
  BookmarkMinus,
  BookDashed
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  // Fungsi untuk mengambil jumlah logbook yang belum divalidasi
  const fetchPendingCount = async () => {
    try {
      const res = await api.get('/admin/logbook-count');
      setPendingCount(res.data.count);
    } catch (err) {
      console.error("Gagal mengambil notifikasi:", err);
    }
  };

  useEffect(() => {
    fetchPendingCount();
    // Cek ulang setiap 30 detik agar Admin dapat update real-time
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { path: '/admin/pendaftaran', name: 'Pendaftaran', icon: <UserPlus size={20}/> },
    { path: '/admin/peserta', name: 'Data Peserta', icon: <Users size={20}/> },
    { path: '/admin/mentors', name: 'Manajemen Mentor', icon: <GraduationCap size={20}/> },
    { 
      path: '/admin/logbook', 
      name: 'Logbook Peserta', 
      icon: <BookDashed size={20}/>,
      badge: pendingCount // Angka notifikasi
    },
    { path: '/admin/users', name: 'Manajemen User', icon: <UserCog size={20}/> }, 
    { path: '/admin/arsip', name: 'Arsip & Alumni', icon: <Archive size={20}/> },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col fixed left-0 top-0">
      <div className="p-8">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2 uppercase tracking-tighter">
          <GraduationCap size={28}/> Intern-Gate
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              location.pathname === item.path 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.name}</span>
            </div>

            {/* BADGE NOTIFIKASI */}
            {item.badge > 0 && (
              <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-black rounded-full transition-all ${
                location.pathname === item.path 
                ? 'bg-white text-blue-600' 
                : 'bg-red-500 text-white animate-pulse'
              }`}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button 
          onClick={() => {localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href='/'}} 
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={20}/> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;