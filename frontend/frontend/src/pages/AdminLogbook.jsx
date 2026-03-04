import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { 
  CheckCircle, XCircle, Calendar, Clock, 
  MapPin, FileText, RefreshCw, Navigation
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
      const data = Array.isArray(res.data) ? res.data : [];
      setLogbooks(data);
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
      alert("Gagal melakukan validasi.");
    }
  };

  const filteredData = logbooks.filter(log => {
    if (filterStatus === 'Semua') return true;
    const currentStatus = (log.status_validasi || 'Menunggu verifikasi').toLowerCase();
    const targetStatus = filterStatus.toLowerCase();
    return currentStatus === targetStatus;
  });

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 text-left">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
            <CheckCircle className="text-blue-600" size={28} />
            Validasi Logbook
          </h1>
        </div>
        <button onClick={fetchLogbooks} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-blue-50 text-blue-600 shadow-sm">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden text-left">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
            <tr>
              <th className="p-6">Mahasiswa</th>
              <th className="p-6">Aktivitas</th>
              <th className="p-6">Lokasi & Berkas</th>
              <th className="p-6 text-center">Validasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="4" className="p-20 text-center font-bold text-gray-300">Sinkronisasi...</td></tr>
            ) : filteredData.length > 0 ? filteredData.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50/20 transition-all">
                <td className="p-6">
                  <span className="text-sm font-black text-gray-800 uppercase">{log.nama_peserta || `User #${log.user_id}`}</span>
                  <p className="text-[10px] font-bold text-blue-500">{new Date(log.tanggal).toLocaleDateString('id-ID')}</p>
                </td>
                <td className="p-6">
                  <p className="font-black text-gray-800 text-sm uppercase">{log.aktivitas}</p>
                  <p className="text-xs text-gray-400 italic">"{log.uraian_kegiatan}"</p>
                </td>
                <td className="p-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-gray-500 flex items-center gap-1 uppercase">
                      <MapPin size={12} className="text-red-500"/> {log.tempat || 'N/A'}
                    </span>
                    
                    {/* INI BAGIAN YANG DIPERBAIKI */}
                    {log.latitude && log.longitude ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline"
                      >
                        <Navigation size={12} /> {parseFloat(log.latitude).toFixed(4)}, {parseFloat(log.longitude).toFixed(4)}
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-300 italic uppercase">No GPS</span>
                    )}

                    {log.bukti && (
                      <a href={`http://localhost:5000/uploads/${log.bukti}`} target="_blank" rel="noreferrer" className="text-[10px] font-black text-purple-600 uppercase flex items-center gap-1 hover:underline">
                        <FileText size={12} /> Lihat Berkas
                      </a>
                    )}
                  </div>
                </td>
                <td className="p-6 text-center">
                   {log.status_validasi === 'Menunggu verifikasi' ? (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleValidate(log.id, 'Disetujui')} className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white"><CheckCircle size={18} /></button>
                        <button onClick={() => handleValidate(log.id, 'Ditolak')} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white"><XCircle size={18} /></button>
                      </div>
                    ) : (
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${log.status_validasi === 'Disetujui' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status_validasi}</span>
                    )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="p-10 text-center text-gray-400">Tidak ada logbook.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLogbook;