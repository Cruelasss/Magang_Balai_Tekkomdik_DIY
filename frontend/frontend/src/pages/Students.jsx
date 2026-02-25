import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Home, BookOpen, LogOut, Upload,
  Calendar, Clock, MapPin, CheckCircle, XCircle,
  Plus, AlertCircle, ChevronRight, Bell, FileText, Image
} from 'lucide-react';
import logo from '../assets/logo.svg';

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const S = `
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulseDot {
    0%,100% { transform: scale(1); opacity:1; }
    50%     { transform: scale(1.5); opacity:0.6; }
  }
  @keyframes gradientFlow {
    0%,100% { background-position: 0% 50%; }
    50%     { background-position: 100% 50%; }
  }

  .anim-up   { animation: slideUp 0.4s ease forwards; }
  .anim-fade { animation: fadeIn 0.3s ease forwards; }
  .d1 { animation-delay:.05s; opacity:0; }
  .d2 { animation-delay:.10s; opacity:0; }
  .d3 { animation-delay:.15s; opacity:0; }
  .d4 { animation-delay:.20s; opacity:0; }

  .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }

  .gradient-bar {
    background: linear-gradient(135deg, #2563eb, #6366f1, #7c3aed);
    background-size: 200% 200%;
    animation: gradientFlow 4s ease infinite;
  }

  /* Sidebar nav item */
  .nav-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }
  .nav-btn:hover { background: rgba(99,102,241,0.08); color: #6366f1; }
  .nav-btn.active {
    background: linear-gradient(135deg, #2563eb, #6366f1);
    color: white;
    box-shadow: 0 6px 20px rgba(99,102,241,0.3);
  }

  /* Field */
  .field {
    width: 100%;
    padding: 13px 15px;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    outline: none;
    transition: all 0.2s;
  }
  .field::placeholder { color: #94a3b8; font-weight: 400; }
  .field:focus {
    border-color: #6366f1;
    background: white;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }
  .field-icon { padding-left: 40px; }

  /* Cards */
  .card {
    background: white;
    border-radius: 20px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }

  /* Bottom nav - mobile only */
  .bottom-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 100;
    background: white;
    border-top: 1px solid #f1f5f9;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
    padding: 8px 0;
    padding-bottom: max(8px, env(safe-area-inset-bottom));
  }

  @media (max-width: 1023px) {
    .bottom-nav   { display: flex; }
    .desktop-side { display: none !important; }
    .desktop-top  { display: none !important; }
    .main-wrap {
      margin-left: 0 !important;
      padding-top: 64px !important;
      padding-bottom: 88px !important;
    }
  }
  @media (min-width: 1024px) {
    .bottom-nav  { display: none !important; }
    .mobile-top  { display: none !important; }
  }

  .no-scroll::-webkit-scrollbar { display: none; }
  .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const Label = ({ children }) => (
  <label style={{ display:'block', fontSize:'10px', fontWeight:900, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px' }}>
    {children}
  </label>
);

const StatusPill = ({ status }) => {
  const m = {
    Disetujui: { bg:'#ecfdf5', color:'#065f46', dot:'#10b981' },
    Valid:     { bg:'#ecfdf5', color:'#065f46', dot:'#10b981' },
    Ditolak:   { bg:'#fef2f2', color:'#991b1b', dot:'#ef4444' },
  };
  const s = m[status] || { bg:'#fffbeb', color:'#92400e', dot:'#f59e0b' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:800, background:s.bg, color:s.color }}>
      <span style={{ width:6, height:6, borderRadius:99, background:s.dot, display:'inline-block' }} />
      {status || 'Pending'}
    </span>
  );
};

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
const Students = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [userData, setUserData] = useState({ nama:'', email:'', role:'' });

  const [tanggal, setTanggal]               = useState('');
  const [jam, setJam]                       = useState('08:00');
  const [aktivitas, setAktivitas]           = useState('');
  const [uraian_kegiatan, setUraianKegiatan]= useState('');
  const [tempat, setTempat]                 = useState('');
  const [bukti, setBukti]                   = useState(null);
  const [message, setMessage]               = useState('');
  const [messageType, setMessageType]       = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [myLogbooks, setMyLogbooks]         = useState([]);
  const [isLoadingLogs, setIsLoadingLogs]   = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      setUserData({ nama: u.nama || u.nama_lengkap || 'User', email: u.email || '', role: u.role || '' });
      if (u.role?.toLowerCase() !== 'peserta') navigate('/login');
    } else { navigate('/login'); }
  }, [navigate]);

  useEffect(() => {
    if (activeMenu === 'riwayat') fetchLogs();
  }, [activeMenu]);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try { const r = await api.get('/student/logbook'); setMyLogbooks(Array.isArray(r.data) ? r.data : []); }
    catch { setMyLogbooks([]); }
    finally { setIsLoadingLogs(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage(''); setIsSubmitting(true);
    const fd = new FormData();
    fd.append('tanggal', tanggal); fd.append('jam', jam);
    fd.append('aktivitas', aktivitas); fd.append('uraian_kegiatan', uraian_kegiatan);
    fd.append('tempat', tempat);
    if (bukti) fd.append('bukti', bukti);
    try {
      await api.post('/student/logbook', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Laporan berhasil disimpan!'); setMessageType('success');
      setTanggal(''); setJam('08:00'); setAktivitas(''); setUraianKegiatan(''); setTempat(''); setBukti(null);
      setTimeout(() => { setActiveMenu('riwayat'); setMessage(''); }, 1400);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal menyimpan laporan.'); setMessageType('error');
    } finally { setIsSubmitting(false); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

  const initials = userData.nama.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() || 'U';
  const firstName = userData.nama.split(' ')[0];

  // ─── NAV ITEMS ─────────────────────────────
  const NAVS = [
    { id:'dashboard', label:'Beranda', icon: Home },
    { id:'tambah',    label:'Tambah',  icon: Plus },
    { id:'riwayat',   label:'Riwayat', icon: BookOpen },
  ];

  // ─── PAGES ─────────────────────────────────
  const Dashboard = () => (
    <div className="anim-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Welcome hero */}
      <div className="anim-up" style={{
        position:'relative', borderRadius:24, overflow:'hidden', padding:'28px 24px', color:'white',
        background:'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 55%, #7c3aed 100%)'
      }}>
        {/* Grid texture */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize:'24px 24px', pointerEvents:'none' }} />
        {/* Decorative circles */}
        <div style={{ position:'absolute', right:-24, top:-24, width:100, height:100, background:'rgba(255,255,255,0.08)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', right:20, bottom:-32, width:70, height:70, background:'rgba(255,255,255,0.05)', borderRadius:'50%' }} />

        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span className="pulse-dot" style={{ width:8, height:8, background:'#4ade80', borderRadius:'50%', display:'inline-block' }} />
            <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Sesi Aktif</span>
          </div>
          <h2 style={{ fontSize:24, fontWeight:900, lineHeight:1.2, margin:'0 0 6px' }}>Halo, {firstName}! </h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', margin:0 }}>Selamat datang di dashboard magang Anda.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="anim-up d1" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[
          { label:'Total Laporan', value: myLogbooks.length || 0, icon: FileText, iconColor:'#3b82f6', iconBg:'#eff6ff' },
          { label:'Disetujui',     value: myLogbooks.filter(l => l.status_validasi === 'Disetujui' || l.status_validasi === 'Valid').length || 0, icon: CheckCircle, iconColor:'#10b981', iconBg:'#ecfdf5' },
        ].map(({ label, value, icon:I, iconColor, iconBg }) => (
          <div key={label} className="card" style={{ padding:'18px 16px' }}>
            <div style={{ width:40, height:40, background:iconBg, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
              <I size={20} color={iconColor} />
            </div>
            <div style={{ fontSize:28, fontWeight:900, color:'#0f172a', lineHeight:1 }}>{value}</div>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="card anim-up d2" style={{ padding:'18px 20px', display:'flex', alignItems:'flex-start', gap:14 }}>
        <div style={{ width:40, height:40, background:'#eef2ff', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Bell size={18} color="#6366f1" />
        </div>
        <div>
          <p style={{ fontSize:13, fontWeight:800, color:'#1e293b', margin:'0 0 4px' }}>Info Verifikasi</p>
          <p style={{ fontSize:12, color:'#64748b', margin:0, lineHeight:1.6 }}>Setiap laporan akan diverifikasi oleh pembimbing lapangan secara berkala.</p>
        </div>
      </div>

      {/* Quick action */}
      <button onClick={() => setActiveMenu('tambah')} className="card anim-up d3"
        style={{ padding:'18px 20px', display:'flex', alignItems:'center', gap:14, width:'100%', border:'1px solid #f1f5f9', cursor:'pointer', textAlign:'left', transition:'all 0.2s' }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='#c7d2fe'; e.currentTarget.style.boxShadow='0 4px 16px rgba(99,102,241,0.1)';}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='#f1f5f9'; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)';}}
      >
        <div style={{ width:42, height:42, borderRadius:14, background:'linear-gradient(135deg,#2563eb,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(99,102,241,0.3)' }}>
          <Plus size={20} color="white" />
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:14, fontWeight:800, color:'#1e293b', margin:'0 0 2px' }}>Tambah Laporan Baru</p>
          <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>Catat aktivitas magang hari ini</p>
        </div>
        <ChevronRight size={18} color="#cbd5e1" />
      </button>
    </div>
  );

  const TambahForm = () => (
    <div className="anim-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div>
        <h2 style={{ fontSize:22, fontWeight:900, color:'#0f172a', margin:'0 0 4px' }}>Tambah Laporan</h2>
        <p style={{ fontSize:13, color:'#94a3b8', margin:0 }}>Isi form di bawah untuk mencatat kegiatan.</p>
      </div>

      {message && (
        <div className="anim-fade" style={{
          display:'flex', alignItems:'center', gap:10, padding:'14px 16px', borderRadius:14,
          fontSize:13, fontWeight:700,
          background: messageType==='success' ? '#ecfdf5' : '#fef2f2',
          color:       messageType==='success' ? '#065f46' : '#991b1b',
          border:     `1px solid ${messageType==='success' ? '#a7f3d0' : '#fecaca'}`,
        }}>
          {messageType==='success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
        {/* Tanggal + Jam */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <Label>Tanggal</Label>
            <input type="date" className="field" value={tanggal} onChange={e=>setTanggal(e.target.value)} required />
          </div>
          <div>
            <Label>Jam</Label>
            <input type="time" className="field" value={jam} onChange={e=>setJam(e.target.value)} required />
          </div>
        </div>

        {/* Aktivitas */}
        <div>
          <Label>Judul Aktivitas</Label>
          <input type="text" className="field" placeholder="Contoh: Membuat desain UI dashboard" value={aktivitas} onChange={e=>setAktivitas(e.target.value)} required />
        </div>

        {/* Uraian */}
        <div>
          <Label>Uraian Detail</Label>
          <textarea rows={3} className="field" style={{ resize:'none' }} placeholder="Jelaskan apa yang dikerjakan..." value={uraian_kegiatan} onChange={e=>setUraianKegiatan(e.target.value)} required />
        </div>

        {/* Lokasi */}
        <div>
          <Label>Lokasi</Label>
          <div style={{ position:'relative' }}>
            <MapPin size={16} color="#cbd5e1" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
            <input type="text" className="field field-icon" placeholder="Tempat kegiatan..." value={tempat} onChange={e=>setTempat(e.target.value)} />
          </div>
        </div>

        {/* Upload */}
        <div>
          <Label>Lampiran Bukti (opsional)</Label>
          <input type="file" id="bukti" style={{ display:'none' }} accept="image/*,.pdf" onChange={e=>setBukti(e.target.files[0])} />
          <label htmlFor="bukti" style={{
            display:'flex', alignItems:'center', gap:14, padding:'14px 16px',
            border:`2px dashed ${bukti ? '#6ee7b7' : '#e2e8f0'}`,
            background: bukti ? '#f0fdf4' : '#f8fafc',
            borderRadius:14, cursor:'pointer', transition:'all 0.2s',
          }}>
            <div style={{ width:38, height:38, borderRadius:10, background: bukti ? '#d1fae5' : 'white', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {bukti ? <CheckCircle size={18} color="#10b981"/> : <Image size={18} color="#94a3b8"/>}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color: bukti ? '#065f46' : '#64748b', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {bukti ? bukti.name : 'Pilih foto atau PDF'}
              </p>
              <p style={{ fontSize:11, color:'#94a3b8', margin:0 }}>{bukti ? 'Klik untuk ganti' : 'JPG, PNG, PDF · Maks. 2MB'}</p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <button type="submit" disabled={isSubmitting} className="gradient-bar" style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          padding:'15px 0', borderRadius:16, fontSize:14, fontWeight:800,
          color:'white', border:'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.7 : 1, transition:'all 0.2s',
          boxShadow:'0 6px 20px rgba(99,102,241,0.3)',
        }}>
          {isSubmitting ? (
            <><svg style={{width:18,height:18,animation:'spin 1s linear infinite'}} viewBox="0 0 24 24" fill="none"><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" opacity=".75"/></svg>Menyimpan...</>
          ) : (
            <><Upload size={17}/>Simpan Laporan</>
          )}
        </button>
      </form>
    </div>
  );

  const Riwayat = () => (
    <div className="anim-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:900, color:'#0f172a', margin:'0 0 2px' }}>Riwayat Logbook</h2>
          <p style={{ fontSize:13, color:'#94a3b8', margin:0 }}>{myLogbooks.length} entri tercatat</p>
        </div>
        <button onClick={fetchLogs} style={{ fontSize:12, fontWeight:800, color:'#6366f1', background:'#eef2ff', border:'none', padding:'8px 14px', borderRadius:10, cursor:'pointer' }}>
          Refresh
        </button>
      </div>

      {isLoadingLogs ? (
        <div className="card" style={{ padding:64, textAlign:'center' }}>
          <svg style={{width:36,height:36,animation:'spin 1s linear infinite',margin:'0 auto 12px'}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#a5b4fc" strokeWidth="4" opacity=".3"/><path fill="#6366f1" d="M4 12a8 8 0 018-8v8H4z"/></svg>
          <p style={{ fontSize:13, color:'#94a3b8', fontWeight:600, margin:0 }}>Memuat data...</p>
        </div>
      ) : myLogbooks.length === 0 ? (
        <div className="card" style={{ padding:64, textAlign:'center' }}>
          <div style={{ width:60, height:60, background:'#f1f5f9', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <BookOpen size={26} color="#cbd5e1"/>
          </div>
          <p style={{ fontSize:14, fontWeight:800, color:'#94a3b8', margin:'0 0 6px' }}>Belum ada laporan</p>
          <p style={{ fontSize:12, color:'#cbd5e1', margin:'0 0 16px' }}>Mulai catat aktivitas magang Anda</p>
          <button onClick={()=>setActiveMenu('tambah')} style={{ fontSize:12, fontWeight:800, color:'#6366f1', background:'#eef2ff', border:'none', padding:'10px 18px', borderRadius:10, cursor:'pointer' }}>
            + Tambah Laporan
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {myLogbooks.map((log, i) => (
            <div key={log.id} className="card anim-up" style={{ padding:'16px 18px', animationDelay:`${i*0.04}s`, opacity:0 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:10 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:14, fontWeight:800, color:'#1e293b', margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.aktivitas}</p>
                  <p style={{ fontSize:12, color:'#94a3b8', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontStyle:'italic' }}>"{log.uraian_kegiatan}"</p>
                </div>
                <StatusPill status={log.status_validasi}/>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                {[
                  { icon:Calendar, text: new Date(log.tanggal).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) },
                  { icon:Clock,    text: log.jam },
                  log.tempat && { icon:MapPin, text: log.tempat },
                ].filter(Boolean).map(({ icon:I, text }) => (
                  <span key={text} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#94a3b8', fontWeight:600 }}>
                    <I size={11}/>{text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const pages = { dashboard: <Dashboard/>, tambah: <TambahForm/>, riwayat: <Riwayat/> };

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <style>{S}</style>

      {/* ══════════════════════════════════════
          DESKTOP SIDEBAR
      ══════════════════════════════════════ */}
      <aside className="desktop-side" style={{
        position:'fixed', top:0, left:0, height:'100%', width:252,
        background:'#0f172a', display:'flex', flexDirection:'column',
        boxShadow:'4px 0 24px rgba(0,0,0,0.15)', zIndex:50,
      }}>
        {/* Brand */}
        <div style={{ padding:'24px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:'linear-gradient(135deg,#2563eb,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(99,102,241,0.4)' }}>
              <img src={logo} alt="logo" style={{ height:22, width:'auto' }}/>
            </div>
            <span style={{ fontWeight:900, fontSize:18, color:'white', letterSpacing:'-0.5px' }}>Intern-Gate</span>
          </div>
        </div>

        {/* User card */}
        <div style={{ margin:'16px 12px', padding:'14px 16px', background:'rgba(255,255,255,0.05)', borderRadius:16, border:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#2563eb,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:14, color:'white', flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:800, color:'white', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{userData.nama}</p>
              <p style={{ fontSize:10, fontWeight:700, color:'#818cf8', textTransform:'uppercase', letterSpacing:'0.15em', margin:0 }}>{userData.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'4px 12px', display:'flex', flexDirection:'column', gap:4 }}>
          {NAVS.map(({ id, label, icon:I }) => (
            <button key={id} onClick={()=>setActiveMenu(id)} className={`nav-btn${activeMenu===id?' active':''}`}>
              <I size={18}/>{label === 'Tambah' ? 'Tambah Laporan' : label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding:12 }}>
          <button onClick={handleLogout} className="nav-btn" style={{ color:'#f87171', border:'1px solid rgba(248,113,113,0.2)' }}>
            <LogOut size={18}/> Keluar
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          DESKTOP TOP BAR
      ══════════════════════════════════════ */}
      <header className="desktop-top" style={{
        position:'fixed', top:0, left:252, right:0, height:64,
        background:'white', borderBottom:'1px solid #f1f5f9',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 32px', zIndex:40, boxShadow:'0 1px 6px rgba(0,0,0,0.04)',
      }}>
        <p style={{ fontSize:11, fontWeight:900, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.25em', margin:0 }}>
          Sistem Informasi Monitoring Magang
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#1e293b', margin:'0 0 1px' }}>{userData.nama}</p>
            <p style={{ fontSize:11, color:'#94a3b8', margin:0 }}>{userData.email}</p>
          </div>
          <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg,#2563eb,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:13, color:'white' }}>
            {initials}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          MOBILE TOP BAR
      ══════════════════════════════════════ */}
      <header className="mobile-top" style={{
        position:'fixed', top:0, left:0, right:0, height:60,
        background:'white', borderBottom:'1px solid #f1f5f9',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 16px', zIndex:50, boxShadow:'0 1px 8px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#2563eb,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 10px rgba(99,102,241,0.35)' }}>
            <img src={logo} alt="logo" style={{ height:18, width:'auto' }}/>
          </div>
          <span style={{ fontWeight:900, fontSize:17, color:'#0f172a', letterSpacing:'-0.3px' }}>Intern-Gate</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:12, fontWeight:800, color:'#1e293b', margin:'0 0 1px', lineHeight:1 }}>{firstName}</p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4 }}>
              <span className="pulse-dot" style={{ width:6, height:6, background:'#22c55e', borderRadius:'50%', display:'inline-block' }}/>
              <span style={{ fontSize:10, fontWeight:700, color:'#16a34a' }}>Online</span>
            </div>
          </div>
          <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#2563eb,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'white', boxShadow:'0 3px 10px rgba(99,102,241,0.3)' }}>
            {initials}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <main className="main-wrap no-scroll" style={{ marginLeft:252, paddingTop:64, paddingBottom:32, overflowY:'auto', minHeight:'100vh' }}>
        <div style={{ maxWidth:680, margin:'0 auto', padding:'24px 24px' }}>
          {pages[activeMenu]}
        </div>
      </main>

      {/* ══════════════════════════════════════
          MOBILE BOTTOM NAV
      ══════════════════════════════════════ */}
      <nav className="bottom-nav">
        {/* Regular nav items */}
        {NAVS.map(({ id, label, icon:I }) => {
          const isActive = activeMenu === id;
          const isCTA = id === 'tambah';
          return (
            <button key={id} onClick={()=>setActiveMenu(id)} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', gap: isCTA ? 0 : 4,
              padding:'6px 4px', background:'transparent', border:'none', cursor:'pointer',
              transition:'all 0.2s',
            }}>
              {isCTA ? (
                <div style={{
                  width:52, height:52, borderRadius:18,
                  background:'linear-gradient(135deg,#2563eb,#6366f1)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 4px 16px rgba(99,102,241,0.4)',
                  transform: isActive ? 'scale(0.95)' : 'scale(1)',
                  transition:'transform 0.15s',
                }}>
                  <I size={24} color="white"/>
                </div>
              ) : (
                <>
                  <div style={{
                    width:40, height:36, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
                    background: isActive ? '#eef2ff' : 'transparent',
                    transition:'all 0.2s',
                  }}>
                    <I size={21} color={isActive ? '#6366f1' : '#94a3b8'}/>
                  </div>
                  <span style={{ fontSize:10, fontWeight:800, color: isActive ? '#6366f1' : '#94a3b8', letterSpacing:'0.02em' }}>{label}</span>
                  {isActive && <div style={{ width:4, height:4, borderRadius:'50%', background:'#6366f1', marginTop:1 }}/>}
                </>
              )}
            </button>
          );
        })}

        {/* Logout */}
        <button onClick={handleLogout} style={{
          flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
          padding:'6px 4px', background:'transparent', border:'none', cursor:'pointer',
        }}>
          <div style={{ width:40, height:36, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <LogOut size={21} color="#f87171"/>
          </div>
          <span style={{ fontSize:10, fontWeight:800, color:'#f87171' }}>Keluar</span>
          <div style={{ width:4, height:4, borderRadius:'50%', background:'transparent' }}/>
        </button>
      </nav>
    </div>
  );
};

export default Students;
