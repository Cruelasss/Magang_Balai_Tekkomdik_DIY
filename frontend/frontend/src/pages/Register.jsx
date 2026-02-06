import React, { useState } from 'react';
import api from '../utils/api';
import { User, School, GraduationCap, Send, CheckCircle2, FileText, Mail } from 'lucide-react';

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
  const [file, setFile] = useState(null); // State untuk menampung file
  const [formData, setFormData] = useState({
    nama: '',
    instansi: '',
    jurusan: '',
    email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi file wajib diisi
    if (!file) {
      alert("Harap upload berkas PDF terlebih dahulu!");
      return;
    }

    setLoading(true);

    // Menggunakan FormData karena kita mengirim FILE
    const data = new FormData();
    data.append('nama', formData.nama);
    data.append('email', formData.email);
    data.append('instansi', formData.instansi);
    data.append('jurusan', formData.jurusan);
    data.append('berkas', file); // 'berkas' harus sesuai dengan di backend upload.single('berkas')

    try {
      // Pastikan endpoint backend kamu adalah /applications/submit
      await api.post('/applications/submit', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal mengirim pendaftaran !!");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="max-w-md w-full text-center bg-white p-10 rounded-3xl shadow-xl border border-green-100 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="mx-auto text-green-500 mb-6" size={80} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-gray-600 mb-8">Data dan berkas kamu sudah masuk ke sistem Balai Tekkomdik DIY. Tunggu update selanjutnya ya!</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg">
            Kirim pendaftaran lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center font-sans">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Sisi Kiri: Informasi */}
        <div className="bg-blue-600 md:w-1/3 p-8 text-white flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold mb-4">Gabung Magang!</h2>
          <p className="text-blue-100 text-sm leading-relaxed mb-6">
            Daftarkan dirimu untuk pengalaman magang seru di Balai Tekkomdik DIY. 
          </p>
          <ul className="text-xs text-blue-200 space-y-2 opacity-80">
            <li>• Pastikan Email Aktif</li>
            <li>• Siapkan Berkas PDF (Max 2MB)</li>
            <li>• Pilih Jurusan yang Sesuai</li>
          </ul>
        </div>

        {/* Sisi Kanan: Form */}
        <div className="flex-1 p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input Nama */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <User size={16} className="text-blue-500" /> Nama Lengkap
              </label>
              <input
                required
                type="text"
                placeholder="Contoh: Budi Santoso"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
              />
            </div>

            {/* Input Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Mail size={16} className="text-blue-500" /> Email Aktif
              </label>
              <input
                required
                type="email"
                placeholder="budi@example.com"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Input Instansi */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <School size={16} className="text-blue-500" /> Asal Sekolah / Kampus
              </label>
              <input
                required
                type="text"
                placeholder="Contoh: SMKN 2 Yogyakarta"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                onChange={(e) => setFormData({...formData, instansi: e.target.value})}
              />
            </div>

            {/* Dropdown Jurusan */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <GraduationCap size={16} className="text-blue-500" /> Jurusan
              </label>
              <select
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer text-sm"
                value={formData.jurusan}
                onChange={(e) => setFormData({...formData, jurusan: e.target.value})}
              >
                <option value="" disabled>-- Pilih Jurusan Kamu --</option>
                {LIST_JURUSAN.map((j, i) => (
                  <option key={i} value={j}>{j}</option>
                ))}
              </select>
            </div>

            {/* Upload File */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <FileText size={16} className="text-blue-500" /> Berkas Pendaftaran (PDF)
              </label>
              <div className="relative">
                <input
                  required
                  type="file"
                  accept=".pdf"
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-dashed border-gray-300 p-2 rounded-xl"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">*Upload Surat Pengantar atau CV dalam format PDF (Maks 2MB)</p>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Mengirim...
                </div>
              ) : (
                <><Send size={18} /> Daftar Sekarang</>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;