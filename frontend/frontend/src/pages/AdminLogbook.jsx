import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { 
  CheckCircle, XCircle, Calendar, Clock, 
  MapPin, FileText, Search, RefreshCw, Filter
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
      setLogbooks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gagal ambil logbook:", err);
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI UTAMA: Update Status (Approved/Rejected)
  const handleValidate = async (id, status) => {
    const confirmMsg = status === 'Disetujui' ? 'Setujui laporan ini?' : 'Tolak laporan ini?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/admin/logbook/${id}/validate`, { status_validasi: status });
      // Update state lokal agar instan tanpa reload
      setLogbooks(logbooks.map(log => log.id === id ? { ...log, status_validasi: status } : log));
    } catch (err) {
      alert("Gagal melakukan validasi");
    }
  };

  const filteredData = logbooks.filter(log => 
    filterStatus === 'Semua' || log.status_validasi === filterStatus
  );

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 text-left">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
            <CheckCircle className="text-orange-600" size={28} />
            Validasi Logbook Kegiatan
          </h1>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
            {participantId ? `Menampilkan Logbook ID Peserta: ${participantId}` : 'Seluruh Laporan Mahasiswa Magang'}
          </p>
        </div>
        <button onClick={fetchLogbooks} className="p-3 bg-white border rounded-xl hover:bg-gray-50 shadow-sm transition-all">
          <RefreshCw size={20} className="text-gray-600" />
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 mb-6">
        {['Semua', 'Menunggu verifikasi', 'Disetujui', 'Ditolak'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              filterStatus === status 
              ? 'bg-[#1e293b] text-white shadow-lg' 
              : 'bg-white text-gray-400 border hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* TABEL APPROVAL */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b">
            <tr>
              <th className="p-6">Mahasiswa & Waktu</th>
              <th className="p-6">Detail Aktivitas</th>
              <th className="p-6">Lokasi & Berkas</th>
              <th className="p-6 text-center">Aksi Approval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="4" className="p-20 text-center font-bold text-gray-400">Memuat data logbook...</td></tr>
            ) : filteredData.length > 0 ? filteredData.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50/20 transition-all">
                <td className="p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-gray-400 uppercase">ID User: {log.user_id}</span>
                    <span className="font-bold text-gray-800 flex items-center gap-2"><Calendar size={14}/> {new Date(log.tanggal).toLocaleDateString('id-ID')}</span>
                    <span className="text-xs text-orange-600 font-bold flex items-center gap-2"><Clock size={14}/> {log.jam || '--:--'} WIB</span>
                  </div>
                </td>
                <td className="p-6 max-w-xs">
                  <p className="font-bold text-gray-800 text-sm uppercase">{log.aktivitas}</p>
                  <p className="text-xs text-gray-500 mt-1 italic leading-relaxed">"{log.uraian_kegiatan || 'Tidak ada uraian'}"</p>
                </td>
                <td className="p-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-2"><MapPin size={14}/> {log.tempat || '-'}</span>
                    {log.bukti ? (
                      <a href={`http://localhost:5000/uploads/${log.bukti}`} target="_blank" className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline">
                        <FileText size={14} /> Lihat Lampiran
                      </a>
                    ) : <span className="text-[10px] text-gray-300 italic">Tanpa Lampiran</span>}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex flex-col items-center gap-2">
                    {log.status_validasi === 'Menunggu verifikasi' || !log.status_validasi ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleValidate(log.id, 'Disetujui')} className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Approve">
                          <CheckCircle size={20} />
                        </button>
                        <button onClick={() => handleValidate(log.id, 'Ditolak')} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Reject">
                          <XCircle size={20} />
                        </button>
                      </div>
                    ) : (
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                        log.status_validasi === 'Disetujui' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status_validasi}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="p-20 text-center text-gray-400 italic">Tidak ada laporan untuk divalidasi.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLogbook;