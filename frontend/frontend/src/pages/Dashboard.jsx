import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area
} from 'recharts';
import { 
  Users, GraduationCap, LayoutDashboard, LogOut, Search, 
  School, CheckCircle, XCircle, FileText, Download, Trash2, Eye, X, BookOpen, MapPin, ExternalLink, UserPlus, User, TrendingUp, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  // --- STATES ---
  const [stats, setStats] = useState({ total: 0, status: [], jurusan: [] });
  const [dynamicTrends, setDynamicTrends] = useState({ yearly: [], monthly: [] });
  const [applicants, setApplicants] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTrendYear, setSelectedTrendYear] = useState(new Date().getFullYear().toString());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profil'); 
  const [selectedData, setSelectedData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logRange, setLogRange] = useState('Semua');
  const [plotForm, setPlotForm] = useState({ mentor_id: '', start: '', end: '' });

  const navigate = useNavigate();

  // --- FUNGSI HITUNG TREND DARI TANGGAL ---
  const calculateTrends = (data, targetYear) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const monthlyMap = {};
    const yearlyMap = {};

    data.forEach(app => {
      if (app.tgl_mulai) {
        const date = new Date(app.tgl_mulai);
        const monthLabel = months[date.getMonth()];
        const yearLabel = date.getFullYear().toString();

        if (yearLabel === targetYear) {
          monthlyMap[monthLabel] = (monthlyMap[monthLabel] || 0) + 1;
        }
        yearlyMap[yearLabel] = (yearlyMap[yearLabel] || 0) + 1;
      }
    });

    const monthlyData = months.map(m => ({ bulan: m, jumlah: monthlyMap[m] || 0 }));
    const yearlyData = Object.keys(yearlyMap).sort().map(y => ({ tahun: y, jumlah: yearlyMap[y] }));

    setDynamicTrends({ yearly: yearlyData, monthly: monthlyData });
  };

  // --- AMBIL DATA ---
  const fetchAllData = async () => {
    try {
      const [statsRes, listRes, mentorRes] = await Promise.all([
        api.get('/admin/stats').catch(() => null),
        api.get('/admin/applications').catch(() => null),
        api.get('/admin/mentors').catch(() => null)
      ]);

      if (statsRes) setStats({ total: statsRes.data.total, status: statsRes.data.data.status, jurusan: statsRes.data.data.jurusan });
      
      if (listRes) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const processedData = listRes.data.map(app => {
          if ((app.status === 'Aktif' || app.status === 'Approved') && app.tgl_selesai) {
            const endDate = new Date(app.tgl_selesai);
            endDate.setHours(0, 0, 0, 0);
            if (today > endDate) return { ...app, status: 'Selesai' };
          }
          return app;
        });
        setApplicants(processedData);
        calculateTrends(processedData, selectedTrendYear);
      }

      if (mentorRes) setMentors(mentorRes.data);
    } catch (err) {
      console.error("Gagal sinkronisasi data:", err);
    }
  };

  useEffect(() => { fetchAllData(); }, [selectedTrendYear]);

  // --- FUNGSI MODAL & LOGBOOK ---
  const openControlCenter = async (app, tab = 'profil') => {
    setSelectedData(app);
    setActiveTab(tab);
    setIsModalOpen(true);
    setPlotForm({ 
        mentor_id: app.mentor_id || '', 
        start: app.tgl_mulai || '', 
        end: app.tgl_selesai || '' 
    });
    if (tab === 'logbook') fetchLogbook(app.user_id, 'Semua');
  };

  const fetchLogbook = async (userId, range) => {
    setLogRange(range);
    try {
      const res = await api.get(`/logbooks/participant/${userId}?range=${range.toLowerCase()}`);
      setLogs(res.data);
    } catch (err) { setLogs([]); }
  };

  const validateLog = async (id, status) => {
    try {
      await api.put(`/logbooks/validate/${id}`, { status });
      fetchLogbook(selectedData.user_id, logRange);
    } catch (err) { alert("Gagal validasi!"); }
  };

  // --- FUNGSI AKSI ---
  const handleStatusUpdate = async (id, newStatus) => {
    const dbStatus = newStatus === 'Aktif' ? 'Aktif' : newStatus;
    if (!window.confirm(`Ubah status menjadi ${newStatus}?`)) return;
    try {
      await api.put(`/admin/applications/${id}/status`, { status: dbStatus });
      fetchAllData();
      if(isModalOpen) setIsModalOpen(false);
    } catch (err) { alert("Gagal update status!"); }
  };

  const handlePlotting = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/applications/${selectedData.id}/assign-mentor`, plotForm);
      alert("Plotting & Aktivasi Berhasil!");
      setIsModalOpen(false);
      fetchAllData();
    } catch (err) { alert(err.response?.data?.message || "Gagal simpan plotting!"); }
  };

  // --- FITUR DELETE (FIXED) ---
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data pendaftar ini secara permanen?")) {
      try {
        await api.delete(`/admin/applications/${id}`);
        alert("Data berhasil dihapus!");
        fetchAllData(); // Refresh data tabel
      } catch (err) {
        alert(err.response?.data?.message || "Gagal menghapus data!");
      }
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredApplicants.map(app => ({
      "Nama": app.nama, "Instansi": app.instansi, "Mulai": app.tgl_mulai, "Selesai": app.tgl_selesai, "Status": app.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "Data_Peserta_Magang.xlsx");
  };

  // --- LOGIKA FILTER ---
  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = (app.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (app.instansi || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const dbStatus = app.status; 
    let matchesStatus = false;
    
    if (statusFilter === 'All') {
      matchesStatus = true;
    } else if (statusFilter === 'Aktif') {
      matchesStatus = (dbStatus === 'Aktif' || dbStatus === 'Approved');
    } else if (statusFilter === 'Ditolak') {
      matchesStatus = (dbStatus === 'Ditolak' || dbStatus === 'Rejected');
    } else {
      matchesStatus = dbStatus === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const s = status?.toUpperCase();
    if (s === 'AKTIF' || s === 'APPROVED') return '#10b981'; 
    if (s === 'SELESAI') return '#ef4444';  
    if (s === 'PENDING') return '#f59e0b';  
    if (s === 'DITOLAK' || s === 'REJECTED') return '#6b7280'; 
    return '#3b82f6';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <div className="flex-1 p-4 md:p-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <LayoutDashboard className="text-blue-600" size={28} /> Monitoring Intern-Gate
          </h1>
          <button onClick={() => {localStorage.removeItem('token'); navigate('/')}} className="bg-white px-4 py-2 rounded-xl border font-bold text-sm hover:text-red-600 transition-all shadow-sm">Logout</button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center transition-transform hover:scale-105">
            <div className="bg-blue-100 p-4 rounded-xl mr-4 text-blue-600"><Users size={32} /></div>
            <div><p className="text-sm text-gray-500 font-medium">Total Pendaftar</p><h3 className="text-3xl font-extrabold text-gray-800">{stats.total}</h3></div>
          </div>
        </div>

        {/* ANALISIS TREN DENGAN FILTER TAHUN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={20} />
                <h2 className="text-lg font-bold text-gray-700">Trend Mulai Magang</h2>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border">
                <Calendar size={14} className="text-gray-400 ml-2"/>
                <select 
                  className="bg-transparent text-xs font-bold outline-none pr-2 cursor-pointer"
                  value={selectedTrendYear}
                  onChange={(e) => setSelectedTrendYear(e.target.value)}
                >
                  {dynamicTrends.yearly.map(y => (
                    <option key={y.tahun} value={y.tahun}>{y.tahun}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicTrends.monthly}>
                  <defs><linearGradient id="colorM" x1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip borderStyle={{borderRadius: '10px'}} />
                  <Area type="monotone" dataKey="jumlah" stroke="#3b82f6" fillOpacity={1} fill="url(#colorM)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6"><TrendingUp className="text-green-600" size={20} /><h2 className="text-lg font-bold text-gray-700">Laporan Akumulasi Tahunan</h2></div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicTrends.yearly}><XAxis dataKey="tahun" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip cursor={{fill: '#f8fafc'}} /><Bar dataKey="jumlah" fill="#10b981" radius={[10, 10, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* GRAFIK JURUSAN & STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6 text-gray-700">Top 5 Jurusan</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.jurusan}><XAxis dataKey="jurusan" hide /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="jumlah" fill="#3b82f6" radius={[5, 5, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6 text-gray-700">Persentase Status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.status} dataKey="jumlah" nameKey="status" cx="50%" cy="50%" outerRadius={70} innerRadius={50} paddingAngle={5}>
                    {stats.status.map((entry, index) => <Cell key={index} fill={getStatusColor(entry.status)} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name === 'Approved' ? 'Aktif' : name]} />
                  <Legend verticalAlign="bottom" formatter={(value) => value === 'Approved' ? 'Aktif' : value} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TABEL UTAMA */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto">
              {['All', 'Pending', 'Aktif', 'Selesai', 'Ditolak'].map(t => (
                <button key={t} onClick={() => setStatusFilter(t)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>{t}</button>
              ))}
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={exportToExcel} className="p-2 bg-green-600 text-white rounded-xl shadow-sm hover:bg-green-700 transition-all"><Download size={18}/></button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input type="text" placeholder="Cari pendaftar..." className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b">
                <tr>
                  <th className="p-5">Peserta</th>
                  <th className="p-5">Instansi</th>
                  <th className="p-5 text-center">Mulai</th>
                  <th className="p-5 text-center">Selesai</th>
                  <th className="p-5 text-center">Status</th>
                  <th className="p-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredApplicants.map(app => (
                  <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-5 font-bold text-blue-600 cursor-pointer hover:underline" onClick={() => openControlCenter(app, 'logbook')}>{app.nama}</td>
                    <td className="p-5 text-gray-600">{app.instansi}</td>
                    
                    <td className="p-5 text-center font-medium">
                      {app.tgl_mulai ? new Date(app.tgl_mulai).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="p-5 text-center font-medium">
                      {app.tgl_selesai ? new Date(app.tgl_selesai).toLocaleDateString('id-ID') : '-'}
                    </td>

                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase`} 
                        style={{ backgroundColor: getStatusColor(app.status) + '20', color: getStatusColor(app.status) }}>
                        {app.status === 'Approved' ? 'AKTIF' : app.status === 'Rejected' ? 'DITOLAK' : app.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openControlCenter(app, 'profil')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Eye size={16}/></button>
                        {app.status?.toUpperCase() === 'PENDING' && (
                          <>
                            <button onClick={() => openControlCenter(app, 'plotting')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Aktifkan"><CheckCircle size={16}/></button>
                            <button onClick={() => handleStatusUpdate(app.id, 'Ditolak')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Tolak"><XCircle size={16}/></button>
                          </>
                        )}
                        {/* FITUR DELETE - DIPANGGIL DI SINI */}
                        <button 
                          onClick={() => handleDelete(app.id)} 
                          className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL One-Stop Control */}
        {isModalOpen && selectedData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
              <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                <div><h2 className="text-xl font-bold">{selectedData.nama}</h2><p className="text-xs opacity-80">{selectedData.instansi}</p></div>
                <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors"><X size={20}/></button>
              </div>
              <div className="flex bg-gray-50 border-b px-6 overflow-x-auto">
                {[
                  { id: 'profil', label: 'Profil & Berkas', icon: <User size={14}/> },
                  { id: 'logbook', label: 'Logbook Laporan', icon: <BookOpen size={14}/> },
                  { id: 'plotting', label: 'Kelola Mentor', icon: <UserPlus size={14}/> }
                ].map(t => (
                  <button key={t.id} onClick={() => { setActiveTab(t.id); if(t.id === 'logbook') fetchLogbook(selectedData.user_id, 'Semua'); }} className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === t.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t.icon} {t.label}</button>
                ))}
              </div>
              <div className="p-8 overflow-y-auto flex-1 bg-white">
                {activeTab === 'profil' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border"><p className="text-[10px] font-bold text-gray-400 uppercase">Email</p><p className="font-semibold">{selectedData.email}</p></div>
                      <div className="p-4 bg-gray-50 rounded-2xl border"><p className="text-[10px] font-bold text-gray-400 uppercase">Jurusan</p><p className="font-semibold">{selectedData.jurusan}</p></div>
                    </div>
                    {selectedData.berkas && <a href={`http://localhost:5000/uploads/${selectedData.berkas}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-indigo-50 text-indigo-700 p-5 rounded-3xl font-bold w-fit hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><FileText size={24}/> Buka PDF Berkas</a>}
                  </div>
                )}
                {activeTab === 'logbook' && (
                  <div className="space-y-4">
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {['Semua', 'Harian', 'Mingguan', 'Bulanan'].map(r => (
                        <button key={r} onClick={() => fetchLogbook(selectedData.user_id, r)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${logRange === r ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{r}</button>
                      ))}
                    </div>
                    {logs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {logs.map(log => (
                          <div key={log.id} className="p-5 border rounded-[24px] bg-gray-50 group hover:border-orange-300 transition-all">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">📅 {new Date(log.tanggal).toLocaleDateString('id-ID')}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${log.status_validasi === 'Valid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{log.status_validasi || 'PENDING'}</span>
                            </div>
                            <p className="text-sm text-gray-700 italic">"{log.aktivitas}"</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-center py-16 text-gray-400 italic">Belum ada aktivitas dilaporkan.</p>}
                  </div>
                )}
                {activeTab === 'plotting' && (
                  <form onSubmit={handlePlotting} className="max-w-2xl space-y-6">
                    <div className="bg-blue-50 p-6 rounded-[28px] border border-blue-100 flex items-center gap-4 mb-4"><div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><UserPlus size={24}/></div><div><p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Pengaturan Mentor & Masa Magang</p></div></div>
                    <div className="space-y-4">
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Pilih Pembimbing</label><select required value={plotForm.mentor_id} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={(e) => setPlotForm({...plotForm, mentor_id: e.target.value})}><option value="">-- Pilih Mentor Dari Daftar --</option>{mentors.map(m => (<option key={m.id} value={m.id} disabled={m.beban_kerja >= m.max_kuota}>{m.nama_pembimbing} | Divisi: {m.divisi} (Kuota: {m.beban_kerja}/{m.max_kuota})</option>))}</select></div>
                      <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Mulai</label><input type="date" required value={plotForm.start} className="w-full p-4 bg-gray-50 border rounded-[20px] text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setPlotForm({...plotForm, start: e.target.value})} /></div><div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Selesai</label><input type="date" required value={plotForm.end} className="w-full p-4 bg-gray-50 border rounded-[20px] text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setPlotForm({...plotForm, end: e.target.value})} /></div></div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-[22px] font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2"><CheckCircle size={20}/> Simpan & Aktifkan</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;