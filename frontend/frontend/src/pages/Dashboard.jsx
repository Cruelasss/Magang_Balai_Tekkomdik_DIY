import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  Users, TrendingUp, Calendar, GraduationCap, UserCheck, Clock
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, status: [], jurusan: [] });
  const [dynamicTrends, setDynamicTrends] = useState({ yearly: [], monthly: [] });
  const [selectedTrendYear, setSelectedTrendYear] = useState(new Date().getFullYear().toString());

  const calculateTrends = (data, targetYear) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const monthlyMap = {};
    const yearlyMap = {};

    data.forEach(app => {
      if (app.tgl_mulai) {
        const date = new Date(app.tgl_mulai);
        const monthLabel = months[date.getMonth()];
        const yearLabel = date.getFullYear().toString();
        if (yearLabel === targetYear) monthlyMap[monthLabel] = (monthlyMap[monthLabel] || 0) + 1;
        yearlyMap[yearLabel] = (yearlyMap[yearLabel] || 0) + 1;
      }
    });

    const monthlyData = months.map(m => ({ bulan: m, jumlah: monthlyMap[m] || 0 }));
    const yearlyData = Object.keys(yearlyMap).sort().map(y => ({ tahun: y, jumlah: yearlyMap[y] }));
    setDynamicTrends({ yearly: yearlyData, monthly: monthlyData });
  };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        api.get('/admin/stats').catch(() => null),
        api.get('/admin/applications').catch(() => null)
      ]);

      if (statsRes) setStats({ 
        total: statsRes.data.total, 
        status: statsRes.data.data.status, 
        jurusan: statsRes.data.data.jurusan 
      });
      
      if (listRes) calculateTrends(listRes.data, selectedTrendYear);
    } catch (err) {
      console.error("Gagal sinkronisasi dashboard:", err);
    }
  };

  useEffect(() => { fetchDashboardData(); }, [selectedTrendYear]);

  const getStatusColor = (status) => {
    const s = status?.toUpperCase();
    if (s === 'AKTIF' || s === 'APPROVED') return '#10b981'; 
    if (s === 'SELESAI') return '#ef4444';  
    if (s === 'PENDING') return '#f59e0b';  
    if (s === 'DITOLAK' || s === 'REJECTED') return '#6b7280'; 
    return '#3b82f6';
  };

  // Hitung jumlah peserta aktif secara manual dari stats.status jika ada
  const activeCount = stats.status.find(s => s.status === 'Aktif' || s.status === 'Approved')?.jumlah || 0;
  const pendingCount = stats.status.find(s => s.status === 'Pending')?.jumlah || 0;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Ringkasan Data</h1>
        <p className="text-sm text-gray-500">Selamat datang kembali! Berikut adalah statistik program magang kamu.</p>
      </div>

      {/* 1. STATS CARDS (SUMMARY) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users size={30} /></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase">Total Pendaftar</p><h3 className="text-2xl font-black text-gray-800">{stats.total}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><UserCheck size={30} /></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase">Peserta Aktif</p><h3 className="text-2xl font-black text-gray-800">{activeCount}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-2xl"><Clock size={30} /></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase">Menunggu Review</p><h3 className="text-2xl font-black text-gray-800">{pendingCount}</h3></div>
        </div>
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Trend Monthly */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2"><TrendingUp className="text-blue-600" size={20} /><h2 className="text-lg font-bold text-gray-700">Trend Peserta Masuk</h2></div>
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border">
              <Calendar size={14} className="text-gray-400 ml-2"/>
              <select className="bg-transparent text-xs font-bold outline-none pr-2 cursor-pointer" value={selectedTrendYear} onChange={(e) => setSelectedTrendYear(e.target.value)}>
                {dynamicTrends.yearly.map(y => <option key={y.tahun} value={y.tahun}>{y.tahun}</option>)}
              </select>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicTrends.monthly}>
                <defs><linearGradient id="colorM" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip borderStyle={{borderRadius: '10px'}} />
                <Area type="monotone" dataKey="jumlah" stroke="#3b82f6" fillOpacity={1} fill="url(#colorM)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Status */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6 text-gray-700">Persentase Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.status} dataKey="jumlah" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={60} paddingAngle={5}>
                  {stats.status.map((entry, index) => <Cell key={index} fill={getStatusColor(entry.status)} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart Top Jurusan */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-bold mb-6 text-gray-800">Top Asal Jurusan Peserta</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.jurusan} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="jurusan" type="category" width={150} tick={{fontSize: 11, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="jumlah" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;