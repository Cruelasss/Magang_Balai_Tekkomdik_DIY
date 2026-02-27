import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Home, User, BookOpen, Key, LogOut, Upload,
  Calendar, Clock, FileText, CheckCircle, XCircle, Eye, Trash2, Download,
  Sparkles, Award, TrendingUp, ChevronRight, Zap, Shield, Target, PlusCircle
} from 'lucide-react';

const Students = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  const [userData, setUserData] = useState({ 
    nama: '', 
    email: '', 
    role: '' 
  });

  // --- State Form (Lengkap Sesuai Database) ---
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('08:00:00'); 
  const [aktivitas, setAktivitas] = useState('');
  const [uraian_kegiatan, setUraianKegiatan] = useState('');
  const [tempat, setTempat] = useState('');
  const [bukti, setBukti] = useState(null); // State untuk file
  
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
        role: storedUser.role || ""
      });

      if (storedUser.role?.toLowerCase() !== 'peserta') {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }

    if (activeMenu === 'laporan_kegiatan_saya') {
        fetchMyLogbooks();
    } else if (activeMenu === 'dashboard') {
        fetchDashboardStats();
    }
  }, [navigate, activeMenu]);

  // --- Fungsi Ambil Data Riwayat ---
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
      console.error("Gagal ambil riwayat:", err);
      setMyLogbooks([]);
    } finally {
      setIsLoadingLogbooks(false);
    }
  };

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
  const handleSubmitLogbook = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('tanggal', tanggal);
    formData.append('jam', jam);
    formData.append('aktivitas', aktivitas);
    formData.append('uraian_kegiatan', uraian_kegiatan);
    formData.append('tempat', tempat);
    
    // VALIDASI FILE: Pastikan file ada sebelum di-append
    if (bukti) {
      formData.append('bukti', bukti);
    }

    try {
      const res = await api.post('/student/logbook', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Feedback Sukses
      setMessage('Laporan Berhasil Disimpan!');
      setMessageType('success');
      
      // Reset Form Total
      setTanggal('');
      setJam('08:00:00');
      setAktivitas('');
      setUraianKegiatan('');
      setTempat('');
      setBukti(null);
      
      // Redirect & Refresh
      setTimeout(() => {
        setActiveMenu('laporan_kegiatan_saya');
        fetchMyLogbooks(); 
        setMessage('');
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setMessage(`Gagal menyimpan: ${errorMsg}`);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Format date helper
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
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
                  </div>
                </div>
              </div>

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
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
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
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
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