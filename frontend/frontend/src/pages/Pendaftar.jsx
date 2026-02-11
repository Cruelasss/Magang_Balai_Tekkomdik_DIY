import React, { useEffect, useState } from 'react';
import api from '../utils/api';
// Tambahkan icon yang diperlukan dari lucide-react
import { Search, CheckCircle, XCircle, Eye, Trash2, X, User, UserPlus, FileText } from 'lucide-react';

const Pendaftaran = () => {
  const [applicants, setApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- FUNGSI TAMBAHAN DARI DASHBOARD LAMA ---
  const [mentors, setMentors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profil'); 
  const [selectedData, setSelectedData] = useState(null);
  const [plotForm, setPlotForm] = useState({ mentor_id: '', start: '', end: '' });

  const fetchApplicants = async () => {
    try {
      // Ambil data aplikasi dan mentor sekaligus
      const [res, mentorRes] = await Promise.all([
        api.get('/admin/applications'),
        api.get('/admin/mentors').catch(() => ({ data: [] }))
      ]);
      
      // Filter hanya yang statusnya Pending (sesuai kodingan kamu yang berhasil)
      const pendingData = res.data.filter(app => app.status === 'Pending');
      setApplicants(pendingData);
      setMentors(mentorRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchApplicants(); }, []);

  // --- FUNGSI AKSI (MODAL & PLOTTING) ---
  const openControlCenter = (app, tab = 'profil') => {
    setSelectedData(app);
    setActiveTab(tab);
    setIsModalOpen(true);
    setPlotForm({ 
        mentor_id: app.mentor_id || '', 
        start: app.tgl_mulai || '', 
        end: app.tgl_selesai || '' 
    });
  };

  const handlePlotting = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/applications/${selectedData.id}/assign-mentor`, plotForm);
      alert("Plotting & Aktivasi Berhasil!");
      setIsModalOpen(false);
      fetchApplicants();
    } catch (err) { alert(err.response?.data?.message || "Gagal simpan plotting!"); }
  };

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Yakin ingin mengubah status menjadi ${status}?`)) return;
    try {
      await api.put(`/admin/applications/${id}/status`, { status });
      fetchApplicants();
    } catch (err) { alert("Gagal update!"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data pendaftar ini secara permanen?")) {
      try {
        await api.delete(`/admin/applications/${id}`);
        fetchApplicants();
      } catch (err) { alert("Gagal hapus!"); }
    }
  };

  const filtered = applicants.filter(app => 
    app.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.instansi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Pendaftaran Baru</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input type="text" placeholder="Cari pendaftar..." className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b">
            <tr>
              <th className="p-5">Nama Peserta</th>
              <th className="p-5">Instansi</th>
              <th className="p-5 text-center">Status</th>
              <th className="p-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {filtered.map(app => (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5 font-bold text-gray-800">{app.nama}</td>
                <td className="p-5 text-gray-600">{app.instansi}</td>
                <td className="p-5 text-center">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase">PENDING</span>
                </td>
                <td className="p-5">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openControlCenter(app, 'profil')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Lihat Profil"><Eye size={16}/></button>
                    <button onClick={() => openControlCenter(app, 'plotting')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Terima & Plotting"><CheckCircle size={16}/></button>
                    <button onClick={() => handleStatusUpdate(app.id, 'Ditolak')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Tolak"><XCircle size={16}/></button>
                    <button onClick={() => handleDelete(app.id)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Hapus"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL CONTROL CENTER (PROFIL & PLOTTING) --- */}
      {isModalOpen && selectedData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div><h2 className="text-xl font-bold uppercase">{selectedData.nama}</h2><p className="text-xs opacity-80">{selectedData.instansi}</p></div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex bg-gray-50 border-b px-6">
              {[
                { id: 'profil', label: 'Profil & Berkas', icon: <User size={14}/> },
                { id: 'plotting', label: 'Kelola Mentor', icon: <UserPlus size={14}/> }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id)} 
                  className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === t.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
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
                  {selectedData.berkas && (
                    <a href={`http://localhost:5000/uploads/${selectedData.berkas}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-indigo-50 text-indigo-700 p-5 rounded-3xl font-bold w-fit hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                      <FileText size={24}/> Buka PDF Berkas
                    </a>
                  )}
                </div>
              )}

              {activeTab === 'plotting' && (
                <form onSubmit={handlePlotting} className="max-w-2xl space-y-6">
                  <div className="bg-blue-50 p-6 rounded-[28px] border border-blue-100 flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><UserPlus size={24}/></div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Pengaturan Mentor & Masa Magang</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Pilih Pembimbing</label>
                      <select 
                        required 
                        value={plotForm.mentor_id} 
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        onChange={(e) => setPlotForm({...plotForm, mentor_id: e.target.value})}
                      >
                        <option value="">-- Pilih Mentor Dari Daftar --</option>
                        {mentors.map(m => (
                          <option key={m.id} value={m.id} disabled={m.beban_kerja >= m.max_kuota}>
                            {m.nama_pembimbing} | Divisi: {m.divisi} (Kuota: {m.beban_kerja}/{m.max_kuota})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Mulai</label>
                        <input type="date" required value={plotForm.start} className="w-full p-4 bg-gray-50 border rounded-[20px] text-sm" onChange={(e) => setPlotForm({...plotForm, start: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Selesai</label>
                        <input type="date" required value={plotForm.end} className="w-full p-4 bg-gray-50 border rounded-[20px] text-sm" onChange={(e) => setPlotForm({...plotForm, end: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-[22px] font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2">
                    <CheckCircle size={20}/> Simpan & Aktifkan
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

export default Pendaftaran;