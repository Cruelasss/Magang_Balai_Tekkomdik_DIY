import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Search, FileText, Trash2, CheckCircle, XCircle } from 'lucide-react';

const Arsip = () => {
  const [archiveData, setArchiveData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Selesai');

  const fetchArchive = async () => {
    try {
      const res = await api.get('/admin/applications');
      // Pastikan response adalah array
      const data = Array.isArray(res.data) ? res.data : [];
      const filtered = data.filter(app => app.status === 'Selesai' || app.status === 'Ditolak');
      setArchiveData(filtered);
    } catch (err) {
      console.error("Gagal ambil data arsip:", err);
    }
  };

  useEffect(() => { fetchArchive(); }, []);

  // FUNGSI UNTUK MEMBUKA BERKAS
  const handleViewFile = (fileName) => {
    if (!fileName) return alert("Berkas tidak ditemukan!");
    // Kita arahkan ke folder uploads di backend (port 5000 sesuai server.js kamu)
    const fileUrl = `http://localhost:5000/uploads/${fileName}`;
    window.open(fileUrl, '_blank');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data dari arsip?")) {
      try {
        await api.delete(`/admin/applications/${id}`);
        fetchArchive();
      } catch (err) {
        alert("Gagal menghapus!");
      }
    }
  };

  const displayedData = archiveData.filter(app => {
    const matchesSearch = 
      (app.nama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
      (app.instansi?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesTab = app.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-gray-800">Arsip & Alumni</h1>
          <p className="text-sm text-gray-500">Data peserta yang telah menyelesaikan program atau ditolak.</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari di arsip..." 
            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* TABS FILTER */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('Selesai')}
          className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'Selesai' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-400 border'}`}
        >
          <CheckCircle size={14}/> Alumni (Selesai)
        </button>
        <button 
          onClick={() => setActiveTab('Ditolak')}
          className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'Ditolak' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-400 border'}`}
        >
          <XCircle size={14}/> Data Ditolak
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b">
            <tr>
              <th className="p-5">Peserta</th>
              <th className="p-5">Instansi</th>
              <th className="p-5 text-center">Periode</th>
              <th className="p-5 text-center">Status</th>
              <th className="p-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {displayedData.length > 0 ? displayedData.map(app => (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5 font-bold text-gray-800 text-left">{app.nama}</td>
                <td className="p-5 text-gray-600 text-left">{app.instansi}</td>
                <td className="p-5 text-center text-gray-500 text-xs">
                  {app.tgl_mulai ? `${new Date(app.tgl_mulai).toLocaleDateString('id-ID')} - ${new Date(app.tgl_selesai).toLocaleDateString('id-ID')}` : '-'}
                </td>
                <td className="p-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${app.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {app.status}
                  </span>
                </td>
                <td className="p-5 text-center">
                   <div className="flex justify-center gap-2">
                      {/* TOMBOL LIHAT BERKAS */}
                      <button 
                        onClick={() => handleViewFile(app.berkas)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Lihat Berkas PDF"
                      >
                        <FileText size={16}/>
                      </button>
                      {/* TOMBOL HAPUS */}
                      <button 
                        onClick={() => handleDelete(app.id)}
                        className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={16}/>
                      </button>
                   </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-400 italic font-medium">
                  Belum ada data di arsip {activeTab}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Arsip;