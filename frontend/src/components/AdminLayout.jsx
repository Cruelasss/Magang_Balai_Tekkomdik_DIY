import React from 'react';
import Sidebar from './Sidebar'; // Pastikan file Sidebar.jsx sudah kamu buat

const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar tetap di kiri */}
      <Sidebar />
      
      {/* Konten di kanan, kasih margin-left 64 (sesuai lebar sidebar) */}
      <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;