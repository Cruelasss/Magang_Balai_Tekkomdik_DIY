import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Home, User, BookOpen, LogOut, Upload, Menu, X,
  Calendar, Clock, CheckCircle, XCircle, ChevronRight, MapPin, 
  Layers, Briefcase, Activity
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
    if (activeMenu === 'laporan_kegiatan_saya') fetchMyLogbooks();
  }, [navigate, activeMenu]);

  const fetchMyLogbooks = async () => {
    setIsLoadingLogbooks(true);
    try {
      const res = await api.get('/student/logbook');
      setMyLogbooks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setMyLogbooks([]);
    } finally {
      setIsLoadingLogbooks(false);
    }
  };

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
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
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
                  </div>
                </div>
              </div>

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
          </div>
        );
      case 'laporan_kegiatan_saya':
        return (
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
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
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
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
          <div className="max-w-[1400px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Students;