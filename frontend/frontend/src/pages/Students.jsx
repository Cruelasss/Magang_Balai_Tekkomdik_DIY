import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Webcam from "react-webcam";
import { 
  Home, User, BookOpen, LogOut, Upload, Menu, X,
  Calendar, Clock, CheckCircle, ChevronRight, MapPin, 
  Layers, Briefcase, Activity, Hourglass, Camera, RefreshCw, Navigation
} from 'lucide-react';

const Students = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [userData, setUserData] = useState({ nama: '', email: '', role: '' });
  const [internshipData, setInternshipData] = useState({ start: null, end: null, sisaHari: 0, progress: 0 });
  
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('08:00:00'); 
  const [aktivitas, setAktivitas] = useState('');
  const [uraian_kegiatan, setUraianKegiatan] = useState('');
  const [tempat, setTempat] = useState('');
  
  // State Lokasi
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [isLocating, setIsLocating] = useState(false);
  
  // State File & Camera
  const [bukti, setBukti] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myLogbooks, setMyLogbooks] = useState([]);

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
    
    fetchDashboardData();
    if (activeMenu === 'laporan_kegiatan_saya') fetchMyLogbooks();
  }, [navigate, activeMenu]);

  // --- FUNGSI LOKASI ---
  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setIsLocating(false);
        },
        (error) => {
          alert("Gagal ambil lokasi. Pastikan GPS aktif.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Browser tidak mendukung geolokasi.");
      setIsLocating(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/student/profile'); 
      const { tgl_mulai, tgl_selesai } = res.data;
      if(tgl_mulai && tgl_selesai) {
        const start = new Date(tgl_mulai);
        const end = new Date(tgl_selesai);
        const today = new Date();
        const totalDuration = end - start;
        const elapsedDuration = today - start;
        const remainingDuration = end - today;
        const sisaHari = Math.max(0, Math.ceil(remainingDuration / (1000 * 60 * 60 * 24)));
        const progress = Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 100);
        setInternshipData({ start: tgl_mulai, end: tgl_selesai, sisaHari, progress: progress.toFixed(0) });
      }
    } catch (err) { console.error("Gagal ambil data magang:", err); }
  };

  const fetchMyLogbooks = async () => {
    try {
      const res = await api.get('/student/logbook');
      setMyLogbooks(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setMyLogbooks([]); }
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreviewUrl(imageSrc);
    setShowWebcam(false);
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        setBukti(file);
      });
  }, [webcamRef]);

  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBukti(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowWebcam(false);
    }
  };

  const handleSubmitLogbook = async (e) => {
    e.preventDefault();
    if (!location.lat || !location.lng) {
      alert("Mohon ambil lokasi terkini terlebih dahulu!");
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('tanggal', tanggal);
    formData.append('jam', jam);
    formData.append('aktivitas', aktivitas);
    formData.append('uraian_kegiatan', uraian_kegiatan);
    formData.append('tempat', tempat);
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    if (bukti) formData.append('bukti', bukti);

    try {
      await api.post('/student/logbook', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Laporan Berhasil Disimpan!');
      setMessageType('success');
      setBukti(null); setPreviewUrl(null); setLocation({ lat: null, lng: null });
      setTimeout(() => { setActiveMenu('laporan_kegiatan_saya'); setMessage(''); fetchMyLogbooks(); }, 1500);
    } catch (err) {
      setMessage(`Gagal: ${err.response?.data?.message || err.message}`);
      setMessageType('error');
    } finally { setIsSubmitting(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const StatusBadge = ({ status }) => {
    const isApproved = status === 'Disetujui' || status === 'Valid';
    return (
      <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-widest flex items-center gap-1.5 w-fit ${
        isApproved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : status === 'Ditolak' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : status === 'Ditolak' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`} />
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
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 relative">
                <h2 className="text-2xl font-bold text-slate-800">Selamat Datang, <span className="text-blue-600 font-black">{userData.nama}</span></h2>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase">Mulai</p><p className="font-bold text-sm text-slate-700">{internshipData.start ? new Date(internshipData.start).toLocaleDateString() : '-'}</p></div>
                  <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase">Akhir</p><p className="font-bold text-sm text-slate-700">{internshipData.end ? new Date(internshipData.end).toLocaleDateString() : '-'}</p></div>
                </div>
                <div className="mt-6"><div className="h-3 w-full bg-slate-100 rounded-full"><div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${internshipData.progress}%` }} /></div><p className="text-[10px] font-black text-slate-400 mt-2 uppercase">{internshipData.progress}% Terselesaikan</p></div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white flex flex-col justify-center items-center shadow-xl">
                <Hourglass size={40} className="opacity-50 mb-2" />
                <h3 className="text-5xl font-black">{internshipData.sisaHari}</h3>
                <p className="font-bold text-xs uppercase tracking-[0.2em] opacity-80">Hari Tersisa</p>
              </div>
            </div>
          </div>
        );
      case 'input_kegiatan':
        return (
          <div className="p-5 md:p-10 animate-in slide-in-from-bottom-4 duration-700 text-left">
            <h1 className="text-3xl font-black text-slate-800 uppercase mb-8">Buat Laporan</h1>
            {message && <div className={`p-4 mb-6 rounded-2xl font-bold text-sm ${messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}
            <form onSubmit={handleSubmitLogbook} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="date" className="w-full border-none bg-slate-50 rounded-2xl p-5 font-bold text-sm outline-none" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
                <input type="time" step="1" className="w-full border-none bg-slate-50 rounded-2xl p-5 font-bold text-sm outline-none" value={jam} onChange={(e) => setJam(e.target.value)} required />
              </div>
              <input type="text" className="w-full border-none bg-slate-50 rounded-2xl p-5 font-bold text-sm outline-none" placeholder="Judul Aktivitas" value={aktivitas} onChange={(e) => setAktivitas(e.target.value)} required />
              <textarea className="w-full border-none bg-slate-50 rounded-2xl p-5 font-medium text-sm outline-none" placeholder="Uraian detail..." rows="4" value={uraian_kegiatan} onChange={(e) => setUraianKegiatan(e.target.value)} required />
              <input type="text" className="w-full border-none bg-slate-50 rounded-2xl p-5 font-bold text-sm outline-none" placeholder="Lokasi" value={tempat} onChange={(e) => setTempat(e.target.value)} />
              
              {/* BUTTON LOKASI */}
              <button 
                type="button" 
                onClick={handleGetLocation}
                className={`w-full p-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${location.lat ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}
              >
                <Navigation size={18} /> {isLocating ? "Mencari Lokasi..." : (location.lat ? `Lokasi Terkunci: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Ambil Lokasi Terkini")}
              </button>

              <div className="space-y-4">
                {showWebcam && (
                  <div className="relative w-full max-w-md mx-auto rounded-[2rem] overflow-hidden shadow-2xl bg-black border-4 border-blue-600">
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: cameraFacingMode }} className="w-full" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                        <button type="button" onClick={capturePhoto} className="p-4 bg-blue-600 text-white rounded-full"><Camera size={24}/></button>
                        <button type="button" onClick={() => setShowWebcam(false)} className="p-4 bg-red-600 text-white rounded-full"><X size={24}/></button>
                    </div>
                  </div>
                )}
                {previewUrl && !showWebcam && (
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-md border-2 border-blue-100">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => {setBukti(null); setPreviewUrl(null);}} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"><X size={16}/></button>
                  </div>
                )}
                {!showWebcam && (
                  <div className="grid grid-cols-2 gap-4">
                      <button type="button" onClick={() => setShowWebcam(true)} className="flex flex-col items-center gap-2 bg-blue-600 text-white p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center"><Camera size={24} /> Kamera</button>
                      <label htmlFor="upload" className="flex flex-col items-center gap-2 bg-slate-200 text-slate-700 p-5 rounded-2xl cursor-pointer font-black text-[10px] uppercase tracking-widest text-center"><Upload size={24} /> Upload<input type="file" id="upload" accept="image/*" className="hidden" onChange={handleUploadFile} /></label>
                  </div>
                )}
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase text-sm hover:bg-blue-600 transition-all">Simpan Laporan</button>
            </form>
          </div>
        );
      case 'laporan_kegiatan_saya':
        return (
          <div className="p-5 md:p-10 animate-in slide-in-from-bottom-4 duration-700 text-left">
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-8">Riwayat Logbook</h1>
            <div className="space-y-6">
              {myLogbooks.map((log) => (
                <div key={log.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 flex justify-between items-center hover:shadow-md transition-all">
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{new Date(log.tanggal).toLocaleDateString()}</p>
                    <h3 className="font-black text-sm uppercase text-gray-800">{log.aktivitas}</h3>
                  </div>
                  <StatusBadge status={log.status_validasi} />
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden fixed bottom-6 right-6 z-[60] p-5 bg-blue-600 text-white rounded-full shadow-2xl">
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`fixed inset-y-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-80 bg-[#0f172a] flex flex-col transition-transform duration-300`}>
        <div className="p-10 text-2xl font-black text-white uppercase italic tracking-tighter">Intern-Gate</div>
        <nav className="flex-1 px-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
              { id: 'input_kegiatan', label: 'Tambah Laporan', icon: <Upload size={20} /> },
              { id: 'laporan_kegiatan_saya', label: 'Riwayat Logbook', icon: <BookOpen size={20} /> }
            ].map((item) => (
              <button key={item.id} onClick={() => { setActiveMenu(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] ${activeMenu === item.id ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
                <span className="mr-4">{item.icon}</span> {item.label}
              </button>
            ))}
        </nav>
        <div className="p-8">
            <button onClick={handleLogout} className="w-full flex items-center py-4 px-6 rounded-2xl text-[10px] font-black uppercase text-rose-500 border border-rose-500/20"><LogOut size={18} className="mr-4" /> Sign Out</button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
          {renderContent()}
      </main>
    </div>
  );
};

export default Students;