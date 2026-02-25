import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  User, School, GraduationCap, Send, CheckCircle2,
  Mail, ArrowLeft, Sparkles, Upload, Phone, Shield, Zap, Edit3,
  ChevronDown, Award
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
  .animate-float-slow   { animation: float-slow 6s ease-in-out infinite; }
  .animate-pulse-slow   { animation: pulse-slow 4s ease-in-out infinite; }
  .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
  .animate-rotate       { animation: rotate 20s linear infinite; }
  .animate-gradient     { background-size: 200% 200%; animation: gradient 4s ease infinite; }
  .animate-spin-slow    { animation: spin-slow 3s linear infinite; }
  .animate-slide-up     { animation: slide-up 0.55s ease forwards; }
  .animate-slide-down   { animation: slide-down 0.3s ease forwards; }
  .animate-success-pop  { animation: success-pop 0.5s cubic-bezier(.175,.885,.32,1.275) forwards; }

  .delay-100 { animation-delay: 0.1s; opacity: 0; }
  .delay-200 { animation-delay: 0.2s; opacity: 0; }
  .delay-300 { animation-delay: 0.3s; opacity: 0; }
  .delay-400 { animation-delay: 0.4s; opacity: 0; }
  .delay-500 { animation-delay: 0.5s; opacity: 0; }
  .delay-600 { animation-delay: 0.6s; opacity: 0; }

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
    padding: 13px 16px 13px 46px;
    background: rgba(249,250,251,0.9);
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    transition: all 0.25s;
    outline: none;
    backdrop-filter: blur(4px);
  }
  .input-base::placeholder { color: #9ca3af; font-weight: 400; }
  .input-base:focus {
    border-color: #6366f1;
    background: white;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 4px 12px rgba(99,102,241,0.08);
  }
  .input-base:hover:not(:focus) { border-color: #c7d2fe; background: white; }

  .hero-gradient-text {
    background-image: linear-gradient(90deg, #93c5fd, #c4b5fd, #f9a8d4);
    background-size: 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradient 4s ease infinite;
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
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    class P {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.r = Math.random() * 1.8 + 0.4;
        this.vx = Math.random() * 1.2 - 0.6;
        this.vy = Math.random() * 1.2 - 0.6;
        this.o = Math.random() * 0.2 + 0.05;
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
        ctx.fillStyle = `rgba(147,197,253,${this.o})`;
        ctx.fill();
      }
    }
    resize();
    pts = Array.from({ length: 60 }, () => new P());
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
            ctx.strokeStyle = `rgba(147,197,253,${0.06 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
};

// ================ FORM FIELD ================
const Field = ({ label, icon: Icon, children, req }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {label}{req && <span className="text-indigo-400">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={17} />
      {children}
    </div>
  </div>
);

// ================ SUCCESS SCREEN ================
const SuccessScreen = () => (
  <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 40%, #6b21a8 100%)' }}>
    <ParticleCanvas />
    <div className="fixed inset-0 bg-grid-pattern pointer-events-none" style={{ zIndex: 1 }} />
    <div className="relative z-10 max-w-md w-full animate-slide-up">
      <div className="absolute -inset-4 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-teal-400/20 rounded-3xl blur-2xl" />
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
        <div className="p-10 text-center space-y-6">
          <div className="flex justify-center animate-success-pop">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-40 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                <CheckCircle2 className="text-white" size={48} />
              </div>
            </div>
          </div>
          <div className="animate-slide-up delay-200">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Pendaftaran Terkirim!
            </h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              Data Anda sudah aman di sistem kami. Pantau WhatsApp Anda untuk informasi akun login. Terima kasih!
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 animate-slide-up delay-300">
            {[{ icon: Shield, label: 'Data Aman', sub: 'Terenkripsi SSL' }, { icon: Phone, label: 'Notifikasi WA', sub: 'Dalam 1×24 jam' }]
              .map(({ icon: I, label, sub }) => (
                <div key={label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <I className="text-blue-500 mb-2" size={20} />
                  <p className="font-bold text-gray-800 text-sm">{label}</p>
                  <p className="text-gray-400 text-xs">{sub}</p>
                </div>
              ))}
          </div>
          <Link to="/" className="animate-slide-up delay-400 group inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
            <span className="relative z-10">Kembali ke Beranda</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>
      </div>
    </div>
    <style jsx>{animationStyles}</style>
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
  const [formData, setFormData] = useState({ nama: '', instansi: '', jurusan: '', email: '', nomor_wa: '' });

  const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf' && f.size <= 2 * 1024 * 1024) { setFile(f); setFileName(f.name); }
    else alert('File harus PDF dan maksimal 2MB');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Harap upload berkas PDF!');
    const finalJurusan = formData.jurusan === 'Lainnya' ? jurusanLainnya : formData.jurusan;
    if (!finalJurusan) return alert('Harap isi nama jurusan Anda!');
    setLoading(true);
    const data = new FormData();
    Object.entries({ ...formData, jurusan: finalJurusan }).forEach(([k, v]) => data.append(k, v));
    data.append('berkas', file);
    try {
      await api.post('/admin/submit', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim pendaftaran!');
    } finally { setLoading(false); }
  };

  if (submitted) return <SuccessScreen />;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 45%, #6b21a8 100%)' }}>
      <style jsx>{animationStyles}</style>
      <ParticleCanvas />

      {/* ── BG DECORATION ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 bg-grid-pattern" />
        {/* Orb kiri atas */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)' }} />
        {/* Orb kanan bawah */}
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)' }} />
      </div>

      {/* ── FULLSCREEN SPLIT LAYOUT ── */}
      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1fr_580px] xl:grid-cols-[1fr_640px]">

        {/* ════════════════════════════
            LEFT — Branding / Info
            ════════════════════════════ */}
        <div className="hidden lg:flex flex-col justify-between px-14 xl:px-20 py-12">
          {/* Logo + Back button */}
          <div className="flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-md" />
                <div className="relative bg-white/15 backdrop-blur-sm p-2.5 rounded-xl border border-white/20">
                  <img src={logo} alt="InternGate" className="h-9 w-auto" />
                </div>
              </div>
              <span className="font-black text-2xl text-white tracking-tight">Intern-Gate</span>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-4 py-2 rounded-xl border border-white/20 text-sm font-medium transition-all duration-300 hover:-translate-x-0.5"
            >
              <ArrowLeft size={15} />
              Kembali
            </Link>
          </div>

          {/* Center content */}
          <div className="space-y-10">
            {/* Badge */}
            <div className="animate-slide-up delay-100">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6 border border-white/15">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
                <span className="text-sm font-bold text-white/80 uppercase tracking-wider">Pendaftaran Magang 2025</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.08] mb-5">
                Mulai Karir<br />
                <span className="hero-gradient-text">Profesional</span><br />
                Anda Sekarang
              </h1>
              <p className="text-blue-200/80 text-base xl:text-lg leading-relaxed max-w-sm">
                Bergabung dengan program magang Balai Tekkomdik DIY dan dapatkan pengalaman kerja nyata di dunia teknologi pendidikan.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 animate-slide-up delay-200">
              {[
                { icon: Shield, title: 'Data Aman & Terproteksi', desc: 'Enkripsi SSL end-to-end', grad: 'from-blue-400 to-cyan-500' },
                { icon: Zap,    title: 'Notifikasi Via WhatsApp',  desc: 'Akun dikirim dalam 1×24 jam', grad: 'from-yellow-400 to-orange-500' },
                { icon: Award,  title: 'Sertifikat Resmi',         desc: 'Berstandar industri & diakui', grad: 'from-purple-400 to-pink-500' },
              ].map(({ icon: I, title, desc, grad }) => (
                <div key={title} className="flex items-center gap-4 group cursor-default">
                  <div className={`bg-gradient-to-br ${grad} p-3 rounded-xl shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <I className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{title}</p>
                    <p className="text-blue-300/70 text-xs">{desc}</p>
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
                      <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs font-black text-white shrink-0">
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
            <span className="text-white/35 text-xs">Yogyakarta, Daerah Istimewa Yogyakarta</span>
          </div>
        </div>

        {/* ════════════════════════════
            RIGHT — Form Panel (full height)
            ════════════════════════════ */}
        <div className="flex flex-col bg-white min-h-screen shadow-2xl shadow-black/30">
          {/* Accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 shrink-0 animate-gradient" />

          <div className="flex-1 overflow-y-auto px-8 xl:px-12 pt-16 lg:pt-10 pb-10">

            {/* Header */}
            <div className="mb-8 animate-slide-up">
              {/* Mobile logo + back button */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="InternGate" className="h-8 w-auto" />
                  <span className="font-black text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Intern-Gate</span>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  <ArrowLeft size={14} />
                  Kembali
                </Link>
              </div>
              <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Formulir Pendaftaran</p>
              <h2 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-1">Daftarkan Diri Anda</h2>
              <p className="text-gray-400 text-sm">Lengkapi data di bawah ini untuk bergabung dalam program magang.</p>
              <div className="mt-3 h-1 w-10 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nama + WA */}
              <div className="grid sm:grid-cols-2 gap-4 animate-slide-up delay-100">
                <Field label="Nama Lengkap" icon={User} req>
                  <input required type="text" placeholder="Nama lengkap Anda" className="input-base"
                    value={formData.nama} onChange={set('nama')} />
                </Field>
                <Field label="Nomor WhatsApp" icon={Phone} req>
                  <span className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold pointer-events-none select-none z-10">+62</span>
                  <input required type="tel" placeholder="8123xxx" className="input-base" style={{ paddingLeft: '68px' }}
                    value={formData.nomor_wa} onChange={set('nomor_wa')} />
                </Field>
              </div>

              {/* Email */}
              <div className="animate-slide-up delay-200">
                <Field label="Email Aktif" icon={Mail} req>
                  <input required type="email" placeholder="email@contoh.com" className="input-base"
                    value={formData.email} onChange={set('email')} />
                </Field>
              </div>

              {/* Instansi */}
              <div className="animate-slide-up delay-200">
                <Field label="Asal Instansi" icon={School} req>
                  <input required type="text" placeholder="Nama Sekolah / Universitas" className="input-base"
                    value={formData.instansi} onChange={set('instansi')} />
                </Field>
              </div>

              {/* Jurusan */}
              <div className="animate-slide-up delay-300">
                <Field label="Jurusan / Program Studi" icon={GraduationCap} req>
                  <div className="relative">
                    <select required className="input-base appearance-none cursor-pointer pr-10"
                      value={formData.jurusan} onChange={set('jurusan')}>
                      <option value="" disabled>Pilih Jurusan</option>
                      {LIST_JURUSAN.map((j, i) => <option key={i} value={j}>{j}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </Field>
              </div>

              {/* Manual jurusan */}
              {formData.jurusan === 'Lainnya' && (
                <div className="animate-slide-down">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">
                      Sebutkan Nama Jurusan *
                    </label>
                    <div className="relative">
                      <Edit3 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" size={16} />
                      <input required type="text" placeholder="Masukkan nama jurusan secara manual"
                        className="input-base border-indigo-200 focus:border-indigo-500"
                        value={jurusanLainnya} onChange={(e) => setJurusanLainnya(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* File upload */}
              <div className="animate-slide-up delay-400">
                <label className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Berkas Pendaftaran (PDF) <span className="text-indigo-500">*</span>
                </label>
                <input type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files[0])} className="hidden" id="file-upload" />
                <label
                  htmlFor="file-upload"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  className={`flex items-center gap-4 w-full px-5 py-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                    file ? 'bg-green-50 border-green-300 hover:bg-green-100'
                    : dragOver ? 'bg-indigo-100 border-indigo-400 scale-[1.01]'
                    : 'bg-gray-50 border-gray-200 hover:bg-indigo-50/50 hover:border-indigo-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${file ? 'bg-green-100' : 'bg-indigo-100'}`}>
                    {file ? <CheckCircle2 className="text-green-600" size={20} /> : <Upload className="text-indigo-600" size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${file ? 'text-green-700' : 'text-gray-600'}`}>
                      {fileName || 'Upload CV / Surat Pengantar'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {file ? 'File siap · Klik untuk ganti' : 'Drag & drop atau klik · PDF, maks. 2MB'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full shrink-0 ${file ? 'bg-green-100 text-green-600' : 'bg-white text-indigo-500 shadow-sm border border-gray-100'}`}>
                    {file ? 'PDF ✓' : 'PDF'}
                  </span>
                </label>
              </div>

              <div className="border-t border-gray-100" />

              {/* Submit */}
              <div className="animate-slide-up delay-500">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-sm font-bold text-white overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-indigo-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1, #7c3aed)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 relative z-10" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span className="relative z-10">Mengirim Pendaftaran...</span>
                    </>
                  ) : (
                    <>
                      <Send size={17} className="relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      <span className="relative z-10">Kirim Pendaftaran</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 animate-slide-up delay-600">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-75 transition-opacity">
                  Masuk di sini
                </Link>
              </p>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
