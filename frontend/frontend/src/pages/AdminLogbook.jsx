import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { 
  CheckCircle, XCircle, Calendar, Clock, 
  MapPin, FileText, RefreshCw
} from 'lucide-react';

const AdminLogbook = () => {
  const [searchParams] = useSearchParams();
  const participantId = searchParams.get('participantId'); 

  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Semua');

  useEffect(() => {
    fetchLogbooks();
  }, [participantId]);

  const fetchLogbooks = async () => {
    try {
      setLoading(true);
      const url = participantId ? `/admin/logbook?user_id=${participantId}` : '/admin/logbook';
      const res = await api.get(url);
      
      // Memastikan data yang masuk adalah array agar map() tidak error
      const data = Array.isArray(res.data) ? res.data : [];
      setLogbooks(data);
      
      // Debug log (Bisa dihapus jika sudah jalan)
      console.log("Data Logbook Terdeteksi:", data.length);
    } catch (err) {
      console.error("Gagal ambil logbook:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id, status) => {
    const confirmMsg = status === 'Disetujui' ? 'Setujui laporan ini?' : 'Tolak laporan ini?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/admin/logbook/${id}/validate`, { status_validasi: status });
      
      setLogbooks(prev => prev.map(log => 
        log.id === id ? { ...log, status_validasi: status } : log
      ));
    } catch (err) {
      alert("Gagal melakukan validasi. Periksa koneksi backend.");
    }
  };

  // REVISI LOGIKA FILTER: Menggunakan .toLowerCase() agar sinkron dengan database
  const filteredData = logbooks.filter(log => {
    if (filterStatus === 'Semua') return true;
    
    // Normalisasi status dari DB (Menunggu verifikasi) vs Filter
    const currentStatus = (log.status_validasi || 'Menunggu verifikasi').toLowerCase();
    const targetStatus = filterStatus.toLowerCase();
    
    return currentStatus === targetStatus;
  });

  return (
    <div className="p-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 text-left">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
            <CheckCircle className="text-blue-600" size={28} />
            Validasi Logbook Peserta
          </h1>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">
            {participantId ? `Filter Peserta ID: ${participantId}` : 'Manajemen Aktivitas Harian Magang'}
          </p>
        </div>
        <button 
          onClick={fetchLogbooks} 
          className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-blue-50 text-blue-600 shadow-sm transition-all"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* FILTER TABS - Menggunakan teks yang sesuai database */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['Semua', 'Menunggu verifikasi', 'Disetujui', 'Ditolak'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              filterStatus === status 
              ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
              : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
            <tr>
              <th className="p-6">Mahasiswa & Waktu</th>
              <th className="p-6">Aktivitas</th>
              <th className="p-6">Lokasi & File</th>
              <th className="p-6 text-center">Validasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-left">
            {loading ? (
              <tr><td colSpan="4" className="p-20 text-center font-bold text-gray-300 uppercase tracking-widest animate-pulse">Sinkronisasi Data...</td></tr>
            ) : filteredData.length > 0 ? filteredData.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50/20 transition-all group">
                <td className="p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-gray-800 uppercase leading-none">
                      {log.nama || `User #${log.user_id}`}
                    </span>
                    <span className="text-[10px] font-bold text-blue-500 mt-1 flex items-center gap-1 leading-none uppercase tracking-tighter">
                      <Calendar size={12}/> {log.tanggal ? new Date(log.tanggal).toLocaleDateString('id-ID') : '-'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 leading-none uppercase">
                      <Clock size={12}/> {log.jam} WIB
                    </span>
                  </div>
                </td>
                <td className="p-6 max-w-xs">
                  <p className="font-black text-gray-800 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">{log.aktivitas}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 italic font-medium">"{log.uraian_kegiatan}"</p>
                </td>
                <td className="p-6 text-left">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-gray-500 flex items-center gap-1 uppercase">
                      <MapPin size={12} className="text-red-500"/> {log.tempat || '-'}
                    </span>
                    {log.bukti ? (
                      <a 
                        href={`http://localhost:5000/uploads/${log.bukti}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:text-black transition-colors"
                      >
                        <FileText size={14} /> Lihat Berkas
                      </a>
                    ) : <span className="text-[10px] text-gray-300 italic uppercase">No File</span>}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex justify-center gap-2">
                    {/* Normalisasi pengecekan untuk status pending */}
                    {(log.status_validasi || 'Menunggu verifikasi').toLowerCase() === 'menunggu verifikasi' ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleValidate(log.id, 'Disetujui')} 
                          className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleValidate(log.id, 'Ditolak')} 
                          className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    ) : (
                      <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        log.status_validasi === 'Disetujui' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status_validasi}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="p-20 text-center text-gray-300 italic font-medium uppercase tracking-widest">Data logbook tidak ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLogbook;