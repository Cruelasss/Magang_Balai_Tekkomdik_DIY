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

  // --- Fungsi Ambil Data Riwayat ---
  const fetchMyLogbooks = async () => {
    setIsLoadingLogbooks(true);
    try {
      const res = await api.get('/student/logbook');
      setMyLogbooks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gagal ambil riwayat:", err);
      setMyLogbooks([]);
    } finally {
      setIsLoadingLogbooks(false);
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

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="p-8 animate-in fade-in duration-500 text-left">
            <h2 className="text-xl font-bold mb-4 text-gray-800 tracking-tighter uppercase">Dashboard Mahasiswa</h2>
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <p className="text-gray-700">Selamat datang kembali, <span className="font-bold text-blue-600">{userData.nama}</span>!</p>
              <div className="mt-6 p-5 bg-blue-50 text-blue-800 border-l-4 border-blue-600 rounded-2xl">
                  <p className="font-bold text-sm flex items-center gap-2"><CheckCircle size={16}/> Sesi Magang Aktif</p>
                  <p className="text-xs mt-1 text-blue-600 font-medium">Logbook Anda akan diverifikasi secara berkala oleh pembimbing lapangan.</p>
              </div>
            </div>
          </div>
        );
      case 'input_kegiatan':
        return (
          <div className="p-8 animate-in fade-in duration-500 text-left">
            <h2 className="text-xl font-bold mb-4 text-gray-800 tracking-tighter uppercase">Tambah Laporan</h2>
            
            {message && (
              <div className={`p-4 mb-6 rounded-2xl font-bold text-sm border flex items-center gap-3 ${
                messageType === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {messageType === 'success' ? <CheckCircle size={18}/> : <XCircle size={18}/>}
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
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Jam</label>
                  <input type="time" step="1" className="w-full border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-bold text-sm" value={jam} onChange={(e) => setJam(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aktivitas</label>
                <input type="text" className="w-full border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-bold text-sm" placeholder="Judul kegiatan..." value={aktivitas} onChange={(e) => setAktivitas(e.target.value)} required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Uraian Detail</label>
                <textarea rows="3" className="w-full border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-medium text-sm" placeholder="Detail pengerjaan..." value={uraian_kegiatan} onChange={(e) => setUraianKegiatan(e.target.value)} required></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lokasi</label>
                <input type="text" className="w-full border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-bold text-sm" placeholder="Tempat kegiatan..." value={tempat} onChange={(e) => setTempat(e.target.value)} />
              </div>

              {/* BAGIAN UPLOAD BUKTI (DITAMBAHKAN KEMBALI) */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lampiran Bukti (Gambar/PDF)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-[28px] hover:border-blue-400 bg-gray-50 transition-all">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-10 w-10 text-gray-300" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="bukti" className="relative cursor-pointer font-black text-blue-600 hover:text-blue-500">
                        <span>Pilih Berkas</span>
                        <input id="bukti" type="file" className="sr-only" onChange={(e) => setBukti(e.target.files[0])} />
                      </label>
                    </div>
                    {bukti ? (
                      <p className="text-xs font-black text-green-600 uppercase tracking-tighter mt-2 flex items-center justify-center gap-1">
                        <CheckCircle size={12}/> {bukti.name}
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Maksimal 2MB (JPG, PNG, PDF)</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-black shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Tunggu Sebentar...' : <><Upload size={18} /> Simpan Laporan</>}
                </button>
              </div>
            </form>
          </div>
        );
      case 'laporan_kegiatan_saya':
        return (
          <div className="p-8 animate-in fade-in duration-500 text-left">
            <h2 className="text-xl font-bold mb-4 text-gray-800 tracking-tighter uppercase">Riwayat Logbook</h2>
            <div className="bg-white rounded-[32px] shadow-sm overflow-hidden border border-gray-100">
              <table className="min-w-full">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-5 text-left">Waktu & Tempat</th>
                    <th className="px-6 py-5 text-left">Aktivitas</th>
                    <th className="px-6 py-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-left">
                  {isLoadingLogbooks ? (
                    <tr><td colSpan="3" className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest">Sinkronisasi Data...</td></tr>
                  ) : myLogbooks.length === 0 ? (
                    <tr><td colSpan="3" className="py-20 text-center text-gray-300 italic font-medium">Belum ada aktivitas yang dilaporkan.</td></tr>
                  ) : myLogbooks.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-800 text-sm">{new Date(log.tanggal).toLocaleDateString('id-ID')}</div>
                        <div className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">{log.jam}</div>
                        <div className="text-[9px] text-gray-400 font-bold uppercase mt-1 italic leading-none">{log.tempat || 'Lokasi tidak diset'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-gray-800 uppercase tracking-tight leading-tight">{log.aktivitas}</div>
                        <div className="text-xs text-gray-400 mt-1 line-clamp-1 italic">"{log.uraian_kegiatan}"</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-tighter ${
                          log.status_validasi === 'Disetujui' || log.status_validasi === 'Valid' ? 'bg-green-100 text-green-700' :
                          log.status_validasi === 'Ditolak' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-800 shadow-inner'
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
      {/* Sidebar - Tema Dark Blue */}
      <div className="w-72 bg-[#1e293b] text-gray-300 flex flex-col shadow-2xl">
        <div className="p-8 bg-blue-600 text-white text-xl font-black flex items-center justify-center tracking-tighter uppercase">
            Intern-Gate
        </div>
        
        <div className="p-8 border-b border-gray-700/50 text-left">
            <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center font-bold mr-4 border border-blue-500/30">
                    <User size={24} />
                </div>
                <div className="overflow-hidden">
                    <div className="font-bold text-white text-sm truncate uppercase tracking-tight leading-none">{userData.nama}</div>
                    <div className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-2 leading-none">Status: {userData.role}</div>
                </div>
            </div>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
            { id: 'input_kegiatan', label: 'Tambah Laporan', icon: <Upload size={18} /> },
            { id: 'laporan_kegiatan_saya', label: 'Riwayat Logbook', icon: <BookOpen size={18} /> }
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
            <LogOut size={18} className="mr-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-8 bg-white border-b border-gray-100">
          <div className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">
             Sistem Informasi Monitoring Magang
          </div>
          <div className="text-right">
              <p className="text-xs font-black text-gray-800 leading-none">{userData.email}</p>
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest mt-1 inline-block uppercase font-bold tracking-widest">Online</span>
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