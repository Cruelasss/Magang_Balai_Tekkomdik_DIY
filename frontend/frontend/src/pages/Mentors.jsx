import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  UserPlus, Search, Trash2, Users, Briefcase, 
  Plus, X, CheckCircle, Info, ExternalLink
} from 'lucide-react';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State baru untuk Detail Peserta
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [participants, setParticipants] = useState([]);

  const [newMentor, setNewMentor] = useState({
    nama_pembimbing: '',
    divisi: '',
    max_kuota: 5
  });

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
        const res = await api.get('/admin/mentors');
        const data = Array.isArray(res.data) ? res.data : [];
        setMentors(data);
    } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        console.error("Gagal ambil data mentor:", errorMsg);
        setMentors([]);
    }
  };

  // FUNGSI BARU: Ambil peserta berdasarkan ID Mentor
  const handleShowParticipants = async (mentor) => {
    setSelectedMentor(mentor);
    setIsDetailOpen(true);
    try {
        // Kita panggil data applications, lalu filter yang id_mentor-nya cocok
        const res = await api.get('/admin/applications');
        const allApps = Array.isArray(res.data) ? res.data : [];
        const filtered = allApps.filter(app => app.id_mentor === mentor.id && app.status === 'Aktif');
        setParticipants(filtered);
    } catch (err) {
        console.error("Gagal ambil data peserta:", err);
        setParticipants([]);
    }
  };

  const handleAddMentor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/mentors', newMentor);
      alert("Mentor berhasil ditambahkan!");
      setIsModalOpen(false);
      setNewMentor({ nama_pembimbing: '', divisi: '', max_kuota: 5 });
      fetchMentors(); 
    } catch (err) {
      console.error(err);
      alert("Gagal menambah mentor!");
    }
  };

  const handleDeleteMentor = async (id) => {
    if (window.confirm("Hapus mentor ini?")) {
      try {
        await api.delete(`/admin/mentors/${id}`);
        fetchMentors(); 
      } catch (err) {
        console.error(err);
        alert("Gagal menghapus!");
      }
    }
  };

  const filteredMentors = mentors.filter(m => 
    (m.nama_pembimbing?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (m.divisi?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* HEADER TETAP SAMA */}
      <div className="flex justify-between items-center mb-10">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Mentor</h1>
          <p className="text-sm text-gray-500">Kelola daftar pembimbing dan kuota bimbingan.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari mentor..." 
              className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg"
          >
            <Plus size={20}/> Tambah Mentor
          </button>
        </div>
      </div>

      {/* GRID MENTOR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map(m => (
          <div key={m.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users size={24} />
                </div>
                <div className="flex gap-2">
                    {/* TOMBOL LIHAT PESERTA */}
                    <button 
                      onClick={() => handleShowParticipants(m)}
                      className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                      title="Lihat Peserta"
                    >
                      <ExternalLink size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteMentor(m.id)}
                      className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                </div>
              </div>
              
              <div className="text-left mb-6">
                <h3 className="font-bold text-lg text-gray-800 uppercase truncate">{m.nama_pembimbing}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-xs mt-1 font-medium">
                  <Briefcase size={14} /> {m.divisi || 'Umum'}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Beban Kerja</span>
                <span className={`text-xs font-bold ${m.beban_kerja >= m.max_kuota ? 'text-red-500' : 'text-blue-600'}`}>
                  {m.beban_kerja || 0} / {m.max_kuota} Peserta
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${m.beban_kerja >= m.max_kuota ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(((m.beban_kerja || 0) / m.max_kuota) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL TAMBAH MENTOR (TETAP SAMA) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden text-left">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Tambah Mentor Baru</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleAddMentor} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Nama Lengkap</label>
                <input 
                  type="text" required
                  className="w-full p-4 bg-gray-50 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMentor.nama_pembimbing}
                  onChange={(e) => setNewMentor({...newMentor, nama_pembimbing: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg mt-4">
                Simpan Mentor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BARU: DAFTAR PESERTA BIMBINGAN */}
      {isDetailOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gray-800 p-6 text-white flex justify-between items-center">
              <div className="text-left">
                <h2 className="text-lg font-bold uppercase">{selectedMentor?.nama_pembimbing}</h2>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase">Daftar Mahasiswa Bimbingan</p>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-6 max-h-[400px] overflow-y-auto">
              {participants.length > 0 ? (
                <div className="space-y-3">
                  {participants.map((p, index) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm uppercase">{p.nama}</h4>
                          <p className="text-[10px] text-gray-500">{p.instansi} • {p.jurusan}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black rounded-full uppercase">
                        Aktif
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-gray-400 italic text-sm">
                  Belum ada mahasiswa yang diplotting ke mentor ini.
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t flex justify-end">
                <button 
                  onClick={() => setIsDetailOpen(false)}
                  className="px-6 py-2 bg-gray-800 text-white rounded-xl text-xs font-bold hover:bg-gray-900 transition-all"
                >
                  Tutup
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentors;