import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import * as XLSX from 'xlsx';
import { 
  Search, Eye, Trash2, X, User, FileText, CheckCircle, 
  XCircle, BookOpen, ExternalLink, UserPlus, Download 
} from 'lucide-react';

const Peserta = () => {
  const [interns, setInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATE MODAL & LOGBOOK (AMBIL DARI DASHBOARD LAMA) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profil'); 
  const [selectedData, setSelectedData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logRange, setLogRange] = useState('Semua');
  const [mentors, setMentors] = useState([]);
  const [plotForm, setPlotForm] = useState({ mentor_id: '', start: '', end: '' });

  // --- FUNGSI AMBIL DATA (PAKAI LOGIKA KODE KAMU) ---
  const fetchInitialData = async () => {
    try {
      const [res, mentorRes] = await Promise.all([
        api.get('/admin/applications'),
        api.get('/admin/mentors').catch(() => ({ data: [] }))
      ]);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Sesuai logika kamu: Filter AKTIF atau APPROVED tanpa pandang bulu case-nya
      const processed = res.data.filter(app => {
        const s = app.status ? app.status.toString().toUpperCase().trim() : "";
        return s === 'AKTIF' || s === 'APPROVED';
      }).map(app => {
        if (app.tgl_selesai) {
          const endDate = new Date(app.tgl_selesai);
          if (today > endDate) return { ...app, status: 'Selesai' };
        }
        return app;
      });

      setInterns(processed);
      setMentors(mentorRes.data);
    } catch (err) { 
      console.error("Gagal tarik data:", err); 
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  // --- FUNGSI MODAL & VALIDASI (UTUH DARI DASHBOARD LAMA) ---
  const openControlCenter = async (app, tab = 'profil') => {
    setSelectedData(app);
    setActiveTab(tab);
    setIsModalOpen(true);
    setPlotForm({ 
        mentor_id: app.mentor_id || '', 
        start: app.tgl_mulai || '', 
        end: app.tgl_selesai || '' 
    });
    if (tab === 'logbook') fetchLogbook(app.user_id, 'Semua');
  };

  const fetchLogbook = async (userId, range) => {
    setLogRange(range);
    try {
      const res = await api.get(`/logbooks/participant/${userId}?range=${range.toLowerCase()}`);
      setLogs(res.data);
    } catch (err) { setLogs([]); }
  };

  const validateLog = async (id, status) => {
    try {
      await api.put(`/logbooks/validate/${id}`, { status });
      fetchLogbook(selectedData.user_id, logRange);
    } catch (err) { alert("Gagal validasi!"); }
  };

  const handlePlotting = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/applications/${selectedData.id}/assign-mentor`, plotForm);
      alert("Data Berhasil Diperbarui!");
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) { alert("Gagal simpan perubahan!"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data peserta ini secara permanen?")) {
      try {
        await api.delete(`/admin/applications/${id}`);
        fetchInitialData();
      } catch (err) { alert("Gagal menghapus!"); }
    }
  };

  const exportToExcel = () => {
    const dataToExport = interns.map(app => ({
      "Nama": app.nama, "Instansi": app.instansi, "Mulai": app.tgl_mulai, "Selesai": app.tgl_selesai, "Status": app.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "Data_Peserta_Aktif.xlsx");
  };

  const filtered = interns.filter(app => 
    (app.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.instansi || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-gray-800">Monitoring Peserta Aktif</h1>
          <p className="text-sm text-gray-500">Kelola aktivitas dan plotting mentor peserta magang.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="p-2.5 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition-all">
            <Download size={18}/>
          </button>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Cari peserta..." className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      {/* TABEL UTAMA */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b">
            <tr>
              <th className="p-5">Peserta</th>
              <th className="p-5">Instansi</th>
              <th className="p-5 text-center">Mulai</th>
              <th className="p-5 text-center">Selesai</th>
              <th className="p-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {filtered.map(app => (
              <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-5 font-bold text-gray-800 uppercase tracking-tight">{app.nama}</td>
                <td className="p-5 text-gray-600">{app.instansi}</td>
                <td className="p-5 text-center font-medium">{app.tgl_mulai ? new Date(app.tgl_mulai).toLocaleDateString('id-ID') : '-'}</td>
                <td className="p-5 text-center font-medium">{app.tgl_selesai ? new Date(app.tgl_selesai).toLocaleDateString('id-ID') : '-'}</td>
                <td className="p-5 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openControlCenter(app, 'profil')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Pusat Kendali"><Eye size={18}/></button>
                    <button onClick={() => handleDelete(app.id)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Hapus"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL CONTROL CENTER LENGKAP (DARI DASHBOARD LAMA) --- */}
      {isModalOpen && selectedData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div className="text-left"><h2 className="text-xl font-bold uppercase">{selectedData.nama}</h2><p className="text-xs opacity-80">{selectedData.instansi}</p></div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex bg-gray-50 border-b px-6 overflow-x-auto">
              {[
                { id: 'profil', label: 'Profil & Berkas', icon: <User size={14}/> },
                { id: 'logbook', label: 'Logbook Laporan', icon: <BookOpen size={14}/> },
                { id: 'plotting', label: 'Kelola Mentor', icon: <UserPlus size={14}/> }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => { setActiveTab(t.id); if(t.id === 'logbook') fetchLogbook(selectedData.user_id, 'Semua'); }} 
                  className={`flex items-center gap-2 px-6 py-4 text-xs font-bold border-b-2 transition-all ${activeTab === t.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-400'}`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-white text-left">
              {activeTab === 'profil' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border"><p className="text-[10px] font-bold text-gray-400 uppercase">Email</p><p className="font-semibold">{selectedData.email}</p></div>
                    <div className="p-4 bg-gray-50 rounded-2xl border"><p className="text-[10px] font-bold text-gray-400 uppercase">Jurusan</p><p className="font-semibold">{selectedData.jurusan}</p></div>
                  </div>
                  {selectedData.berkas && <a href={`http://localhost:5000/uploads/${selectedData.berkas}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-indigo-50 text-indigo-700 p-5 rounded-3xl font-bold w-fit hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><FileText size={24}/> Buka PDF Berkas</a>}
                </div>
              )}

              {activeTab === 'logbook' && (
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    {['Semua', 'Harian', 'Mingguan', 'Bulanan'].map(r => (
                      <button key={r} onClick={() => fetchLogbook(selectedData.user_id, r)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${logRange === r ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>{r}</button>
                    ))}
                  </div>
                  {logs.length > 0 ? logs.map(log => (
                    <div key={log.id} className="p-5 border rounded-[24px] bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">📅 {new Date(log.tanggal).toLocaleDateString('id-ID')}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${log.status_validasi === 'Valid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{log.status_validasi || 'PENDING'}</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">"{log.aktivitas}"</p>
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => validateLog(log.id, 'Valid')} className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"><CheckCircle size={14}/></button>
                        <button onClick={() => validateLog(log.id, 'Invalid')} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><XCircle size={14}/></button>
                      </div>
                    </div>
                  )) : <p className="text-center py-10 text-gray-400 italic">Belum ada aktivitas dilaporkan.</p>}
                </div>
              )}

              {activeTab === 'plotting' && (
                <form onSubmit={handlePlotting} className="max-w-2xl space-y-6">
                  <div className="bg-blue-50 p-6 rounded-[28px] border border-blue-100 flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><UserPlus size={24}/></div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Update Mentor & Masa Magang</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pilih Pembimbing</label>
                      <select required value={plotForm.mentor_id} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setPlotForm({...plotForm, mentor_id: e.target.value})}>
                        <option value="">-- Pilih Mentor Dari Daftar --</option>
                        {mentors.map(m => (<option key={m.id} value={m.id} disabled={m.beban_kerja >= m.max_kuota}>{m.nama_pembimbing} | Divisi: {m.divisi} (Kuota: {m.beban_kerja}/{m.max_kuota})</option>))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Mulai</label><input type="date" required value={plotForm.start} className="w-full p-4 bg-gray-50 border rounded-[20px] text-sm" onChange={(e) => setPlotForm({...plotForm, start: e.target.value})} /></div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Selesai</label><input type="date" required value={plotForm.end} className="w-full p-4 bg-gray-50 border rounded-[20px] text-sm" onChange={(e) => setPlotForm({...plotForm, end: e.target.value})} /></div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-[22px] font-bold shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2"><CheckCircle size={20}/> Simpan Perubahan</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Peserta;