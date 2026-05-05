import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  Users, TrendingUp, Calendar, GraduationCap, UserCheck, Clock,
  Award, Briefcase, Sparkles
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
  const completedCount = stats.status.find(s => s.status === 'Selesai')?.jumlah || 0;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      {/* Header dengan welcome message */}
      <div className="mb-8 relative">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard Overview
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Ringkasan Data</h1>
            <p className="text-gray-500 mt-1">Selamat datang kembali! Berikut adalah statistik program magang kamu.</p>
          </div>
          
          {/* Date badge */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* 1. STATS CARDS MODERN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Card Total */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Pendaftar</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{stats.total}</h3>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* Card Aktif */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-green-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Aktif</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Peserta Aktif</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{activeCount}</h3>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${(activeCount / stats.total) * 100 || 0}%` }}></div>
          </div>
        </div>

        {/* Card Pending */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-yellow-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Pending</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Menunggu Review</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{pendingCount}</h3>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-yellow-600 h-1.5 rounded-full" style={{ width: `${(pendingCount / stats.total) * 100 || 0}%` }}></div>
          </div>
        </div>

        {/* Card Selesai */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-red-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-red-50 to-rose-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Selesai</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Peserta Selesai</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{completedCount}</h3>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-red-600 h-1.5 rounded-full" style={{ width: `${(completedCount / stats.total) * 100 || 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* 2. CHARTS SECTION MODERN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Trend Monthly - Modern */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:border-blue-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Trend Peserta Masuk</h2>
                <p className="text-xs text-gray-500">Perbandingan bulanan</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm p-1 rounded-xl border border-gray-200">
              <Calendar size={14} className="text-gray-400 ml-2"/>
              <select 
                className="bg-transparent text-xs font-medium outline-none pr-2 cursor-pointer text-gray-600"
                value={selectedTrendYear} 
                onChange={(e) => setSelectedTrendYear(e.target.value)}
              >
                {dynamicTrends.yearly.map(y => (
                  <option key={y.tahun} value={y.tahun} className="text-gray-800">{y.tahun}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicTrends.monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="bulan" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="jumlah" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Status - Modern */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:border-blue-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
              <Briefcase className="text-purple-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Persentase Status</h2>
              <p className="text-xs text-gray-500">Distribusi peserta berdasarkan status</p>
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats.status} 
                  dataKey="jumlah" 
                  nameKey="status" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={90} 
                  innerRadius={60} 
                  paddingAngle={5}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.status.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={getStatusColor(entry.status)} 
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center" 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart Top Jurusan - Modern (Full Width) */}
        <div className="lg:col-span-2 group bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:border-blue-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
              <GraduationCap className="text-orange-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Top Asal Jurusan Peserta</h2>
              <p className="text-xs text-gray-500">Jurusan dengan pendaftar terbanyak</p>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={stats.jurusan.slice(0, 10)} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="jurusan" 
                  type="category" 
                  width={180} 
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#4b5563' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px'
                  }}
                />
                <Bar 
                  dataKey="jumlah" 
                  fill="#3b82f6" 
                  radius={[0, 10, 10, 0]} 
                  barSize={20}
                >
                  {stats.jurusan.slice(0, 10).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`rgba(59, 130, 246, ${0.9 - index * 0.05})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Style untuk animasi dan pattern */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;