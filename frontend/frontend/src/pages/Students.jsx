import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Home, User, BookOpen, Key, LogOut, Upload,
  Calendar, Clock, FileText, CheckCircle, XCircle, Eye, Trash2, Download
} from 'lucide-react';

const Students = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  const [userData, setUserData] = useState({ 
    nama: '', 
    email: '', 
    role: '' 
  });

  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('08:00'); 
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [uraianKegiatan, setUraianKegiatan] = useState('');
  const [tempat, setTempat] = useState('');
  const [fileLampiran, setFileLampiran] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 

  const [myLogbooks, setMyLogbooks] = useState([]);
  const [isLoadingLogbooks, setIsLoadingLogbooks] = useState(false);

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
    }
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
    setMessage('');
    setMessageType('');

    const formData = new FormData();
    formData.append('tanggal', tanggal || null);
    formData.append('jam', jam || null);
    formData.append('aktivitas', namaKegiatan || "");
    formData.append('uraian_kegiatan', uraianKegiatan || "");
    formData.append('tempat', tempat || "");
    
    if (fileLampiran) {
      formData.append('bukti', fileLampiran);
    }

    try {
      const res = await api.post('/student/logbook', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setMessage(res.data.message || 'Kegiatan berhasil disimpan!');
      setMessageType('success');
      
      setTanggal('');
      setJam('08:00');
      setNamaKegiatan('');
      setUraianKegiatan('');
      setTempat('');
      setFileLampiran(null);
      
      setTimeout(() => {
        setActiveMenu('laporan_kegiatan_saya');
        fetchMyLogbooks();
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setMessage(`Gagal mengirim kegiatan: ${errorMsg}`);
      setMessageType('error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDownloadFile = (filename) => {
    window.open(`http://localhost:5000/uploads/${filename}`, '_blank');
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="p-8 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-left">Dashboard Mahasiswa</h2>
            <div className="bg-white p-6 rounded-[32px] shadow-sm text-left border border-gray-100">
              <p className="text-gray-700">Selamat datang kembali, <span className="font-bold text-blue-600">{userData.nama}</span>!</p>
              <div className="mt-6 p-5 bg-blue-50 text-blue-800 border-l-4 border-blue-600 rounded-2xl">
                  <p className="font-bold text-sm flex items-center gap-2"><CheckCircle size={16}/> Status Magang: AKTIF</p>
                  <p className="text-xs mt-1 text-blue-600 font-medium">Lengkapi logbook harian Anda untuk mempermudah proses validasi admin.</p>
              </div>
            </div>
          </div>
        );
      case 'profil':
        return (
          <div className="p-8 animate-in slide-in-from-bottom-2 duration-500 text-left">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Profil Saya</h2>
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[28px] flex items-center justify-center border border-blue-100">
                  <User size={48} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                    <p className="text-lg font-bold text-gray-800">{userData.nama || "User Mahasiswa"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                    <p className="font-bold text-gray-600">{userData.email || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'input_kegiatan':
        return (
          <div className="p-8 animate-in fade-in duration-500 text-left">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Input Kegiatan</h2>
            {message && (
              <div className={`p-4 mb-6 rounded-2xl font-bold text-sm ${messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmitLogbook} className="bg-white p-8 rounded-[32px] shadow-sm space-y-6 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tanggal</label>
                  <input type="date" className="w-full border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-bold text-sm" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Waktu</label>
                  <input type="time" className="w-full border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-bold text-sm" value={jam} onChange={(e) => setJam(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aktivitas Utama</label>
                <input type="text" className="w-full border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-bold text-sm" placeholder="Contoh: Pengembangan Fitur Dashboard" value={namaKegiatan} onChange={(e) => setNamaKegiatan(e.target.value)} required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Uraian / Tempat</label>
                <textarea rows="3" className="w-full border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-medium text-sm" placeholder="Jelaskan detail pengerjaan..." value={uraianKegiatan} onChange={(e) => setUraianKegiatan(e.target.value)}></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-black shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3">
                  <Upload size={18} /> Simpan Laporan Kegiatan
                </button>
              </div>
            </form>
          </div>
        );
      case 'laporan_kegiatan_saya':
        return (
          <div className="p-8 animate-in fade-in duration-500 text-left">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Riwayat Laporan</h2>
            <div className="bg-white rounded-[32px] shadow-sm overflow-hidden border border-gray-100">
              <table className="min-w-full">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-5">Waktu</th>
                    <th className="px-6 py-5">Aktivitas</th>
                    <th className="px-6 py-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoadingLogbooks ? (
                    <tr><td colSpan="3" className="py-20 text-center text-gray-300 font-bold">Memuat data...</td></tr>
                  ) : myLogbooks.length === 0 ? (
                    <tr><td colSpan="3" className="py-20 text-center text-gray-300 italic font-medium">Belum ada aktivitas tercatat.</td></tr>
                  ) : myLogbooks.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-800 text-sm">{new Date(log.tanggal).toLocaleDateString('id-ID')}</div>
                        <div className="text-[10px] text-blue-500 font-black uppercase">{log.jam || '--:--'} WIB</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-gray-800 uppercase tracking-tight">{log.aktivitas}</div>
                        <div className="text-xs text-gray-400 mt-1 line-clamp-1">{log.uraian_kegiatan || log.tempat}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase ${
                          log.status_validasi === 'Valid' || log.status_validasi === 'Disetujui' ? 'bg-green-100 text-green-700' :
                          log.status_validasi === 'Ditolak' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {log.status_validasi || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar - Tema Dark Blue Sesuai Dashboard */}
      <div className="w-72 bg-[#1e293b] text-gray-300 flex flex-col shadow-2xl">
        <div className="p-8 bg-blue-600 text-white text-xl font-black flex items-center justify-center tracking-tighter">
            INTERN-GATE
        </div>
        
        <div className="p-8 border-b border-gray-700/50">
            <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center font-bold mr-4 border border-blue-500/30">
                    <User size={24} />
                </div>
                <div className="text-left overflow-hidden">
                    <div className="font-bold text-white text-sm truncate uppercase tracking-tight">{userData.nama || "Mahasiswa"}</div>
                    <div className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1">Student Access</div>
                </div>
            </div>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
            { id: 'profil', label: 'Profil Saya', icon: <User size={18} /> },
            { id: 'input_kegiatan', label: 'Input Kegiatan', icon: <Upload size={18} /> },
            { id: 'laporan_kegiatan_saya', label: 'Riwayat Laporan', icon: <BookOpen size={18} /> }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveMenu(item.id)} 
              className={`w-full flex items-center py-4 px-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                activeMenu === item.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20 translate-x-1' 
                : 'hover:bg-gray-800 text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="mr-4">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-8">
          <button onClick={handleLogout} className="w-full flex items-center py-4 px-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20">
            <LogOut size={18} className="mr-4" /> Keluar
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-8 bg-white border-b border-gray-100">
          <div className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">
            Panel Monitoring Mahasiswa
          </div>
          <div className="text-right">
              <p className="text-xs font-black text-gray-800 leading-none">{userData.email}</p>
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest mt-1 inline-block">Online Status</span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Students;