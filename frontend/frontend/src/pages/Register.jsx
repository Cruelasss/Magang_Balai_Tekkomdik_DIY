import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  User, School, GraduationCap, Send, CheckCircle2, FileText, 
  Mail, ArrowLeft, Sparkles, Upload, Phone, Shield, Zap, Edit3
} from 'lucide-react';
import logo from '../assets/logo.svg';

const LIST_JURUSAN = [
  "Teknik Informatika", "Sistem Informasi", "Teknologi Informasi",
  "Rekayasa Perangkat Lunak (RPL)", "Teknik Komputer & Jaringan (TKJ)",
  "Sistem Informatika, Jaringan, dan Aplikasi (SIJA)", "Cyber Security", "Sains Data",
  "Ilmu Komunikasi", "Desain Komunikasi Visual (DKV)", "Broadcasting & Perfilman",
  "Multimedia", "Animasi", "Komunikasi dan Penyiaran Islam", "Public Relations", "Jurnalistik",
  "Teknik Elektronika", "Teknik Mekatronika", "Teknik Listrik", "Teknik Telekomunikasi",
  "Teknologi Kependidikan / Kurikulum", "Pendidikan Teknik Informatika & Komputer",
  "Manajemen Pendidikan", "Seni Teater / Seni Pertunjukan", "Sastra Inggris / Bahasa",
  "Manajemen", "Akuntansi", "Administrasi Perkantoran", "Bisnis Digital", "Lainnya"
].sort();

const Register = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [jurusanLainnya, setJurusanLainnya] = useState(''); // State untuk input manual
  const [formData, setFormData] = useState({
    nama: '',
    instansi: '',
    jurusan: '',
    email: '',
    nomor_wa: '' 
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf' && selectedFile.size <= 2 * 1024 * 1024) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      alert('File harus PDF dan maksimal 2MB');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Harap upload berkas PDF!");

    setLoading(true);

    // Tentukan nilai jurusan yang akan dikirim
    const finalJurusan = formData.jurusan === 'Lainnya' ? jurusanLainnya : formData.jurusan;

    if (!finalJurusan) {
      setLoading(false);
      return alert("Harap isi nama jurusan Anda!");
    }

    const data = new FormData();
    data.append('nama', formData.nama);
    data.append('email', formData.email);
    data.append('nomor_wa', formData.nomor_wa); 
    data.append('instansi', formData.instansi);
    data.append('jurusan', finalJurusan); // Mengirim nilai final (pilihan atau manual)
    data.append('berkas', file); 

    try {
      await api.post('/admin/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Gagal submit:", err);
      alert(err.response?.data?.message || "Gagal mengirim pendaftaran!");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="relative max-w-md w-full text-left">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl opacity-75 blur-xl"></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 text-center">
            <CheckCircle2 className="mx-auto text-green-500 mb-6" size={80} />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">Pendaftaran Berhasil!</h2>
            <p className="text-gray-600 mb-8">Data kamu sudah aman di sistem kami. Cek WhatsApp kamu secara berkala untuk info akun login. Terima kasih.</p>
            <Link to="/" className="block w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition-all">Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 py-20 text-left">
      <div className="fixed top-6 left-6 z-50">
        <Link to="/" className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-600 hover:text-blue-600 px-4 py-2 rounded-xl shadow-lg border border-white/20 transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Kembali</span>
        </Link>
      </div>

      <div className="w-full max-w-6xl relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[40px] opacity-75 blur-xl group-hover:opacity-100 transition-opacity"></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20 grid md:grid-cols-2 min-h-[700px]">
          
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <img src={logo} alt="Logo" className="h-10 w-auto bg-white p-2 rounded-xl" />
                <span className="font-black text-2xl tracking-tighter">InternGate</span>
              </div>
              <h2 className="text-4xl font-black mb-6 leading-tight uppercase tracking-tight">Mulai Karirmu<br/>Di Balai Tekkomdik</h2>
              <p className="text-blue-100 text-lg">Dapatkan pengalaman profesional nyata bersama para ahli teknologi pendidikan.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                <Shield className="text-blue-200" />
                <p className="text-xs font-bold uppercase tracking-widest">Data Aman Terproteksi</p>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                <Zap className="text-yellow-300" />
                <p className="text-xs font-bold uppercase tracking-widest">Notifikasi Akun Via WhatsApp</p>
              </div>
            </div>
          </div>

          <div className="p-12 overflow-y-auto max-h-[800px]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 text-gray-300" size={20} />
                    <input required type="text" placeholder="Nama Lengkap" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nomor WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 text-gray-300" size={20} />
                    <span className="absolute left-10 top-4 text-gray-400 font-bold">+62</span>
                    <input required type="tel" placeholder="8123xxx" className="w-full pl-20 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.nomor_wa} onChange={(e) => setFormData({...formData, nomor_wa: e.target.value})} />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email Aktif</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-gray-300" size={20} />
                  <input required type="email" placeholder="email@contoh.com" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Instansi</label>
                <div className="relative">
                  <School className="absolute left-4 top-4 text-gray-300" size={20} />
                  <input required type="text" placeholder="Asal Sekolah / Kampus" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.instansi} onChange={(e) => setFormData({...formData, instansi: e.target.value})} />
                </div>
              </div>

              {/* Jurusan Dropdown */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Jurusan</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-4 text-gray-300" size={20} />
                  <select 
                    required 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none cursor-pointer" 
                    value={formData.jurusan} 
                    onChange={(e) => setFormData({...formData, jurusan: e.target.value})}
                  >
                    <option value="" disabled>Pilih Jurusan</option>
                    {LIST_JURUSAN.map((j, i) => <option key={i} value={j}>{j}</option>)}
                  </select>
                </div>
              </div>

              {/* Field Manual Jurusan (Hanya muncul jika "Lainnya" dipilih) */}
              {formData.jurusan === 'Lainnya' && (
                <div className="animate-in slide-in-from-top duration-300">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Sebutkan Nama Jurusan Anda</label>
                  <div className="relative">
                    <Edit3 className="absolute left-4 top-4 text-blue-400" size={20} />
                    <input 
                      required 
                      type="text" 
                      placeholder="Masukkan nama jurusan secara manual" 
                      className="w-full pl-12 pr-4 py-4 bg-blue-50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                      value={jurusanLainnya} 
                      onChange={(e) => setJurusanLainnya(e.target.value)} 
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Berkas Pendaftaran (PDF)</label>
                <input required type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="flex items-center justify-between w-full px-6 py-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer hover:bg-blue-100 transition-all group">
                  <div className="flex items-center gap-3 text-blue-600 font-bold">
                    <Upload size={20} />
                    <span className="text-sm truncate max-w-[200px]">{fileName || 'Upload CV / Surat Pengantar'}</span>
                  </div>
                  <span className="text-[10px] bg-white px-3 py-1 rounded-full shadow-sm font-black text-blue-600">MAX 2MB</span>
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-xl shadow-blue-200 hover:bg-black transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3">
                {loading ? 'Mengirim...' : <><Send size={20} /> Kirim Pendaftaran</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;