import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Search, Trash2, Users, Briefcase, Plus, X, 
  BookOpen, ExternalLink, User, FileText, Calendar
} from 'lucide-react';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  // PERBAIKAN 1: Kapasitas default diubah menjadi 10
  const [newMentor, setNewMentor] = useState({ nama_pembimbing: '', divisi: '', max_kuota: 10 });

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  
  const [isControlOpen, setIsControlOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [activeTab, setActiveTab] = useState('profil');
  const [logs, setLogs] = useState([]);
  const [logRange, setLogRange] = useState('Semua');

  useEffect(() => { fetchMentors(); }, []);

  const fetchMentors = async () => {
    try {
      const res = await api.get('/admin/mentors');
      setMentors(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Gagal ambil mentor:", err); }
  };

  const handleShowParticipants = async (mentor) => {
    setSelectedMentor(mentor);
    setIsDetailOpen(true);
    try {
      const res = await api.get('/admin/applications');
      const filtered = res.data.filter(app => 
        app.id_mentor === mentor.id && 
        app.status?.toLowerCase() === 'aktif'
      );
      setParticipants(filtered);
    } catch (err) { 
      console.error("Gagal ambil peserta aktif:", err); 
      setParticipants([]);
    }
  };

  const openInternControl = (intern) => {
    setSelectedIntern(intern);
    setActiveTab('profil');
    setIsControlOpen(true);
    setLogs([]);
  };

  const fetchLogbook = async (userId, range) => {
    setLogRange(range);
    try {
      const res = await api.get(`/admin/logbook?user_id=${userId}`);
      setLogs(res.data);
    } catch (err) { setLogs([]); }
  };

  const handleAddMentor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/mentors', newMentor);
      setIsModalOpen(false);
      setNewMentor({ nama_pembimbing: '', divisi: '', max_kuota: 10 });
      fetchMentors();
    } catch (err) { alert("Gagal tambah mentor"); }
  };

 const handleDeleteMentor = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus mentor ini? Data riwayat bimbingan pada mahasiswa terkait akan dilepas.")) {
        try {
            const res = await api.delete(`/admin/mentors/${id}`);
            
            // Tampilkan pesan sukses dari server
            alert(res.data.message || "Mentor berhasil dihapus");
            
            // REFRESH DATA secara lokal agar mentor langsung hilang dari layar
            setMentors(prev => prev.filter(m => m.id !== id));
            
        } catch (err) {
            console.error("Error detail:", err.response);
            const errorMsg = err.response?.data?.message || "Gagal menghapus mentor dari server.";
            alert(errorMsg);
        }
    }
  };

  const filteredMentors = mentors.filter(m => 
    (m.nama_pembimbing?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* HEADER UTAMA */}
      <div className="flex justify-between items-center mb-10 text-left">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Manajemen Mentor</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">Monitoring pembimbing dan laporan mahasiswa aktif.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Cari nama mentor..." className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg">
            <Plus size={20}/> Tambah Mentor
          </button>
        </div>
      </div>

      {/* GRID KARTU MENTOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map(m => (
          <div key={m.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Users size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleShowParticipants(m)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all" title="Buka Detail"><ExternalLink size={18} /></button>
                <button onClick={() => handleDeleteMentor(m.id)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
            <div className="text-left mb-6">
              <h3 className="font-bold text-lg text-gray-800 uppercase truncate tracking-tight">{m.nama_pembimbing}</h3>
              <div className="flex items-center gap-2 text-gray-400 text-[11px] mt-1 font-bold uppercase tracking-wider"><Briefcase size={13} /> {m.divisi}</div>
            </div>
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Kapasitas</span>
                <span className={`text-xs font-black ${m.beban_kerja >= m.max_kuota ? 'text-red-500' : 'text-blue-600'}`}>{m.beban_kerja || 0} / {m.max_kuota}</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-700 ease-out ${m.beban_kerja >= m.max_kuota ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(((m.beban_kerja || 0) / m.max_kuota) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PERBAIKAN 2: MODAL DAFTAR MAHASISWA (TIDAK TERPOTONG) */}
      {isDetailOpen && selectedMentor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            {/* Header Modal - Tetap di Atas */}
            <div className="p-8 text-white flex justify-between items-center text-left shrink-0">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight leading-none">{selectedMentor.nama_pembimbing}</h2>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mt-2">Daftar Bimbingan Aktif • {participants.length} Orang</p>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            {/* Area Daftar dengan Scroll (Overflow) */}
            <div className="px-2 pb-2 bg-white rounded-t-[32px] flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-3 flex-1 scroll-smooth">
                {participants.length > 0 ? (
                  participants.map((p, index) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-4 text-left min-w-0">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm shrink-0">{index + 1}</div>
                        <div className="truncate">
                          <h4 className="font-bold text-gray-800 text-sm uppercase truncate">{p.nama}</h4>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5 truncate">{p.instansi} • {p.jurusan}</p>
                        </div>
                      </div>
                      <button onClick={() => openInternControl(p)} className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-100 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm shrink-0 ml-4">
                        <BookOpen size={14} /> Detail
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center text-gray-400 italic text-sm font-medium uppercase tracking-widest opacity-50">Belum ada mahasiswa bimbingan.</div>
                )}
              </div>
              
              {/* Footer Modal - Tetap di Bawah */}
              <div className="p-6 pt-2 border-t border-gray-50 bg-white shrink-0">
                   <button onClick={() => setIsDetailOpen(false)} className="w-full bg-[#1e293b] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all">Tutup Jendela</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONTROL CENTER */}
      {isControlOpen && selectedIntern && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center text-left shrink-0">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">{selectedIntern.nama}</h2>
                <p className="text-xs opacity-90 uppercase tracking-[0.2em] font-bold mt-1">{selectedIntern.instansi}</p>
              </div>
              <button onClick={() => setIsControlOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/40"><X size={28}/></button>
            </div>
            
            <div className="flex bg-gray-50 border-b px-8 shrink-0">
              {[
                { id: 'profil', label: 'Profil & Berkas', icon: <User size={16}/> },
                { id: 'logbook', label: 'Logbook Laporan', icon: <BookOpen size={16}/> }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => { setActiveTab(t.id); if(t.id === 'logbook') fetchLogbook(selectedIntern.user_id, 'Semua'); }} 
                  className={`flex items-center gap-3 px-8 py-5 text-xs font-black uppercase tracking-[0.15em] transition-all ${activeTab === t.id ? 'border-b-4 border-blue-600 text-blue-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div className="p-10 overflow-y-auto flex-1 bg-white text-left">
              {activeTab === 'profil' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">Alamat Email</p>
                    <p className="font-bold text-lg text-gray-700">{selectedIntern.email || '-'}</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">Program Studi</p>
                    <p className="font-bold text-lg text-gray-700">{selectedIntern.jurusan || '-'}</p>
                  </div>
                  {selectedIntern.berkas && (
                    <a 
                      href={`http://localhost:5000/uploads/${selectedIntern.berkas}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="col-span-full flex items-center justify-center gap-4 bg-indigo-50 text-indigo-700 p-7 rounded-[32px] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <FileText size={24}/> Buka Dokumen Berkas (PDF)
                    </a>
                  )}
                </div>
              )}

              {activeTab === 'logbook' && (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex gap-2 mb-8 shrink-0">
                    {['Semua', 'Harian', 'Mingguan', 'Bulanan'].map(r => (
                      <button key={r} onClick={() => fetchLogbook(selectedIntern.user_id, r)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${logRange === r ? 'bg-orange-600 text-white shadow-xl' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{r}</button>
                    ))}
                  </div>
                  {logs.length > 0 ? (
                    <div className="grid gap-4">
                      {logs.map(log => (
                        <div key={log.id} className="p-6 border border-gray-100 rounded-[28px] bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={13}/> {new Date(log.tanggal).toLocaleDateString('id-ID')}</span>
                            <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter ${log.status_validasi === 'Disetujui' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{log.status_validasi || 'MENUNGGU'}</span>
                          </div>
                          <p className="text-gray-600 text-sm italic font-medium leading-relaxed">"{log.aktivitas}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center">
                      <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-gray-400 italic font-medium">Belum ada aktivitas yang dilaporkan.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MENTOR - Default Kapasitas 10 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 text-left">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-6 text-white font-bold flex justify-between items-center">
                <span>Tambah Mentor Baru</span>
                <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleAddMentor} className="p-8 space-y-5">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nama Lengkap</label>
                  <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setNewMentor({...newMentor, nama_pembimbing: e.target.value})} required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Divisi / Bidang</label>
                  <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setNewMentor({...newMentor, divisi: e.target.value})} required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Kapasitas Maksimal (Default: 10)</label>
                  <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500" value={newMentor.max_kuota} onChange={(e) => setNewMentor({...newMentor, max_kuota: e.target.value})} required />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-200 mt-4">Simpan Mentor</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentors;