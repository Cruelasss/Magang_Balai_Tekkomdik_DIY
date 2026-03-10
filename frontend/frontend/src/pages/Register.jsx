import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  User, School, GraduationCap, Send, CheckCircle2,
  Mail, ArrowLeft, Sparkles, Upload, Phone, Shield, Zap, Edit3,
  ChevronDown, Rocket, Sun, Menu, X, Download, FileText,
  AlertCircle, Info, CheckCircle, Clock, Users, Briefcase
} from 'lucide-react';
import logo from '../assets/logo.svg';

// ================ CONSTANTS ================
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

// ================ ANIMATION STYLES ================
const animationStyles = `
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-14px); }
  }
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  @keyframes pulse-slower {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.1); }
  }
  @keyframes rotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes gradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide-down {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes success-pop {
    0%   { transform: scale(0.5); opacity: 0; }
    70%  { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  
  .animate-float-slow   { animation: float-slow 6s ease-in-out infinite; }
  .animate-pulse-slow   { animation: pulse-slow 4s ease-in-out infinite; }
  .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
  .animate-rotate       { animation: rotate 20s linear infinite; }
  .animate-gradient     { background-size: 200% 200%; animation: gradient 4s ease infinite; }
  .animate-spin-slow    { animation: spin-slow 3s linear infinite; }
  .animate-slide-up     { animation: slide-up 0.55s ease forwards; }
  .animate-slide-down   { animation: slide-down 0.3s ease forwards; }
  .animate-success-pop  { animation: success-pop 0.5s cubic-bezier(.175,.885,.32,1.275) forwards; }
  .animate-shimmer      { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); background-size: 1000px 100%; animation: shimmer 2s infinite; }

  .delay-100 { animation-delay: 0.1s; opacity: 0; fill-mode: forwards; }
  .delay-200 { animation-delay: 0.2s; opacity: 0; fill-mode: forwards; }
  .delay-300 { animation-delay: 0.3s; opacity: 0; fill-mode: forwards; }
  .delay-400 { animation-delay: 0.4s; opacity: 0; fill-mode: forwards; }
  .delay-500 { animation-delay: 0.5s; opacity: 0; fill-mode: forwards; }
  .delay-600 { animation-delay: 0.6s; opacity: 0; fill-mode: forwards; }

  .hero-gradient-text {
    background-image: linear-gradient(90deg, #93c5fd, #c4b5fd, #f9a8d4);
    background-size: 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradient 4s ease infinite;
  }

  .bg-grid-pattern {
    background-image: linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px);
    background-size: 28px 28px;
  }
  
  .input-base {
    width: 100%;
    padding: 14px 16px 14px 48px;
    background: white;
    border: 1.5px solid #e5e7eb;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 500;
    color: #1f2937;
    transition: all 0.25s;
    outline: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .input-base::placeholder { 
    color: #9ca3af; 
    font-weight: 400; 
    font-size: 14px; 
  }
  .input-base:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99,102,241,0.1), 0 4px 12px rgba(99,102,241,0.1);
  }
  .input-base:hover:not(:focus) { 
    border-color: #c7d2fe; 
  }

  /* Hide scrollbar for mobile */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* Custom styles for better visibility */
  .field-icon {
    color: #6366f1;
    opacity: 0.8;
  }
  
  .select-arrow {
    color: #9ca3af;
  }
  
  .tooltip-icon {
    color: #9ca3af;
    transition: color 0.2s;
  }
  .tooltip-icon:hover {
    color: #6366f1;
  }
`;

// ================ PARTICLE CANVAS ================
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let pts = [];
    const resize = () => { 
      canvas.width = window.innerWidth; 
      canvas.height = window.innerHeight; 
    };
    
    class P {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.r = Math.random() * 2 + 0.5;
        this.vx = Math.random() * 1.2 - 0.6;
        this.vy = Math.random() * 1.2 - 0.6;
        this.o = Math.random() * 0.25 + 0.1;
      }
      step() {
        this.x += this.vx; this.y += this.vy;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${this.o})`;
        ctx.fill();
      }
    }
    
    resize();
    pts = Array.from({ length: 40 }, () => new P());
    
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => { p.step(); p.draw(); });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      raf = requestAnimationFrame(loop);
    };
    loop();
    
    window.addEventListener('resize', resize);
    return () => { 
      window.removeEventListener('resize', resize); 
      cancelAnimationFrame(raf); 
    };
  }, []);
  
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
};

// ================ FORM FIELD ================
const Field = ({ label, icon: Icon, children, req, tooltip }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-indigo-500" strokeWidth={2} />
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {req && <span className="text-red-500 ml-1">*</span>}
      </label>
      {tooltip && (
        <div className="group relative ml-auto">
          <Info className="w-4 h-4 text-gray-400 hover:text-indigo-500 transition-colors cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-xl">
            {tooltip}
            <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
    <div className="relative">
      {children}
    </div>
  </div>
);

// ================ SUCCESS SCREEN ================
const SuccessScreen = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden" 
         style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 40%, #6b21a8 100%)' }}>
      <ParticleCanvas />
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none" style={{ zIndex: 1 }} />
      
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="absolute -inset-4 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-teal-400/20 rounded-3xl blur-2xl" />
        
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/40 shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 animate-gradient" />
          
          <div className="p-6 sm:p-10 text-center space-y-5 sm:space-y-6">
            {/* Success icon with animation */}
            <div className="flex justify-center animate-success-pop">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-40 animate-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="text-white" size={isMobile ? 40 : 48} strokeWidth={1.5} />
                </div>
              </div>
            </div>
            
            {/* Text content */}
            <div className="space-y-2 animate-slide-up delay-200">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Pendaftaran Terkirim!
              </h2>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                Pantau WhatsApp Anda untuk informasi selanjutnya. Terima kasih telah mendaftar!
              </p>
            </div>
            
            {/* Info cards - stacked on mobile */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 animate-slide-up delay-300">
              {[
                { icon: Shield, label: 'Data Aman', sub: 'Terenkripsi SSL', color: 'blue' },
                { icon: Phone, label: 'Notifikasi WA', sub: '1×24 jam', color: 'green' },
                { icon: Clock, label: 'Proses Cepat', sub: 'Maks. 3 hari', color: 'purple' },
                { icon: FileText, label: 'Berkas Tersimpan', sub: 'Aman di server', color: 'orange' }
              ].map(({ icon: I, label, sub, color }) => (
                <div key={label} className={`bg-gradient-to-br from-${color}-50 to-${color}-100/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-${color}-200`}>
                  <I className={`text-${color}-600 mb-1.5 sm:mb-2`} size={isMobile ? 16 : 20} strokeWidth={1.8} />
                  <p className="font-bold text-gray-800 text-xs sm:text-sm">{label}</p>
                  <p className="text-gray-500 text-[10px] sm:text-xs">{sub}</p>
                </div>
              ))}
            </div>
            
            {/* Back button */}
            <Link 
              to="/" 
              className="animate-slide-up delay-400 group inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <ArrowLeft size={16} />
                Kembali ke Beranda
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx>{animationStyles}</style>
    </div>
  );
};

// ================ MOBILE BOTTOM NAV ================
const MobileBottomNav = () => (
  <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 py-2 px-4 lg:hidden z-50">
    <div className="flex justify-around items-center">
      <Link to="/" className="flex flex-col items-center p-2 text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={20} />
        <span className="text-[10px] mt-1 font-medium">Kembali</span>
      </Link>
      <a href="#form" className="flex flex-col items-center p-2 text-gray-500 hover:text-indigo-600 transition-colors">
        <FileText size={20} />
        <span className="text-[10px] mt-1 font-medium">Form</span>
      </a>
      <a href="#info" className="flex flex-col items-center p-2 text-gray-500 hover:text-indigo-600 transition-colors">
        <Info size={20} />
        <span className="text-[10px] mt-1 font-medium">Info</span>
      </a>
    </div>
  </div>
);

// ================ MAIN COMPONENT ================
const Register = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [jurusanLainnya, setJurusanLainnya] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({ 
    nama: '', 
    instansi: '', 
    jurusan: '', 
    email: '', 
    nomor_wa: '' 
  });

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const set = (key) => (e) => {
    setFormData(prev => ({ ...prev, [key]: e.target.value }));
    // Clear error for this field
    if (formErrors[key]) {
      setFormErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const handleFile = (f) => {
    if (!f) return;
    
    if (f.type !== 'application/pdf') {
      alert('File harus berformat PDF');
      return;
    }
    
    if (f.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }
    
    setFile(f);
    setFileName(f.name);
    if (formErrors.file) {
      setFormErrors(prev => ({ ...prev, file: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nama.trim()) errors.nama = 'Nama lengkap harus diisi';
    if (!formData.nomor_wa.trim()) errors.nomor_wa = 'Nomor WhatsApp harus diisi';
    else if (!/^[0-9]{10,13}$/.test(formData.nomor_wa)) errors.nomor_wa = 'Nomor tidak valid (10-13 digit)';
    
    if (!formData.email.trim()) errors.email = 'Email harus diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Format email tidak valid';
    
    if (!formData.instansi.trim()) errors.instansi = 'Instansi harus diisi';
    if (!formData.jurusan) errors.jurusan = 'Pilih jurusan Anda';
    if (formData.jurusan === 'Lainnya' && !jurusanLainnya.trim()) {
      errors.jurusanLainnya = 'Nama jurusan harus diisi';
    }
    if (!file) errors.file = 'Upload berkas pendaftaran (PDF)';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[class*="border-red"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setLoading(true);
    
    const finalJurusan = formData.jurusan === 'Lainnya' ? jurusanLainnya : formData.jurusan;
    const data = new FormData();
    
    Object.entries({ ...formData, jurusan: finalJurusan }).forEach(([k, v]) => data.append(k, v));
    data.append('berkas', file);
    
    try {
      await api.post('/admin/submit', data, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim pendaftaran!');
    } finally { 
      setLoading(false); 
    }
  };

  if (submitted) return <SuccessScreen />;

  return (
    <div className="relative min-h-screen overflow-hidden" 
         style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 45%, #6b21a8 100%)' }}>
      <style jsx>{animationStyles}</style>
      <ParticleCanvas />

      {/* Mobile menu overlay */}
      {showMobileMenu && isMobile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" 
             onClick={() => setShowMobileMenu(false)} />
      )}

      {/* ── BG DECORATION ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 bg-grid-pattern" />
        {/* Orb kiri atas */}
        <div className="absolute -top-40 -left-40 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)' }} />
        {/* Orb kanan bawah */}
        <div className="absolute -bottom-40 -right-40 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full animate-pulse-slow"
             style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)' }} />
      </div>

      {/* ── FULLSCREEN SPLIT LAYOUT ── */}
      <div className="relative z-10 min-h-screen flex flex-col lg:grid lg:grid-cols-[1fr_580px] xl:grid-cols-[1fr_640px]">

        {/* ════════════════════════════
            LEFT — Branding / Info (hidden on mobile)
            ════════════════════════════ */}
        <div className="hidden lg:flex flex-col justify-between px-14 xl:px-20 py-12">
          {/* Logo + Back button */}
          <div className="flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-md" />
                <div className="relative bg-white/15 backdrop-blur-sm p-2.5 rounded-xl border border-white/20">
                  <img src={logo} alt="InternGate" className="h-10 w-auto" />
                </div>
              </div>
              <span className="font-black text-2xl text-white tracking-tight">Intern-Gate</span>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-4 py-2.5 rounded-xl border border-white/20 text-sm font-medium transition-all duration-300 hover:-translate-x-0.5"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>
          </div>

          {/* Center content */}
          <div className="space-y-10">
            {/* Badge */}
            <div className="animate-slide-up delay-100">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6 border border-white/15">
                <Sun className="w-4 h-4 text-yellow-300 animate-spin-slow" />
                <span className="text-sm font-bold text-white/80 uppercase tracking-wider">Pendaftaran Magang</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.08] mb-5">
                Ayo Bergabung<br />
                <span className="hero-gradient-text">Sekarang</span><br />
                Andalkan Potensimu!
              </h1>
              <p className="text-blue-200/80 text-base xl:text-lg leading-relaxed max-w-sm">
                Bergabung dengan program magang Balai Tekkomdik DIY dan dapatkan pengalaman kerja nyata di dunia teknologi pendidikan.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 animate-slide-up delay-200">
              {[
                { icon: Users, title: '100+ Peserta', desc: 'Telah bergabung', grad: 'from-blue-400 to-indigo-500' },
                { icon: Zap, title: 'Notifikasi Via WhatsApp', desc: 'Update status langsung ke HP', grad: 'from-yellow-400 to-orange-500' },
                { icon: Briefcase, title: 'Pengalaman Berharga', desc: 'Portofolio & sertifikat resmi', grad: 'from-purple-400 to-pink-500' },
              ].map(({ icon: I, title, desc, grad }) => (
                <div key={title} className="flex items-center gap-4 group cursor-default">
                  <div className={`bg-gradient-to-br ${grad} p-3.5 rounded-xl shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <I className="text-white" size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">{title}</p>
                    <p className="text-blue-300/70 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="animate-slide-up delay-300">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Alur Pendaftaran</p>
              <div className="flex items-center gap-3">
                {['Isi Formulir', 'Upload Berkas', 'Konfirmasi WA'].map((s, i) => (
                  <React.Fragment key={s}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs font-black text-white shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-xs text-white/60 font-semibold whitespace-nowrap">{s}</span>
                    </div>
                    {i < 2 && <div className="flex-1 h-px bg-white/15" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Jogja identity */}
          <div className="animate-slide-up delay-400">
            <span className="text-white/35 text-sm">Yogyakarta, Daerah Istimewa Yogyakarta</span>
          </div>
        </div>

        {/* ════════════════════════════
            RIGHT — Form Panel (full height)
            ════════════════════════════ */}
        <div className="flex flex-col bg-white min-h-screen shadow-2xl shadow-black/30 lg:rounded-l-3xl overflow-hidden">
          {/* Accent bar */}
          <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 shrink-0 animate-gradient" />

          <div className="flex-1 overflow-y-auto no-scrollbar px-5 sm:px-8 xl:px-12 pt-6 lg:pt-10 pb-24 lg:pb-10">
            
            {/* Header - Mobile version */}
            <div className="mb-8 lg:mb-10 animate-slide-up">
              {/* Mobile logo + back button */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-100 rounded-xl blur-md" />
                    <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 p-2 rounded-xl border border-indigo-100">
                      <img src={logo} alt="InternGate" className="h-8 w-auto" />
                    </div>
                  </div>
                  <div>
                    <span className="font-black text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Intern-Gate
                    </span>
                    <p className="text-[10px] text-gray-500 mt-0.5">Pendaftaran Magang</p>
                  </div>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  <ArrowLeft size={15} />
                  <span className="hidden xs:inline">Kembali</span>
                </Link>
              </div>
              
              {/* Title */}
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Formulir Pendaftaran</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Daftarkan Diri Anda</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Lengkapi data di bawah ini untuk bergabung dalam program magang. Pastikan data yang Anda masukkan sudah benar.
                </p>
              </div>
              <div className="mt-4 h-1 w-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" id="form">

              {/* Nama + WA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-slide-up delay-100">
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <User className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      required 
                      type="text" 
                      placeholder="Masukkan nama lengkap" 
                      className={`w-full px-4 py-3.5 border ${formErrors.nama ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400`}
                      value={formData.nama} 
                      onChange={set('nama')} 
                    />
                  </div>
                  {formErrors.nama && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>{formErrors.nama}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Phone className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 text-sm font-medium z-10">
                      +62
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      placeholder="81234567890"
                      value={formData.nomor_wa}
                      onChange={set('nomor_wa')}
                      className={`w-full pl-[70px] pr-4 py-3.5 border ${formErrors.nomor_wa ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400`}
                    />
                  </div>
                  {formErrors.nomor_wa ? (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>{formErrors.nomor_wa}</span>
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs mt-1.5 ml-1">
                      Contoh: 81234567890 (tanpa angka 0 di depan)
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1 animate-slide-up delay-150">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Mail className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                  Email Aktif <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    required 
                    type="email" 
                    placeholder="nama@email.com" 
                    className={`w-full px-4 py-3.5 border ${formErrors.email ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400`}
                    value={formData.email} 
                    onChange={set('email')} 
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{formErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Instansi */}
              <div className="space-y-1 animate-slide-up delay-200">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <School className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                  Asal Instansi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    required 
                    type="text" 
                    placeholder="Nama Sekolah / Universitas" 
                    className={`w-full px-4 py-3.5 border ${formErrors.instansi ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400`}
                    value={formData.instansi} 
                    onChange={set('instansi')} 
                  />
                </div>
                {formErrors.instansi && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{formErrors.instansi}</span>
                  </p>
                )}
              </div>

              {/* Jurusan */}
              <div className="space-y-1 animate-slide-up delay-250">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <GraduationCap className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                  Jurusan / Program Studi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    required 
                    className={`w-full px-4 py-3.5 border ${formErrors.jurusan ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 outline-none text-gray-700 appearance-none cursor-pointer bg-white`}
                    value={formData.jurusan} 
                    onChange={set('jurusan')}
                  >
                    <option value="" disabled className="text-gray-400">Pilih Jurusan</option>
                    {LIST_JURUSAN.map((j, i) => (
                      <option key={i} value={j} className="py-2 text-gray-700">{j}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
                
                {/* Note untuk jurusan lainnya */}
                <div className="mt-2 flex items-start gap-2 text-xs">
                  <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-gray-500 leading-relaxed">
                    Tidak menemukan jurusan Anda? Pilih <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">"Lainnya"</span> dan tulis manual
                  </p>
                </div>
                
                {formErrors.jurusan && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{formErrors.jurusan}</span>
                  </p>
                )}
              </div>

              {/* Manual jurusan */}
              {formData.jurusan === 'Lainnya' && (
                <div className="animate-slide-down mt-4">
                  <div className={`bg-indigo-50/50 border ${formErrors.jurusanLainnya ? 'border-red-300' : 'border-indigo-200'} rounded-xl p-5`}>
                    <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
                      <Edit3 size={14} className="text-indigo-500" />
                      Sebutkan Nama Jurusan <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Contoh: Teknik Biomedis, DKV, dll" 
                      className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
                      value={jurusanLainnya} 
                      onChange={(e) => {
                        setJurusanLainnya(e.target.value);
                        if (formErrors.jurusanLainnya) {
                          setFormErrors(prev => ({ ...prev, jurusanLainnya: null }));
                        }
                      }} 
                    />
                    {formErrors.jurusanLainnya && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{formErrors.jurusanLainnya}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* File upload */}
              <div className="space-y-2 animate-slide-up delay-300">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                    Berkas Pendaftaran <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">PDF, Maks. 2MB</span>
                </div>
                
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => handleFile(e.target.files[0])} 
                  className="hidden" 
                  id="file-upload" 
                />
                
                <label
                  htmlFor="file-upload"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  className={`flex flex-col sm:flex-row items-center gap-4 w-full px-5 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                    file ? 'bg-green-50 border-green-300' :
                    dragOver ? 'bg-indigo-50 border-indigo-400 scale-[1.02]' :
                    formErrors.file ? 'bg-red-50 border-red-300' :
                    'bg-gray-50 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300'
                  }`}
                >
                  <div className={`p-3.5 rounded-xl ${
                    file ? 'bg-green-100' :
                    dragOver ? 'bg-indigo-200' :
                    'bg-indigo-100'
                  }`}>
                    {file ? 
                      <CheckCircle className="text-green-600" size={24} strokeWidth={2} /> : 
                      <Upload className="text-indigo-600" size={24} strokeWidth={1.8} />
                    }
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <p className={`font-semibold text-sm ${file ? 'text-green-700' : 'text-gray-700'}`}>
                      {fileName || 'Upload CV / Surat Pengantar'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {file ? 'Klik atau drag & drop untuk mengganti file' : 'Drag & drop atau klik untuk pilih file'}
                    </p>
                  </div>
                  
                  <span className={`text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap ${
                    file ? 'bg-green-100 text-green-700' : 'bg-white text-indigo-600 border border-gray-200'
                  }`}>
                    {file ? 'PDF Terpilih ✓' : 'Pilih File'}
                  </span>
                </label>
                
                {formErrors.file && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{formErrors.file}</span>
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 my-6" />

              {/* Submit */}
              <div className="animate-slide-up delay-400">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-sm font-bold text-white overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/25 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 relative z-10" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span className="relative z-10">Mengirim Pendaftaran...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      <span className="relative z-10">Kirim Pendaftaran</span>
                      <CheckCircle size={16} className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </button>
              </div>

              {/* Login link */}
              <p className="text-center text-sm text-gray-400 animate-slide-up delay-500 pt-4">
                Sudah punya akun?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>

            </form>
          </div>
        </div>

      </div>

      {/* Mobile bottom navigation */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Register;