import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import * as XLSX from 'xlsx';
import { 
  Search, Eye, Trash2, X, User, FileText, CheckCircle, 
  XCircle, BookOpen, ExternalLink, UserPlus, Download, Calendar
} from 'lucide-react';

const Peserta = () => {
  const [interns, setInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATE MODAL & LOGBOOK ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profil'); 
  const [selectedData, setSelectedData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logRange, setLogRange] = useState('Semua');
  const [mentors, setMentors] = useState([]);
  const [plotForm, setPlotForm] = useState({ mentor_id: '', start: '', end: '' });

  // --- FUNGSI AMBIL DATA ---
  const fetchInitialData = async () => {
    try {
      const [res, mentorRes] = await Promise.all([
        api.get('/admin/applications'),
        api.get('/admin/mentors').catch(() => ({ data: [] }))
      ]);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

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

  // --- FUNGSI MODAL ---
  const openControlCenter = async (app, tab = 'profil') => {
    setSelectedData(app);
    setActiveTab(tab);
    setIsModalOpen(true);
    setPlotForm({ 
        mentor_id: app.id_mentor || '', // Pastikan key sesuai database (id_mentor)
        start: app.tgl_mulai || '', 
        end: app.tgl_selesai || '' 
    });
    if (tab === 'logbook') fetchLogbook(app.user_id);
  };

  const fetchLogbook = async (userId, range = 'Semua') => {
    setLogRange(range);
    try {
      const res = await api.get(`/admin/logbook?user_id=${userId}`);
      setLogs(res.data);
    } catch (err) { setLogs([]); }
  };

  const validateLog = async (id, status) => {
    try {
      await api.put(`/admin/logbook/${id}/validate`, { status_validasi: status });
      fetchLogbook(selectedData.user_id, logRange);
    } catch (err) { alert("Gagal validasi!"); }
  };

  // --- FUNGSI UPDATE TANGGAL & MENTOR (SATU FUNGSI) ---
  const handlePlotting = async (e) => {
    e.preventDefault();
    try {
      // Menggunakan endpoint assign-mentor yang sekaligus mengupdate start & end date
      await api.put(`/admin/applications/${selectedData.id}/assign-mentor`, {
        mentor_id: plotForm.mentor_id,
        start: plotForm.start,
        end: plotForm.end
      });
      alert("Data Masa Magang & Mentor Berhasil Diperbarui!");
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) { 
      alert("Gagal simpan perubahan! Periksa koneksi atau kuota mentor."); 
    }
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
      <div className="flex justify-between items-center mb-10 text-left">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Monitoring Peserta Aktif</h1>
          <p className="text-sm text-gray-500 font-medium">Kelola aktivitas, durasi magang, dan plotting mentor.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToExcel} className="p-2.5 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
            <Download size={18}/> Export
          </button>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Cari nama atau instansi..." className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      {/* TABEL UTAMA */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b">
            <tr>
              <th className="p-6">Peserta & Instansi</th>
              <th className="p-6 text-center">Periode Magang</th>
              <th className="p-6 text-center">Status</th>
              <th className="p-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {filtered.map(app => (
              <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="p-6">
                    <div className="font-bold text-gray-800 uppercase tracking-tight">{app.nama}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{app.instansi}</div>
                </td>
                <td className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-600">
                        <span>{app.tgl_mulai ? new Date(app.tgl_mulai).toLocaleDateString('id-ID') : '-'}</span>
                        <span className="text-gray-300">→</span>
                        <span>{app.tgl_selesai ? new Date(app.tgl_selesai).toLocaleDateString('id-ID') : '-'}</span>
                    </div>
                </td>
                <td className="p-6 text-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-tighter">Aktif</span>
                </td>
                <td className="p-6">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openControlCenter(app, 'plotting')} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all shadow-sm" title="Update Tanggal & Mentor"><Calendar size={18}/></button>
                    <button onClick={() => openControlCenter(app, 'profil')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Pusat Kendali"><Eye size={18}/></button>
                    <button onClick={() => handleDelete(app.id)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Hapus"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL CONTROL CENTER --- */}
      {isModalOpen && selectedData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center text-left">
              <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight leading-none">{selectedData.nama}</h2>
                  <p className="text-xs opacity-80 font-bold uppercase tracking-widest mt-2">{selectedData.instansi}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex bg-gray-50 border-b px-8 shrink-0">
              {[
                { id: 'profil', label: 'Profil & Berkas', icon: <User size={14}/> },
                { id: 'logbook', label: 'Logbook Laporan', icon: <BookOpen size={14}/> },
                { id: 'plotting', label: 'Update Periode & Mentor', icon: <Calendar size={14}/> }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => { setActiveTab(t.id); if(t.id === 'logbook') fetchLogbook(selectedData.user_id); }} 
                  className={`flex items-center gap-3 px-6 py-5 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === t.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div className="p-10 overflow-y-auto flex-1 bg-white text-left">
              {activeTab === 'profil' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-50 rounded-[24px] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Email Address</p>
                      <p className="font-bold text-gray-700">{selectedData.email}</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-[24px] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Program Studi</p>
                      <p className="font-bold text-gray-700">{selectedData.jurusan}</p>
                  </div>
                  {selectedData.berkas && (
                    <a href={`http://localhost:5000/uploads/${selectedData.berkas}`} target="_blank" rel="noreferrer" className="col-span-full flex items-center justify-center gap-4 bg-indigo-50 text-indigo-700 p-8 rounded-[32px] font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        <FileText size={24}/> Lihat Berkas PDF Pendaftaran
                    </a>
                  )}
                </div>
              )}

              {activeTab === 'logbook' && (
                <div className="space-y-4">
                  {logs.length > 0 ? logs.map(log => (
                    <div key={log.id} className="p-6 border rounded-[28px] bg-gray-50/50 hover:bg-white transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">📅 {new Date(log.tanggal).toLocaleDateString('id-ID')}</span>
                        <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${log.status_validasi === 'Disetujui' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{log.status_validasi || 'PENDING'}</span>
                      </div>
                      <p className="text-gray-600 italic font-medium leading-relaxed">"{log.aktivitas}"</p>
                      <div className="flex gap-2 mt-6">
                        <button onClick={() => validateLog(log.id, 'Disetujui')} className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 border border-green-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all"><CheckCircle size={14}/> Setujui</button>
                        <button onClick={() => validateLog(log.id, 'Ditolak')} className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"><XCircle size={14}/> Tolak</button>
                      </div>
                    </div>
                  )) : <div className="py-20 text-center"><BookOpen size={48} className="mx-auto text-gray-200 mb-4"/><p className="text-gray-400 italic font-medium">Belum ada aktivitas yang dilaporkan.</p></div>}
                </div>
              )}

              {activeTab === 'plotting' && (
                <form onSubmit={handlePlotting} className="max-w-2xl space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Pilih Pembimbing Lapangan</label>
                      <select required value={plotForm.mentor_id} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none" onChange={(e) => setPlotForm({...plotForm, mentor_id: e.target.value})}>
                        <option value="">-- Pilih Mentor --</option>
                        {mentors.map(m => (<option key={m.id} value={m.id} disabled={m.beban_kerja >= m.max_kuota}>{m.nama_pembimbing.toUpperCase()} | DIVISI: {m.divisi} ({m.beban_kerja}/{m.max_kuota})</option>))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Tanggal Mulai Magang</label>
                          <input type="date" required value={plotForm.start} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" onChange={(e) => setPlotForm({...plotForm, start: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Tanggal Selesai Magang</label>
                          <input type="date" required value={plotForm.end} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" onChange={(e) => setPlotForm({...plotForm, end: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-blue-200 hover:bg-black transition-all flex items-center justify-center gap-3">
                    <CheckCircle size={20}/> Simpan Perubahan Data
                  </button>
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