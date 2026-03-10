import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Webcam from "react-webcam";
import { 
  Home, User, BookOpen, LogOut, Upload, Menu, X,
  Calendar, Clock, CheckCircle, ChevronRight, MapPin, 
  Layers, Briefcase, Activity, Hourglass, Camera, RefreshCw, Navigation,
  AlertCircle, Download, Eye, Star, Award, TrendingUp, CalendarDays,
  ChevronDown, Info, FileText, Image, Mic, Video, Wifi, Battery,
  Mail, XCircle // Tambahkan Mail dan XCircle di sini
} from 'lucide-react';

const Students = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [userData, setUserData] = useState({ nama: '', email: '', role: '' });
  const [internshipData, setInternshipData] = useState({ 
    start: null, 
    end: null, 
    sisaHari: 0, 
    progress: 0,
    totalHari: 0,
    hariTerlaksana: 0
  });
  
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('');
  const [aktivitas, setAktivitas] = useState('');
  const [uraian_kegiatan, setUraianKegiatan] = useState('');
  const [tempat, setTempat] = useState('');
  
  // State Lokasi
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [isLocating, setIsLocating] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  
  // State File & Camera
  const [bukti, setBukti] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [fileName, setFileName] = useState('');

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myLogbooks, setMyLogbooks] = useState([]);
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
        nama: storedUser.nama || storedUser.nama_lengkap || "User",
        email: storedUser.email || "",
        role: storedUser.role || "Peserta"
      });
      if (storedUser.role?.toLowerCase() !== 'peserta') navigate('/login');
    } else {
      navigate('/login');
    }
    
    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (activeMenu === 'laporan_kegiatan_saya') {
      fetchMyLogbooks();
    }
  }, [activeMenu]);

  // Set default date and time
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setTanggal(`${yyyy}-${mm}-${dd}`);
    
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    setJam(`${hours}:${minutes}:${seconds}`);
  }, []);

  // --- FUNGSI LOKASI ---
  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
          
          // Reverse geocoding untuk mendapatkan alamat
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            setLocationAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          } catch (error) {
            setLocationAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
          
          setIsLocating(false);
        },
        (error) => {
          alert("Gagal ambil lokasi. Pastikan GPS aktif dan izin lokasi diberikan.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
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
        
        // Hitung total hari magang
        const totalDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        // Hitung hari yang sudah terlaksana
        const elapsedDuration = Math.max(0, Math.ceil((today - start) / (1000 * 60 * 60 * 24)));
        const hariTerlaksana = Math.min(elapsedDuration, totalDuration);
        
        // Hitung sisa hari
        const remainingDuration = Math.max(0, Math.ceil((end - today) / (1000 * 60 * 60 * 24)));
        
        // Hitung progress
        const progress = Math.min(Math.max((hariTerlaksana / totalDuration) * 100, 0), 100);
        
        setInternshipData({ 
          start: tgl_mulai, 
          end: tgl_selesai, 
          sisaHari: remainingDuration,
          totalHari: totalDuration,
          hariTerlaksana,
          progress: progress.toFixed(0)
        });
      }
      
      // Ambil statistik logbook
      fetchMyLogbooks();
      
    } catch (err) { 
      console.error("Gagal ambil data magang:", err); 
    }
  };

  const fetchMyLogbooks = async () => {
    try {
      const res = await api.get('/student/logbook');
      const data = Array.isArray(res.data) ? res.data : [];
      setMyLogbooks(data);
      
      // Hitung statistik
      const disetujui = data.filter(l => l.status_validasi === 'Disetujui').length;
      const pending = data.filter(l => !l.status_validasi || l.status_validasi === 'Menunggu verifikasi').length;
      const ditolak = data.filter(l => l.status_validasi === 'Ditolak').length;
      
      setStats({
        total: data.length,
        disetujui,
        pending,
        ditolak
      });
    } catch (err) { 
      console.error("Gagal ambil logbook:", err);
      setMyLogbooks([]); 
    }
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
        setFileName(`capture_${Date.now()}.jpg`);
      });
  }, [webcamRef]);

  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBukti(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFileName(file.name);
      setShowWebcam(false);
    }
  };

  const handleSubmitLogbook = async (e) => {
    e.preventDefault();
    
    if (!tanggal || !jam || !aktivitas || !uraian_kegiatan) {
      alert("Mohon lengkapi semua field yang wajib diisi!");
      return;
    }
    
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
    formData.append('tempat', tempat || locationAddress || 'Lokasi tidak tersedia');
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    if (bukti) formData.append('bukti', bukti);

    try {
      await api.post('/student/logbook', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setMessage('Laporan Berhasil Disimpan!');
      setMessageType('success');
      
      // Reset form
      setAktivitas('');
      setUraianKegiatan('');
      setTempat('');
      setBukti(null); 
      setPreviewUrl(null); 
      setFileName('');
      setLocation({ lat: null, lng: null });
      setLocationAddress('');
      
      setTimeout(() => { 
        setActiveMenu('laporan_kegiatan_saya'); 
        setMessage(''); 
        fetchMyLogbooks(); 
      }, 2000);
      
    } catch (err) {
      setMessage(`Gagal: ${err.response?.data?.message || err.message}`);
      setMessageType('error');
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleLogout = () => { 
    localStorage.clear(); 
    navigate('/login'); 
  };

  // Format tanggal Indonesia
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  const StatusBadge = ({ status }) => {
    if (status === 'Disetujui') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-[9px] font-black uppercase">
          <CheckCircle size={12} />
          DITERIMA
        </span>
      );
    } else if (status === 'Ditolak') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-[9px] font-black uppercase">
          <XCircle size={12} />
          DITOLAK
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-[9px] font-black uppercase">
          <Clock size={12} />
          PENDING
        </span>
      );
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor, trend }) => (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {trend && <p className="text-[10px] text-green-600 mt-1">↑ {trend} dari minggu lalu</p>}
        </div>
        <div className={`${bgColor} p-3 rounded-xl`}>
          <Icon className={`${color}`} size={24} />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="p-5 md:p-10 animate-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
                  <Home className="text-blue-600" size={28} />
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Selamat datang di sistem monitoring magang
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500">{formatDate(new Date())}</p>
                </div>
                <button 
                  onClick={fetchDashboardData} 
                  className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 text-blue-600 transition-all"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white mb-8 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={20} className="text-yellow-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Peserta Magang</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Halo, {userData.nama}!</h2>
                  <p className="text-blue-100 max-w-lg">
                    Pantau perkembangan magang Anda dan pastikan selalu mengisi logbook setiap hari.
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-blue-200" />
                      <span className="text-sm text-blue-100">{userData.email}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <TrendingUp size={32} className="text-white" />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard 
                icon={CalendarDays} 
                label="Total Hari" 
                value={internshipData.totalHari || 0} 
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard 
                icon={CheckCircle} 
                label="Hari Terlaksana" 
                value={internshipData.hariTerlaksana || 0} 
                color="text-green-600"
                bgColor="bg-green-50"
              />
              <StatCard 
                icon={Hourglass} 
                label="Sisa Hari" 
                value={internshipData.sisaHari || 0} 
                color="text-purple-600"
                bgColor="bg-purple-50"
              />
              <StatCard 
                icon={Activity} 
                label="Total Logbook" 
                value={stats.total || 0} 
                color="text-yellow-600"
                bgColor="bg-yellow-50"
              />
            </div>

            {/* Progress Card */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                Progress Magang
              </h3>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-gray-500">Periode Magang</span>
                <span className="text-xs font-bold text-gray-700">
                  {formatDate(internshipData.start)} - {formatDate(internshipData.end)}
                </span>
              </div>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      Progress {internshipData.progress}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-gray-600">
                      {internshipData.hariTerlaksana}/{internshipData.totalHari} hari
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-100">
                  <div 
                    style={{ width: `${internshipData.progress}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Logbook Disetujui</p>
                  <p className="text-xl font-bold text-green-600">{stats.disetujui}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Ditolak</p>
                  <p className="text-xl font-bold text-red-600">{stats.ditolak}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'input_kegiatan':
        return (
          <div className="p-5 md:p-10 animate-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
                  <Upload className="text-blue-600" size={28} />
                  Buat Laporan
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Isi laporan kegiatan harian Anda dengan lengkap dan jujur
                </p>
              </div>
            </div>

            {/* Alert Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {messageType === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-medium">{message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitLogbook} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Tanggal */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                    <Calendar size={16} className="text-blue-500" />
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                    value={tanggal} 
                    onChange={(e) => setTanggal(e.target.value)} 
                    required 
                  />
                </div>

                {/* Jam */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                    <Clock size={16} className="text-blue-500" />
                    Jam <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="time" 
                    step="1" 
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                    value={jam} 
                    onChange={(e) => setJam(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {/* Aktivitas */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                  <Activity size={16} className="text-blue-500" />
                  Judul Aktivitas <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                  placeholder="Contoh: Membuat halaman login, Meeting dengan tim, dll" 
                  value={aktivitas} 
                  onChange={(e) => setAktivitas(e.target.value)} 
                  required 
                />
              </div>

              {/* Uraian */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                  <FileText size={16} className="text-blue-500" />
                  Uraian Kegiatan <span className="text-red-500">*</span>
                </label>
                <textarea 
                  className="w-full border border-gray-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all min-h-[120px]" 
                  placeholder="Jelaskan secara detail kegiatan yang Anda lakukan hari ini..." 
                  value={uraian_kegiatan} 
                  onChange={(e) => setUraianKegiatan(e.target.value)} 
                  required 
                />
              </div>

              {/* Tempat */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                  <MapPin size={16} className="text-blue-500" />
                  Lokasi (Opsional)
                </label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                  placeholder="Nama tempat atau lokasi kegiatan" 
                  value={tempat} 
                  onChange={(e) => setTempat(e.target.value)} 
                />
              </div>

              {/* Lokasi GPS */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                  <Navigation size={16} className="text-blue-500" />
                  Lokasi GPS <span className="text-red-500">*</span>
                </label>
                <button 
                  type="button" 
                  onClick={handleGetLocation}
                  className={`w-full p-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    location.lat 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <Navigation size={18} /> 
                  {isLocating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Mencari Lokasi...
                    </>
                  ) : location.lat ? (
                    `📍 ${locationAddress || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}`
                  ) : (
                    "Ambil Lokasi Terkini"
                  )}
                </button>
              </div>

              {/* Upload Bukti */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                  <Camera size={16} className="text-blue-500" />
                  Bukti Kegiatan
                </label>

                {showWebcam && (
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border-2 border-blue-200 mb-4">
                    <Webcam 
                      audio={false} 
                      ref={webcamRef} 
                      screenshotFormat="image/jpeg" 
                      videoConstraints={{ facingMode: cameraFacingMode }} 
                      className="w-full"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                      <button 
                        type="button" 
                        onClick={capturePhoto} 
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                      >
                        <Camera size={18} />
                        Ambil Foto
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowWebcam(false)} 
                        className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center gap-2"
                      >
                        <X size={18} />
                        Batal
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCameraFacingMode(prev => prev === "environment" ? "user" : "environment")}
                      className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-xl text-gray-700 hover:bg-white"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                )}

                {previewUrl && !showWebcam && (
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border-2 border-green-200 mb-4">
                    <img src={previewUrl} alt="Preview" className="w-full object-cover max-h-[300px]" />
                    <button 
                      type="button" 
                      onClick={() => {setBukti(null); setPreviewUrl(null); setFileName('');}} 
                      className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                    >
                      <X size={16} />
                    </button>
                    {fileName && (
                      <div className="absolute bottom-4 left-4 p-2 bg-black/60 backdrop-blur-sm text-white text-xs rounded-xl">
                        {fileName}
                      </div>
                    )}
                  </div>
                )}

                {!showWebcam && !previewUrl && (
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button" 
                      onClick={() => setShowWebcam(true)} 
                      className="flex flex-col items-center gap-3 bg-blue-50 text-blue-700 p-6 rounded-2xl border border-blue-200 hover:bg-blue-100 transition-all"
                    >
                      <Camera size={32} />
                      <span className="text-xs font-bold uppercase">Ambil Foto</span>
                    </button>
                    
                    <label className="flex flex-col items-center gap-3 bg-gray-50 text-gray-700 p-6 rounded-2xl border border-gray-200 hover:bg-gray-100 cursor-pointer transition-all">
                      <Upload size={32} />
                      <span className="text-xs font-bold uppercase">Upload File</span>
                      <input 
                        type="file" 
                        id="upload" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleUploadFile} 
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-600/25 transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Simpan Laporan
                  </>
                )}
              </button>
            </form>
          </div>
        );

      case 'laporan_kegiatan_saya':
        return (
          <div className="p-5 md:p-10 animate-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
                  <BookOpen className="text-blue-600" size={28} />
                  Riwayat Logbook
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Semua laporan kegiatan yang telah Anda buat
                </p>
              </div>
              
              <button 
                onClick={fetchMyLogbooks} 
                className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 text-blue-600 transition-all"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {/* Stats Mini */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-[10px] font-medium text-gray-500">Total</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.disetujui}</p>
                <p className="text-[10px] font-medium text-gray-500">Disetujui</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-[10px] font-medium text-gray-500">Pending</p>
              </div>
            </div>

            {/* Daftar Logbook */}
            <div className="space-y-4">
              {myLogbooks.length > 0 ? (
                myLogbooks.map((log) => (
                  <div key={log.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar size={14} className="text-blue-500" />
                          <span className="text-xs font-bold text-gray-600">{formatDate(log.tanggal)}</span>
                          <Clock size={14} className="text-blue-500 ml-2" />
                          <span className="text-xs font-bold text-gray-600">{formatTime(log.jam)}</span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">{log.aktivitas}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{log.uraian_kegiatan}</p>
                        {log.tempat && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <MapPin size={12} className="text-red-400" />
                            {log.tempat}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={log.status_validasi} />
                        {log.bukti && (
                          <a 
                            href={`http://localhost:5000/uploads/${log.bukti}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] text-purple-600 hover:underline"
                          >
                            <Image size={12} />
                            Lihat Bukti
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-[32px] p-20 text-center border border-gray-100">
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-sm font-medium text-gray-500">Belum ada logbook</p>
                  <p className="text-xs text-gray-400 mt-2">Mulai buat laporan pertama Anda</p>
                  <button 
                    onClick={() => setActiveMenu('input_kegiatan')}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
                  >
                    Buat Laporan
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        className="md:hidden fixed bottom-6 right-6 z-[60] p-4 bg-blue-600 text-white rounded-xl shadow-2xl hover:bg-blue-700 transition-all"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 
        w-72 bg-gradient-to-b from-gray-900 to-gray-800 
        flex flex-col transition-transform duration-300
        shadow-2xl md:shadow-none
      `}>
        {/* Logo */}
        <div className="p-8 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Intern-Gate</h2>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Student Portal</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {userData.nama?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate">{userData.nama}</p>
              <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wider mt-1">Peserta Magang</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
            { id: 'input_kegiatan', label: 'Tambah Laporan', icon: <Upload size={18} /> },
            { id: 'laporan_kegiatan_saya', label: 'Riwayat Logbook', icon: <BookOpen size={18} /> }
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => { 
                setActiveMenu(item.id); 
                setIsSidebarOpen(false); 
              }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeMenu === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-gray-700/50">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-all"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {renderContent()}
      </main>
    </div>
  );
};

export default Students;