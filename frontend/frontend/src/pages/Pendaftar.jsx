import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Search, CheckCircle, XCircle, Eye, Trash2, X, User, UserPlus, FileText, RefreshCw, GraduationCap } from 'lucide-react';

const Pendaftaran = () => {
  const [applicants, setApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mentors, setMentors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profil'); 
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plotForm, setPlotForm] = useState({ mentor_id: '', start: '', end: '' });

  const fetchApplicants = async () => {
    try {
      const [res, mentorRes] = await Promise.all([
        api.get('/admin/applications'),
        api.get('/admin/mentors').catch(() => ({ data: [] }))
      ]);
      const pendingData = res.data.filter(app => app.status === 'Pending');
      setApplicants(pendingData);
      setMentors(mentorRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchApplicants(); }, []);

  const sendWhatsAppAccount = (intern, password) => {
    if (!intern || !intern.nomor_wa) {
      alert("Gagal mengirim WA: Nomor WhatsApp pendaftar tidak ditemukan di database!");
      return;
    }

    let cleanNumber = intern.nomor_wa.toString().replace(/[^0-9]/g, '');

    if (cleanNumber.startsWith('0')) {
      cleanNumber = '62' + cleanNumber.slice(1);
    } else if (cleanNumber.startsWith('8')) {
      cleanNumber = '62' + cleanNumber;
    }

    const message = encodeURIComponent(
      `Halo *${intern.nama}*!\n\n` +
      `Selamat! Pendaftaran magang kamu di *Balai Tekkomdik DIY* telah diterima.\n` +
      `Berikut adalah akun untuk login ke portal peserta:\n\n` +
      `📧 *Email:* ${intern.email}\n` +
      `🔑 *Password:* ${password}\n\n` +
      `Silakan login di: ${window.location.origin}\n` +
      `Terima kasih!`
    );

    const waUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${message}`;
    window.open(waUrl, '_blank');
  };

  const handlePlotting = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/admin/applications/${selectedData.id}/assign-mentor`, plotForm);
      const passwordBaru = res.data.generatedPassword;
      alert("Plotting Berhasil! Akun peserta telah dibuat secara otomatis.");
      sendWhatsAppAccount(selectedData, passwordBaru);
      setIsModalOpen(false);
      fetchApplicants();
    } catch (err) { 
      alert(err.response?.data?.message || "Gagal simpan plotting!"); 
    } finally {
      setLoading(false);
    }
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

  const filtered = applicants.filter(app => 
    (app.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (app.instansi || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.jurusan || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Pendaftaran Baru</h1>
            <p className="text-sm text-gray-400 font-medium">Validasi berkas dan aktivasi akun peserta via WhatsApp.</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input type="text" placeholder="Cari nama, instansi, atau jurusan..." className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b">
            <tr>
              <th className="p-6">Pendaftar</th>
              <th className="p-6">Instansi</th>
              <th className="p-6">Jurusan</th> {/* KOLOM BARU */}
              <th className="p-6 text-center">Status</th>
              <th className="p-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm font-medium text-gray-700">
            {filtered.map(app => (
              <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-6 font-bold text-gray-800 uppercase tracking-tight">{app.nama}</td>
                <td className="p-6 text-gray-500">{app.instansi}</td>
                <td className="p-6 text-gray-500">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-blue-500" />
                    {app.jurusan}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-amber-100 text-amber-700 uppercase tracking-tighter">WAITING</span>
                </td>
                <td className="p-6">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openControlCenter(app, 'profil')} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Eye size={18}/></button>
                    <button onClick={() => openControlCenter(app, 'plotting')} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"><CheckCircle size={18}/></button>
                    <button onClick={() => handleStatusUpdate(app.id, 'Ditolak')} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><XCircle size={18}/></button>
                    <button onClick={() => handleDelete(app.id)} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CONTROL CENTER */}
      {isModalOpen && selectedData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center text-left">
              <div><h2 className="text-2xl font-black uppercase tracking-tight">{selectedData.nama}</h2><p className="text-xs font-bold opacity-80 uppercase tracking-widest">{selectedData.instansi}</p></div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex bg-gray-50 border-b px-8">
              {[
                { id: 'profil', label: 'Profil & Berkas', icon: <User size={14}/> },
                { id: 'plotting', label: 'Kelola Mentor', icon: <UserPlus size={14}/> }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id)} 
                  className={`flex items-center gap-3 px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === t.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div className="p-10 overflow-y-auto flex-1 bg-white text-left">
              {activeTab === 'profil' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-gray-50 rounded-[20px] border border-gray-100"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p><p className="font-bold text-gray-700">{selectedData.email}</p></div>
                    <div className="p-5 bg-gray-50 rounded-[20px] border border-gray-100"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">WhatsApp</p><p className="font-bold text-gray-700">{selectedData.nomor_wa}</p></div>
                    <div className="p-5 bg-gray-50 rounded-[20px] border border-gray-100"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jurusan</p><p className="font-bold text-gray-700">{selectedData.jurusan}</p></div>
                  </div>
                  {selectedData.berkas && (
                    <a href={`http://localhost:5000/uploads/${selectedData.berkas}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-indigo-50 text-indigo-700 p-6 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                      <FileText size={24}/> Buka PDF Berkas Pendaftaran
                    </a>
                  )}
                </div>
              )}

              {activeTab === 'plotting' && (
                <form onSubmit={handlePlotting} className="max-w-2xl space-y-6">
                  <div className="bg-blue-50 p-6 rounded-[24px] border border-blue-100 flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200"><UserPlus size={24}/></div>
                    <p className="text-xs text-blue-600 font-black uppercase tracking-widest">Pengaturan Mentor & Masa Magang</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Pilih Pembimbing</label>
                      <select required value={plotForm.mentor_id} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all" onChange={(e) => setPlotForm({...plotForm, mentor_id: e.target.value})}>
                        <option value="">-- Pilih Mentor Dari Daftar --</option>
                        {mentors.map(m => (
                          <option key={m.id} value={m.id} disabled={m.beban_kerja >= m.max_kuota}>
                            {m.nama_pembimbing.toUpperCase()} | DIVISI: {m.divisi} ({m.beban_kerja}/{m.max_kuota})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Mulai</label><input type="date" required value={plotForm.start} className="w-full p-4 bg-gray-50 border rounded-[20px] text-sm font-bold" onChange={(e) => setPlotForm({...plotForm, start: e.target.value})} /></div>
                      <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Selesai</label><input type="date" required value={plotForm.end} className="w-full p-4 bg-gray-50 border rounded-[20px] text-sm font-bold" onChange={(e) => setPlotForm({...plotForm, end: e.target.value})} /></div>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    <CheckCircle size={20}/> {loading ? 'Memproses...' : 'Simpan & Aktifkan Peserta'}
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