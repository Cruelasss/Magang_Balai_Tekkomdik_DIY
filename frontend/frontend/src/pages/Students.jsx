import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
<<<<<<< HEAD
  Home, User, BookOpen, Key, LogOut, Upload,
  Calendar, Clock, FileText, CheckCircle, XCircle, Eye, Trash2, Download,
  Sparkles, Award, TrendingUp, ChevronRight, Zap, Shield, Target, PlusCircle
=======
  Home, User, BookOpen, LogOut, Upload, Menu, X,
  Calendar, Clock, CheckCircle, XCircle, ChevronRight, MapPin, 
  Layers, Briefcase, Activity
>>>>>>> origin/mariska
} from 'lucide-react';

const Students = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [userData, setUserData] = useState({ nama: '', email: '', role: '' });
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('08:00:00'); 
  const [aktivitas, setAktivitas] = useState('');
  const [uraian_kegiatan, setUraianKegiatan] = useState('');
  const [tempat, setTempat] = useState('');
  const [bukti, setBukti] = useState(null);
  
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myLogbooks, setMyLogbooks] = useState([]);
  const [isLoadingLogbooks, setIsLoadingLogbooks] = useState(false);

  // Stats untuk dashboard
  const [stats, setStats] = useState({
    total: 0,
    disetujui: 0,
    pending: 0,
    ditolak: 0
  });

  useEffect(() => {
    const rawData = localStorage.getItem('user');
    if (rawData) {
      const storedUser = JSON.parse(rawData);
      setUserData({
        nama: storedUser.nama || storedUser.nama_lengkap || "User Mahasiswa",
        email: storedUser.email || "",
        role: storedUser.role || "Peserta"
      });
      if (storedUser.role?.toLowerCase() !== 'peserta') navigate('/login');
    } else {
      navigate('/login');
    }
<<<<<<< HEAD

    if (activeMenu === 'laporan_kegiatan_saya') {
        fetchMyLogbooks();
    } else if (activeMenu === 'dashboard') {
        fetchDashboardStats();
    }
=======
    if (activeMenu === 'laporan_kegiatan_saya') fetchMyLogbooks();
>>>>>>> origin/mariska
  }, [navigate, activeMenu]);

  const fetchMyLogbooks = async () => {
    setIsLoadingLogbooks(true);
    try {
      const res = await api.get('/student/logbook');
      setMyLogbooks(Array.isArray(res.data) ? res.data : []);
      
      // Hitung stats
      const data = Array.isArray(res.data) ? res.data : [];
      setStats({
        total: data.length,
        disetujui: data.filter(l => l.status_validasi === 'Disetujui' || l.status_validasi === 'Valid').length,
        pending: data.filter(l => !l.status_validasi || l.status_validasi === 'Pending').length,
        ditolak: data.filter(l => l.status_validasi === 'Ditolak').length
      });
    } catch (err) {
      setMyLogbooks([]);
    } finally {
      setIsLoadingLogbooks(false);
    }
  };

<<<<<<< HEAD
  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/student/logbook');
      const data = Array.isArray(res.data) ? res.data : [];
      setStats({
        total: data.length,
        disetujui: data.filter(l => l.status_validasi === 'Disetujui' || l.status_validasi === 'Valid').length,
        pending: data.filter(l => !l.status_validasi || l.status_validasi === 'Pending').length,
        ditolak: data.filter(l => l.status_validasi === 'Ditolak').length
      });
    } catch (err) {
      console.error("Gagal ambil stats:", err);
    }
  };

  // --- Fungsi Submit Logbook (Multipart Form Data) ---
=======
>>>>>>> origin/mariska
  const handleSubmitLogbook = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('tanggal', tanggal);
    formData.append('jam', jam);
    formData.append('aktivitas', aktivitas);
    formData.append('uraian_kegiatan', uraian_kegiatan);
    formData.append('tempat', tempat);
    if (bukti) formData.append('bukti', bukti);

    try {
      await api.post('/student/logbook', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Laporan Berhasil Disimpan!');
      setMessageType('success');
      setTimeout(() => { setActiveMenu('laporan_kegiatan_saya'); setMessage(''); }, 1500);
    } catch (err) {
      setMessage(`Gagal: ${err.response?.data?.message || err.message}`);
      setMessageType('error');
    } finally { setIsSubmitting(false); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

<<<<<<< HEAD
  // Format date helper
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
=======
  const StatusBadge = ({ status }) => {
    const isApproved = status === 'Disetujui' || status === 'Valid';
    const isRejected = status === 'Ditolak';
    
    return (
      <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-widest flex items-center gap-1.5 w-fit ${
        isApproved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
        isRejected ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
        'bg-amber-50 text-amber-600 border border-amber-100'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : isRejected ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`} />
        {status || 'PENDING'}
      </span>
    );
>>>>>>> origin/mariska
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
<<<<<<< HEAD
          <div className="p-8 space-y-8">
            {/* Header dengan welcome message */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Dashboard Mahasiswa
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Selamat Datang, {userData.nama}!</h1>
              <p className="text-gray-500 mt-1">Pantau progres logbook dan aktivitas magang Anda di sini.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Card Total */}
              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">Total Logbook</p>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{stats.total}</h3>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Card Disetujui */}
              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-green-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Disetujui</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">Logbook Valid</p>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{stats.disetujui}</h3>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${(stats.disetujui / stats.total) * 100 || 0}%` }}></div>
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
                <p className="text-sm text-gray-500 mb-1">Menunggu Validasi</p>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{stats.pending}</h3>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-yellow-600 h-1.5 rounded-full" style={{ width: `${(stats.pending / stats.total) * 100 || 0}%` }}></div>
                </div>
              </div>

              {/* Card Ditolak */}
              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-red-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Ditolak</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">Perlu Revisi</p>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{stats.ditolak}</h3>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-red-600 h-1.5 rounded-full" style={{ width: `${(stats.ditolak / stats.total) * 100 || 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Info Session */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-6 h-6" />
                    <h3 className="font-bold text-lg">Informasi Magang</h3>
                  </div>
                  <p className="text-blue-100 text-sm mb-4">
                    Anda terdaftar sebagai peserta magang aktif. Pastikan untuk mengisi logbook setiap hari.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Mulai: 01 Feb 2026</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Sisa: 90 hari</span>
                    </div>
=======
          <div className="p-5 md:p-10 animate-in slide-in-from-bottom-4 duration-700">
            <header className="mb-8 text-left">
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Beranda</h1>
              <p className="text-slate-400 font-medium mt-2">Pantau perkembangan magang Anda secara real-time.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-500">
                  <Activity size={120} />
                </div>
                <div className="relative z-10 text-left">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                      <Briefcase size={20} />
                    </div>
                    <span className="font-black text-blue-600 uppercase text-xs tracking-widest">Active Session</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Selamat Datang, <br/><span className="text-blue-600 text-4xl font-black tracking-tight">{userData.nama}</span></h2>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <button onClick={() => setActiveMenu('input_kegiatan')} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
                      <Upload size={14} /> Tambah Logbook
                    </button>
                    <button onClick={() => setActiveMenu('laporan_kegiatan_saya')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                      Lihat Riwayat
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 text-left flex flex-col justify-between">
                <Layers className="opacity-40" size={40} />
                <div>
                  <h3 className="text-4xl font-black tracking-tighter">{myLogbooks.length}</h3>
                  <p className="font-bold text-xs uppercase tracking-[0.2em] opacity-80">Total Laporan</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'input_kegiatan':
        return (
          <div className="p-5 md:p-10 animate-in slide-in-from-bottom-4 duration-700 text-left">
             <header className="mb-8">
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Buat Laporan</h1>
              <p className="text-slate-400 font-medium mt-2">Dokumentasikan kegiatan harian Anda di sini.</p>
            </header>

            <form onSubmit={handleSubmitLogbook} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-50 space-y-8 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Tanggal</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                    <input type="date" className="w-full border-none bg-slate-50 rounded-2xl p-5 pl-12 focus:ring-4 focus:ring-blue-100 font-bold text-slate-700 transition-all outline-none" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jam Kegiatan</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                    <input type="time" step="1" className="w-full border-none bg-slate-50 rounded-2xl p-5 pl-12 focus:ring-4 focus:ring-blue-100 font-bold text-slate-700 outline-none transition-all" value={jam} onChange={(e) => setJam(e.target.value)} required />
>>>>>>> origin/mariska
                  </div>
                </div>
              </div>

<<<<<<< HEAD
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:shadow-xl transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-800">Target Mingguan</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress Logbook</span>
                      <span className="font-bold text-blue-600">{stats.total}/20</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(stats.total / 20) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Validasi</span>
                      <span className="font-bold text-green-600">{stats.disetujui}/{stats.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(stats.disetujui / stats.total) * 100 || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setActiveMenu('input_kegiatan')}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:border-blue-200 transition-all hover:shadow-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800">Tambah Logbook Baru</h3>
                    <p className="text-xs text-gray-500">Isi laporan kegiatan hari ini</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => setActiveMenu('laporan_kegiatan_saya')}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:border-blue-200 transition-all hover:shadow-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800">Lihat Riwayat</h3>
                    <p className="text-xs text-gray-500">Cek status validasi logbook</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
=======
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Aktivitas</label>
                <input type="text" className="w-full border-none bg-slate-50 rounded-2xl p-5 focus:ring-4 focus:ring-blue-100 font-bold text-slate-700 outline-none transition-all" placeholder="Contoh: Maintenance Server LPSE" value={aktivitas} onChange={(e) => setAktivitas(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Uraian Detail</label>
                <textarea rows="4" className="w-full border-none bg-slate-50 rounded-2xl p-5 focus:ring-4 focus:ring-blue-100 font-medium text-slate-600 outline-none transition-all resize-none" placeholder="Jelaskan apa yang Anda kerjakan hari ini..." value={uraian_kegiatan} onChange={(e) => setUraianKegiatan(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi Pengerjaan</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
                    <input type="text" className="w-full border-none bg-slate-50 rounded-2xl p-5 pl-12 focus:ring-4 focus:ring-blue-100 font-bold text-slate-700 outline-none transition-all" placeholder="Contoh: Balai Tekkomdik" value={tempat} onChange={(e) => setTempat(e.target.value)} />
                  </div>
                </div>
                
                <div className="pt-6">
                  <input type="file" id="bukti" className="hidden" onChange={(e) => setBukti(e.target.files[0])} />
                  <label htmlFor="bukti" className="flex items-center gap-4 bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all active:scale-95">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-slate-400">
                      <Upload size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate">{bukti ? bukti.name : "Lampirkan Bukti"}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">PNG, JPG, PDF (MAX 2MB)</p>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.3em] hover:bg-blue-600 shadow-2xl shadow-slate-300 hover:shadow-blue-300 active:scale-95 transition-all flex items-center justify-center gap-3">
                {isSubmitting ? 'Syncing...' : 'Simpan Laporan Sekarang'}
              </button>
            </form>
>>>>>>> origin/mariska
          </div>
        );

      case 'input_kegiatan':
        return (
          <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Tambah Laporan
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Input Logbook Harian</h1>
              <p className="text-gray-500 mt-1">Isi form di bawah dengan detail kegiatan magang Anda hari ini.</p>
            </div>
            
            {/* Alert Message */}
            {message && (
              <div className={`p-4 mb-6 rounded-2xl font-medium text-sm flex items-center gap-3 ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {messageType === 'success' ? <CheckCircle size={20} className="flex-shrink-0" /> : <XCircle size={20} className="flex-shrink-0" />}
                <span>{message}</span>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all">
              <form onSubmit={handleSubmitLogbook} className="space-y-6">
                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Tanggal Kegiatan
                    </label>
                    <input 
                      type="date" 
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/70"
                      value={tanggal} 
                      onChange={(e) => setTanggal(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Jam Kegiatan
                    </label>
                    <input 
                      type="time" 
                      step="1" 
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/70"
                      value={jam} 
                      onChange={(e) => setJam(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                {/* Aktivitas */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Judul Aktivitas
                  </label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/70" 
                    placeholder="Contoh: Meeting dengan tim pengembang" 
                    value={aktivitas} 
                    onChange={(e) => setAktivitas(e.target.value)} 
                    required 
                  />
                </div>

                {/* Uraian */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Uraian Kegiatan
                  </label>
                  <textarea 
                    rows="4" 
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/70" 
                    placeholder="Jelaskan detail kegiatan yang dilakukan..." 
                    value={uraian_kegiatan} 
                    onChange={(e) => setUraianKegiatan(e.target.value)} 
                    required
                  ></textarea>
                </div>

                {/* Lokasi */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Lokasi Kegiatan
                  </label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/70" 
                    placeholder="Contoh: Kantor / WFO / WFH" 
                    value={tempat} 
                    onChange={(e) => setTempat(e.target.value)} 
                  />
                </div>

                {/* Upload Bukti */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Lampiran Bukti (Opsional)
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-blue-400 transition-colors bg-white/50">
                    <div className="text-center">
                      <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="bukti" className="relative cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                          <span>Pilih file</span>
                          <input id="bukti" type="file" className="sr-only" onChange={(e) => setBukti(e.target.files[0])} />
                        </label>
                        <p className="pl-1">atau seret dan lepas</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, PDF (maks. 2MB)</p>
                      {bukti && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">{bukti.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>Menyimpan...</>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Simpan Laporan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'laporan_kegiatan_saya':
        return (
<<<<<<< HEAD
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Riwayat Logbook
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Daftar Logbook Saya</h1>
              <p className="text-gray-500 mt-1">Semua laporan kegiatan yang telah Anda submit.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-xs text-gray-500 mb-1">Disetujui</p>
                <p className="text-2xl font-bold text-green-600">{stats.disetujui}</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-xs text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal & Waktu</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lampiran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoadingLogbooks ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex justify-center items-center gap-2">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Memuat data...
                          </div>
                        </td>
                      </tr>
                    ) : myLogbooks.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                          <p>Belum ada logbook yang diisi.</p>
                          <button 
                            onClick={() => setActiveMenu('input_kegiatan')}
                            className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            + Buat logbook pertama
                          </button>
                        </td>
                      </tr>
                    ) : (
                      myLogbooks.map((log) => (
                        <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{formatDate(log.tanggal)}</div>
                            <div className="text-sm text-gray-500">{log.jam}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{log.aktivitas}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{log.uraian_kegiatan}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{log.tempat || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              log.status_validasi === 'Disetujui' || log.status_validasi === 'Valid'
                                ? 'bg-green-100 text-green-800'
                                : log.status_validasi === 'Ditolak'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {log.status_validasi || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {log.bukti ? (
                              <a 
                                href={api.defaults.baseURL + log.bukti} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
=======
          <div className="p-5 md:p-10 animate-in slide-in-from-bottom-4 duration-700 text-left">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Riwayat Logbook</h1>
              <p className="text-slate-400 font-medium mt-2">Daftar seluruh aktivitas yang telah Anda laporkan.</p>
            </header>

            <div className="space-y-6">
              {myLogbooks.length === 0 ? (
                <div className="bg-white p-20 rounded-[2.5rem] text-center border-2 border-dashed border-slate-100">
                  <Layers className="mx-auto text-slate-100 mb-4" size={60} />
                  <p className="text-slate-300 font-black uppercase tracking-[0.2em]">Belum ada aktivitas</p>
                </div>
              ) : (
                myLogbooks.map((log) => (
                  <div key={log.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all border border-slate-50 group flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-6 flex-1">
                      <div className="hidden md:flex flex-col items-center justify-center p-4 bg-slate-50 rounded-3xl min-w-[100px] group-hover:bg-blue-50 transition-colors">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.tanggal).toLocaleDateString('id-ID', { month: 'short' })}</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tighter">{new Date(log.tanggal).getDate()}</p>
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter mt-1">{log.jam}</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusBadge status={log.status_validasi} />
                          <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.tanggal).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{log.aktivitas}</h3>
                        <p className="text-slate-500 font-medium text-sm italic">"{log.uraian_kegiatan}"</p>
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <MapPin size={12} className="text-rose-500" /> {log.tempat || 'Remote'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="hidden md:block text-slate-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" size={30} />
                  </div>
                ))
              )}
>>>>>>> origin/mariska
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
<<<<<<< HEAD
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Sidebar Modern */}
      <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-white/20 flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-50"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                IG
              </div>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Intern-Gate
            </span>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="px-8 pb-6 border-b border-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <User size={28} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{userData.nama}</h3>
              <p className="text-xs text-gray-500 mt-1">{userData.email}</p>
              <span className="inline-block mt-2 text-[10px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {userData.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home, desc: 'Ringkasan aktivitas' },
            { id: 'input_kegiatan', label: 'Tambah Laporan', icon: Upload, desc: 'Isi logbook harian' },
            { id: 'laporan_kegiatan_saya', label: 'Riwayat Logbook', icon: BookOpen, desc: 'Lihat semua laporan' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveMenu(item.id)} 
                className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  activeMenu === item.id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25' 
                    : 'hover:bg-white/60 text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="relative z-10 flex items-center gap-4 px-4 py-3">
                  <div className={`p-2 rounded-xl ${
                    activeMenu === item.id 
                      ? 'bg-white/20' 
                      : 'bg-white/60 group-hover:bg-white'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className={`text-[10px] ${
                      activeMenu === item.id ? 'text-blue-100' : 'text-gray-400'
                    }`}>{item.desc}</div>
                  </div>
                </div>
                {activeMenu === item.id && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-gray-200/50">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all duration-300 group"
          >
            <div className="p-2 bg-white/60 rounded-xl group-hover:bg-red-100 transition-colors">
              <LogOut size={18} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Keluar</div>
              <div className="text-[10px] text-gray-400">Akhiri sesi</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/50 backdrop-blur-sm border-b border-white/20 px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-500">Sistem Monitoring Magang v2.0</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                {userData.nama?.charAt(0) || 'U'}
              </div>
=======
    <div className="flex flex-col md:flex-row h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* Sidebar Mobile Toggle Button (Floating) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 z-[60] p-5 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-400 active:scale-90 transition-all"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Modern Sidebar */}
      <div className={`
        fixed inset-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition-all duration-500 ease-in-out
        w-full md:w-80 bg-[#0f172a] flex flex-col
      `}>
        <div className="p-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-12">
            <span className="font-black text-white text-2xl tracking-tighter uppercase italic">
              Intern<span className="text-blue-500">-Gate</span>
            </span>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-slate-800/50 mb-10 text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                <User size={24} />
              </div>
              <div className="overflow-hidden">
                <p className="text-white font-black text-sm uppercase tracking-tight truncate">{userData.nama}</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">{userData.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-3">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
              { id: 'input_kegiatan', label: 'Tambah Laporan', icon: <Upload size={20} /> },
              { id: 'laporan_kegiatan_saya', label: 'Riwayat Logbook', icon: <BookOpen size={20} /> }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => { setActiveMenu(item.id); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 group ${
                  activeMenu === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/50' 
                    : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
                }`}
              >
                <span className={`mr-4 transition-transform duration-300 ${activeMenu === item.id ? 'scale-110' : 'group-hover:translate-x-1'}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-10">
            <button onClick={handleLogout} className="w-full flex items-center py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all border border-rose-500/20 active:scale-95">
              <LogOut size={18} className="mr-4" /> Sign Out System
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Custom Header */}
        <header className="hidden md:flex items-center justify-between px-10 py-6 bg-white border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Network Monitoring</span>
          </div>
          <div className="bg-slate-50 px-5 py-2 rounded-full border border-slate-100 flex items-center gap-3">
             <div className="text-right">
              <p className="text-[10px] font-black text-slate-800 leading-none lowercase tracking-tighter">{userData.email}</p>
            </div>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-black text-xs border border-slate-200">
              {userData.nama.charAt(0)}
>>>>>>> origin/mariska
            </div>
          </div>
        </header>

<<<<<<< HEAD
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
=======
        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
          <div className="max-w-[1400px] mx-auto">
            {renderContent()}
          </div>
>>>>>>> origin/mariska
        </main>
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
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Students;