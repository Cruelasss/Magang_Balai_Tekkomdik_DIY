import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { 
  CheckCircle, XCircle, Calendar, Clock, 
  MapPin, FileText, RefreshCw, Navigation,
  Filter, AlertCircle, Users,
  Eye, Download, Clock as ClockIcon,
  User, UserCircle, Briefcase,
  Star, GraduationCap
} from 'lucide-react';

const AdminLogbook = () => {
  const [searchParams] = useSearchParams();
  const participantId = searchParams.get('participantId'); 

  const [logbooks, setLogbooks] = useState([]);
  const [participantInfo, setParticipantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Statistik status
  const stats = {
    pending: logbooks.filter(l => l.status_validasi === 'Menunggu verifikasi').length,
    approved: logbooks.filter(l => l.status_validasi === 'Disetujui').length,
    rejected: logbooks.filter(l => l.status_validasi === 'Ditolak').length,
    total: logbooks.length
  };

  // Ambil data logbook
  useEffect(() => {
    fetchLogbooks();
  }, [participantId]);

  const fetchLogbooks = async () => {
    try {
      setLoading(true);
      const url = participantId ? `/admin/logbook?user_id=${participantId}` : '/admin/logbook';
      const res = await api.get(url);
      setLogbooks(Array.isArray(res.data) ? res.data : []);
      
      // Ambil informasi peserta jika ada participantId
      if (participantId) {
        fetchParticipantInfo();
      }
    } catch (err) {
      console.error("Gagal ambil logbook:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantInfo = async () => {
    try {
      const res = await api.get(`/admin/participant/${participantId}`);
      setParticipantInfo(res.data);
    } catch (err) {
      console.error("Gagal ambil informasi peserta:", err);
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

  // Filter data berdasarkan status dan pencarian
  const filteredData = logbooks.filter(log => {
    // Filter status
    if (filterStatus !== 'Semua') {
      const currentStatus = (log.status_validasi || 'Menunggu verifikasi').toLowerCase();
      const targetStatus = filterStatus.toLowerCase();
      if (currentStatus !== targetStatus) return false;
    }
    
    // Filter pencarian
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (log.nama_peserta?.toLowerCase() || '').includes(term) ||
        (log.aktivitas?.toLowerCase() || '').includes(term) ||
        (log.uraian_kegiatan?.toLowerCase() || '').includes(term) ||
        (log.tempat?.toLowerCase() || '').includes(term) ||
        (log.nama_pembimbing?.toLowerCase() || '').includes(term)
      );
    }
    
    return true;
  });

  // Kelompokkan data berdasarkan status
  const pendingData = filteredData.filter(l => l.status_validasi === 'Menunggu verifikasi');
  const approvedData = filteredData.filter(l => l.status_validasi === 'Disetujui');
  const rejectedData = filteredData.filter(l => l.status_validasi === 'Ditolak');

  // Format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render card statistik
  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-xl`}>
          <Icon className={`${color}`} size={24} />
        </div>
      </div>
    </div>
  );

  // Modal Detail Logbook
  const DetailModal = ({ log, onClose }) => {
    if (!log) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-xl">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Detail Logbook</h2>
                <p className="text-xs text-gray-500">{formatDateTime(log.tanggal)}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <XCircle size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-sm font-medium text-gray-600">Status Validasi</span>
              {log.status_validasi === 'Disetujui' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-black uppercase">
                  <CheckCircle size={14} />
                  DITERIMA
                </span>
              )}
              {log.status_validasi === 'Ditolak' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-black uppercase">
                  <XCircle size={14} />
                  DITOLAK
                </span>
              )}
              {log.status_validasi === 'Menunggu verifikasi' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-xs font-black uppercase">
                  <ClockIcon size={14} />
                  PENDING
                </span>
              )}
            </div>

            {/* Informasi Peserta */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <User size={16} className="text-blue-600" />
                Informasi Peserta
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Nama</p>
                  <p className="font-bold text-gray-800">{log.nama_peserta || 'Tidak tersedia'}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">Instansi</p>
                  <p className="font-bold text-gray-800">{log.instansi || 'Tidak tersedia'}</p>
                </div>
              </div>
            </div>

            {/* Informasi Pembimbing */}
            {log.nama_pembimbing && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Star size={16} className="text-yellow-600" />
                  Informasi Pembimbing
                </h3>
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider mb-1">Nama Pembimbing</p>
                  <p className="font-bold text-gray-800">{log.nama_pembimbing}</p>
                  <p className="text-xs text-gray-600 mt-1">{log.divisi_pembimbing || 'Umum'}</p>
                </div>
              </div>
            )}

            {/* Detail Kegiatan */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Briefcase size={16} className="text-indigo-600" />
                Detail Kegiatan
              </h3>
              <div className="p-4 bg-indigo-50 rounded-xl">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2">Aktivitas</p>
                <p className="font-bold text-gray-800 text-lg mb-3">{log.aktivitas}</p>
                
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2">Uraian Kegiatan</p>
                <p className="text-gray-600 leading-relaxed">{log.uraian_kegiatan}</p>
              </div>
            </div>

            {/* Lokasi & Berkas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lokasi</p>
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                  <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{log.tempat || 'Tidak tersedia'}</span>
                </div>
                {log.latitude && log.longitude && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline p-2"
                  >
                    <Navigation size={12} />
                    Buka di Google Maps
                  </a>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Berkas</p>
                {log.bukti ? (
                  <a 
                    href={`http://localhost:5000/uploads/${log.bukti}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                  >
                    <FileText size={16} className="text-purple-600" />
                    <span className="text-sm text-purple-700 group-hover:underline">Lihat Berkas</span>
                    <Download size={14} className="text-purple-500 ml-auto" />
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 italic p-3">Tidak ada berkas</p>
                )}
              </div>
            </div>

            {/* Waktu Pengajuan */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
              <Clock size={14} />
              Diajukan pada: {formatDateTime(log.created_at || log.tanggal)}
            </div>
          </div>

          {/* Footer - Tombol Aksi */}
          {log.status_validasi === 'Menunggu verifikasi' && (
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex gap-3">
              <button 
                onClick={() => {
                  handleValidate(log.id, 'Disetujui');
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
              >
                <CheckCircle size={18} />
                Setujui
              </button>
              <button 
                onClick={() => {
                  handleValidate(log.id, 'Ditolak');
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
              >
                <XCircle size={18} />
                Tolak
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render tabel logbook
  const LogbookTable = ({ data, title, icon: Icon }) => {
    if (data.length === 0) return null;

    return (
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-xl">
            <Icon className="text-blue-600" size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
            {data.length}
          </span>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
              <tr>
                <th className="p-6 text-left">Peserta</th>
                <th className="p-6 text-left">Kegiatan</th>
                <th className="p-6 text-left">Lokasi & Berkas</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((log, index) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                  onClick={() => {
                    setSelectedLog(log);
                    setShowDetailModal(true);
                  }}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {log.nama_peserta?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {log.nama_peserta || `User #${log.user_id}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(log.tanggal)}
                          </span>
                        </div>
                        {log.nama_pembimbing && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={10} className="text-yellow-500" />
                            <span className="text-[10px] text-gray-500">
                              {log.nama_pembimbing}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-gray-800 text-sm mb-1">{log.aktivitas}</p>
                    <p className="text-xs text-gray-500 italic line-clamp-2">"{log.uraian_kegiatan}"</p>
                  </td>
                  <td className="p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} className="text-red-400" />
                        <span>{log.tempat || 'Tidak ada lokasi'}</span>
                      </div>
                      
                      {log.latitude && log.longitude && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <Navigation size={12} />
                          Lihat Maps
                        </a>
                      )}

                      {log.bukti && (
                        <a 
                          href={`http://localhost:5000/uploads/${log.bukti}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-purple-600 hover:underline"
                        >
                          <FileText size={12} />
                          Lihat Berkas
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    {log.status_validasi === 'Disetujui' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <CheckCircle size={14} />
                        Diterima
                      </span>
                    )}
                    {log.status_validasi === 'Ditolak' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        <XCircle size={14} />
                        Ditolak
                      </span>
                    )}
                    {log.status_validasi === 'Menunggu verifikasi' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                        <ClockIcon size={14} />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-center">
                    <div onClick={(e) => e.stopPropagation()}>
                      {log.status_validasi === 'Menunggu verifikasi' ? (
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleValidate(log.id, 'Disetujui')} 
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                            title="Setujui"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleValidate(log.id, 'Ditolak')} 
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                            title="Tolak"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => window.confirm('Ubah status menjadi pending?') && handleValidate(log.id, 'Menunggu verifikasi')}
                          className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-200 hover:text-gray-600 transition-all"
                          title="Ubah ke Pending"
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
            <CheckCircle className="text-blue-600" size={28} />
            Validasi Logbook
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan validasi laporan harian peserta magang
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari logbook..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all w-64"
            />
            <Eye className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`p-3 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 transition-all ${showFilters ? 'bg-blue-50 border-blue-200' : ''}`}
          >
            <Filter size={20} className={showFilters ? 'text-blue-600' : 'text-gray-600'} />
          </button>

          <button 
            onClick={fetchLogbooks} 
            className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 text-blue-600 transition-all"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Informasi Peserta (jika ada participantId) */}
      {participantInfo && (
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl text-white shadow-xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <UserCircle size={48} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-200 mb-1">Informasi Peserta</p>
              <h2 className="text-2xl font-bold mb-2">{participantInfo.nama}</h2>
              <div className="flex flex-wrap gap-4">
                <span className="text-sm text-white/90">{participantInfo.instansi}</span>
                <span className="text-sm text-white/90">{participantInfo.jurusan}</span>
              </div>
              {participantInfo.nama_pembimbing && (
                <div className="mt-2 flex items-center gap-2">
                  <Star size={16} className="text-yellow-300" />
                  <span className="text-sm text-white/90">Pembimbing: {participantInfo.nama_pembimbing}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter Status:</span>
            {[
              { value: 'Semua', label: 'Semua', count: stats.total },
              { value: 'Menunggu verifikasi', label: 'Pending', count: stats.pending },
              { value: 'Disetujui', label: 'Diterima', count: stats.approved },
              { value: 'Ditolak', label: 'Ditolak', count: stats.rejected }
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === status.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status.label} ({status.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={Users} 
          label="Total Logbook" 
          value={stats.total} 
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard 
          icon={ClockIcon} 
          label="Pending" 
          value={stats.pending} 
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard 
          icon={CheckCircle} 
          label="Diterima" 
          value={stats.approved} 
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard 
          icon={XCircle} 
          label="Ditolak" 
          value={stats.rejected} 
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-20">
          <div className="flex flex-col items-center justify-center">
            <RefreshCw size={40} className="text-blue-600 animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-500">Memuat data logbook...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Tampilan terpisah berdasarkan status */}
          {filterStatus === 'Semua' ? (
            <>
              <LogbookTable data={pendingData} title="Pending Verification" icon={ClockIcon} />
              <LogbookTable data={approvedData} title="Approved Logbooks" icon={CheckCircle} />
              <LogbookTable data={rejectedData} title="Rejected Logbooks" icon={XCircle} />
              
              {filteredData.length === 0 && (
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-20 text-center">
                  <AlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-500">Tidak ada logbook yang ditemukan</p>
                </div>
              )}
            </>
          ) : (
            <LogbookTable 
              data={filteredData} 
              title={`${filterStatus} Logbooks`} 
              icon={
                filterStatus === 'Disetujui' ? CheckCircle : 
                filterStatus === 'Ditolak' ? XCircle : ClockIcon
              }
            />
          )}
        </>
      )}

      {/* Modal Detail */}
      {showDetailModal && (
        <DetailModal 
          log={selectedLog} 
          onClose={() => {
            setShowDetailModal(false);
            setSelectedLog(null);
          }} 
        />
      )}
    </div>
  );
};

export default AdminLogbook;