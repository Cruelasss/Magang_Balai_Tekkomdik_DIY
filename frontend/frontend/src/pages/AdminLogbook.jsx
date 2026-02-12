import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { 
  Search, Calendar, User, CheckCircle, XCircle, 
  Clock, FileText, Filter, RefreshCw 
} from 'lucide-react';

const AdminLogbook = () => {
  const [searchParams] = useSearchParams();
  const participantId = searchParams.get('participantId'); // Menangkap ID dari URL

  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  useEffect(() => {
    fetchLogbooks();
  }, [participantId]); // Re-fetch jika ID di URL berubah

  const fetchLogbooks = async () => {
    try {
      setLoading(true);
      // Memanggil endpoint logbook (Pastikan backend mendukung query param user_id)
      const url = participantId ? `/admin/logbook?user_id=${participantId}` : '/admin/logbook';
      const res = await api.get(url);
      setLogbooks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gagal ambil logbook:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateValidation = async (id, status) => {
    try {
      await api.put(`/admin/logbook/${id}/validate`, { status_validasi: status });
      alert(`Logbook berhasil di-${status}`);
      fetchLogbooks();
    } catch (err) {
      alert("Gagal update validasi");
    }
  };

  // Logika Filter di Client Side
  const filteredData = logbooks.filter(log => {
    const matchesSearch = log.aktivitas?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Semua' || log.status_validasi === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen size={28} className="text-blue-600" />
            Monitoring Logbook 
            {participantId && <span className="text-blue-600 ml-2">#User-{participantId}</span>}
          </h1>
          <p className="text-sm text-gray-500">Validasi aktivitas harian peserta magang.</p>
        </div>
        
        <div className="flex gap-3">
           <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari aktivitas..." 
              className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchLogbooks} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 mb-6">
        {['Semua', 'Pending', 'Valid', 'Ditolak'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              filterStatus === status 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* TABLE / LIST LOGBOOK */}
      <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400 border-b">
            <tr>
              <th className="p-5">Tanggal & Peserta</th>
              <th className="p-5">Aktivitas</th>
              <th className="p-5">Bukti</th>
              <th className="p-5 text-center">Status</th>
              <th className="p-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center">Memuat data...</td></tr>
            ) : filteredData.length > 0 ? filteredData.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-gray-800 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(log.tanggal).toLocaleDateString('id-ID')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">ID Mahasiswa: {log.user_id}</span>
                  </div>
                </td>
                <td className="p-5 max-w-xs text-left">
                  <p className="text-sm text-gray-700 line-clamp-2">{log.aktivitas}</p>
                </td>
                <td className="p-5 text-left">
                  {log.bukti ? (
                    <a 
                      href={`http://localhost:5000/uploads/${log.bukti}`} 
                      target="_blank" 
                      className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
                    >
                      <FileText size={14} /> Lihat File
                    </a>
                  ) : <span className="text-gray-300 text-xs italic">Tanpa Bukti</span>}
                </td>
                <td className="p-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    log.status_validasi === 'Valid' ? 'bg-green-100 text-green-700' : 
                    log.status_validasi === 'Ditolak' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {log.status_validasi || 'Pending'}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleUpdateValidation(log.id, 'Valid')}
                      className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                      title="Validasi Benar"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button 
                      onClick={() => handleUpdateValidation(log.id, 'Ditolak')}
                      className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      title="Tolak"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="p-20 text-center text-gray-400 italic">
                  Tidak ada aktivitas ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLogbook;