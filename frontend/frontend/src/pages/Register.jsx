import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  User, School, GraduationCap, Send, CheckCircle2, FileText, 
  Mail, ArrowLeft, Sparkles, Upload, Shield, Zap, Target 
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
  const [formData, setFormData] = useState({
    nama: '',
    instansi: '',
    jurusan: '',
    email: ''
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        if (selectedFile.size <= 2 * 1024 * 1024) { // 2MB limit
          setFile(selectedFile);
          setFileName(selectedFile.name);
        } else {
          alert('File terlalu besar! Maksimal 2MB');
        }
      } else {
        alert('Hanya file PDF yang diperbolehkan');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert("Harap upload berkas PDF terlebih dahulu!");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('nama', formData.nama);
    data.append('email', formData.email);
    data.append('instansi', formData.instansi);
    data.append('jurusan', formData.jurusan);
    data.append('berkas', file);

    try {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative elements full screen */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slower"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-rotate"></div>
        </div>

        <div className="relative max-w-md w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl opacity-75 blur-xl"></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 animate-ping"></div>
              <CheckCircle2 className="relative mx-auto text-green-500" size={80} />
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Pendaftaran Berhasil!
            </h2>
            
            <p className="text-gray-600 mb-8">
              Data dan berkas kamu sudah masuk ke sistem Balai Tekkomdik DIY. 
              Tunggu update selanjutnya via email ya!
            </p>
            
            <div className="space-y-3">
              <Link
                to="/"
                className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 hover:-translate-y-1"
              >
                Kembali ke Beranda
              </Link>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 hover:-translate-y-1"
              >
                Daftar Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Decorative background elements - Full screen */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slower"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-rotate"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-40 right-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float-slow"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float-slower"></div>
      </div>

      {/* Back to home button - Fixed position */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-600 hover:text-blue-600 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-white/20"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Logo - Fixed position top right */}
      <div className="fixed top-6 right-6 z-50">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/20">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 rounded-lg blur-md opacity-50"></div>
            <img src={logo} alt="InternGate" className="relative h-8 w-auto" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Intern-Gate
          </span>
        </div>
      </div>

      {/* Main Content - Full height with flex */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header dengan badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-full px-6 py-3 shadow-lg">
              <Sparkles className="w-5 h-5 text-blue-600 animate-spin-slow" />
              <span className="text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Pendaftaran Magang Balai Tekkomdik DIY
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Main card - Full width with larger size */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl opacity-75 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
            
            {/* Content */}
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
              <div className="grid md:grid-cols-2 min-h-[700px]">
                {/* Left sidebar - Info dengan background penuh */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-10 text-white flex flex-col h-full">
                  <div>
                    <h2 className="text-4xl font-bold mb-4">Gabung Magang!</h2>
                    <p className="text-blue-100 text-base leading-relaxed mb-8">
                      Daftarkan dirimu untuk pengalaman magang seru di Balai Tekkomdik DIY. 
                      Kembangkan skill dan dapatkan pengalaman kerja nyata bersama para ahli.
                    </p>
                  </div>
                  
                  <div className="space-y-5 flex-1">
                    <h3 className="text-lg font-semibold text-white/90 mb-3">Mengapa Bergabung?</h3>
                    <div className="flex items-start gap-4">
                      <div className="bg-white/20 rounded-xl p-3 shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Proses Cepat & Transparan</p>
                        <p className="text-sm text-blue-100">Registrasi online dan seleksi yang jelas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-white/20 rounded-xl p-3 shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Sesuai Minat & Bakat</p>
                        <p className="text-sm text-blue-100">Pilih jurusan yang sesuai dengan passionmu</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-white/20 rounded-xl p-3 shrink-0">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Data Terjamin Keamanannya</p>
                        <p className="text-sm text-blue-100">Informasi pribadi aman dan terproteksi</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/20">
                    <p className="text-sm text-blue-100">
                      <span className="font-semibold text-white text-base">Persyaratan Dokumen:</span>
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-blue-100">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        Surat Pengantar dari sekolah/kampus
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        Curriculum Vitae (CV) terbaru
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        Format PDF, maksimal 2MB
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        Email aktif untuk konfirmasi
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right side - Form dengan scroll jika diperlukan */}
                <div className="p-10 overflow-y-auto max-h-[700px]">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nama */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        Nama Lengkap
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Contoh: Budi Santoso"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                        value={formData.nama}
                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        Email Aktif
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="budi@example.com"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    {/* Instansi */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <School className="w-4 h-4 text-blue-600" />
                        Asal Sekolah / Kampus
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Contoh: SMKN 2 Yogyakarta"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                        value={formData.instansi}
                        onChange={(e) => setFormData({...formData, instansi: e.target.value})}
                      />
                    </div>

                    {/* Jurusan Dropdown */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        Jurusan
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                        value={formData.jurusan}
                        onChange={(e) => setFormData({...formData, jurusan: e.target.value})}
                      >
                        <option value="" disabled>-- Pilih Jurusan Kamu --</option>
                        {LIST_JURUSAN.map((j, i) => (
                          <option key={i} value={j}>{j}</option>
                        ))}
                      </select>
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Berkas Pendaftaran (PDF)
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex items-center justify-between w-full px-4 py-3.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-600">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">
                              {fileName || 'Pilih file PDF...'}
                            </span>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            Max 2MB
                          </span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        *Upload Surat Pengantar atau CV dalam format PDF
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-600/25 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-base"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Mengirim...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Daftar Sekarang</span>
                        </>
                      )}
                    </button>

                    {/* Additional info */}
                    <p className="text-xs text-center text-gray-400">
                      Dengan mendaftar, Anda menyetujui ketentuan dan kebijakan privasi kami
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        
        @keyframes rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        
        .animate-rotate {
          animation: rotate 20s linear infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Register;