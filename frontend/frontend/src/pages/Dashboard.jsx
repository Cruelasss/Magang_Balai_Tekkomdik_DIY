import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Users, GraduationCap, LayoutDashboard, LogOut, Search, School, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, status: [], jurusan: [] });
  const [applicants, setApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fungsi untuk mengambil semua data (Statistik + Tabel)
  const fetchAllData = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/applications')
      ]);

      setStats({
        total: statsRes.data.total,
        status: statsRes.data.data.status,
        jurusan: statsRes.data.data.jurusan
      });
      setApplicants(listRes.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fungsi Update Status (Approve/Reject)
  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Yakin mau mengubah status menjadi ${newStatus}?`)) return;
    
    try {
      await api.put(`/admin/applications/${id}/status`, { status: newStatus });
      // Setelah update berhasil, tarik data terbaru agar grafik & tabel sinkron
      fetchAllData();
    } catch (err) {
      alert("Gagal update status. Pastikan backend sudah siap!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const filteredApplicants = applicants.filter(app => 
    app.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.instansi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 p-4 md:p-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <LayoutDashboard className="text-blue-600" size={28} /> 
            Monitoring Intern-Gate
          </h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 hover:bg-red-50 hover:text-red-600 transition-all font-semibold text-sm text-gray-600"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* STATS CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center transition-transform hover:scale-105">
            <div className="bg-blue-100 p-4 rounded-xl mr-4 text-blue-600">
              <Users size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Pendaftar</p>
              <h3 className="text-3xl font-extrabold text-gray-800">{stats.total}</h3>
            </div>
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 text-gray-700">
              <GraduationCap className="text-blue-500" />
              <h2 className="text-lg font-bold">Top 5 Jurusan Terbanyak</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.jurusan}>
                  <XAxis dataKey="jurusan" hide />
                  <YAxis />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="jumlah" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6 text-gray-700">Persentase Status</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={stats.status} 
                    dataKey="jumlah" 
                    nameKey="status" 
                    cx="50%" cy="50%" 
                    outerRadius={80} 
                    paddingAngle={5}
                    innerRadius={60}
                  >
                    {stats.status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-gray-800">Daftar Pendaftar Magang</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari nama atau instansi..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-5">Nama Lengkap</th>
                  <th className="p-5">Asal Instansi</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredApplicants.length > 0 ? (
                  filteredApplicants.map((app) => (
                    <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-5 font-semibold text-gray-700">{app.nama}</td>
                      <td className="p-5 text-gray-600 flex items-center gap-2 text-xs">
                        <School size={14} className="text-gray-400" /> {app.instansi}
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          app.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                          app.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'Approved')}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-gray-400 italic">Data tidak ditemukan...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;