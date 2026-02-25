import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { LogIn, Mail, Lock, AlertCircle, ArrowLeft, Sparkles,User, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.svg';

// ================ ANIMATION STYLES ================
const animationStyles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }

  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(1deg); }
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
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-8px); }
    40%       { transform: translateX(8px); }
    60%       { transform: translateX(-5px); }
    80%       { transform: translateX(5px); }
  }

  .animate-blob { animation: blob 7s infinite; }
  .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
  .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
  .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
  .animate-rotate { animation: rotate 20s linear infinite; }
  .animate-gradient { background-size: 200% 200%; animation: gradient 4s ease infinite; }
  .animate-spin-slow { animation: spin-slow 3s linear infinite; }
  .animate-slide-up { animation: slide-up 0.6s ease forwards; }
  .animate-fade-in { animation: fade-in 0.8s ease forwards; }
  .animate-shake { animation: shake 0.5s ease; }
  .animation-delay-100 { animation-delay: 0.1s; opacity: 0; }
  .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
  .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }
  .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }

  .bg-grid-pattern {
    background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .input-focus-ring:focus {
    outline: none;
    border-color: transparent;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.2);
  }
`;

// ================ PARTICLE CANVAS ================
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * 1.5 - 0.75;
        this.opacity = Math.random() * 0.3;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.fillStyle = `rgba(37, 99, 235, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = Array.from({ length: 80 }, () => new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });

      ctx.strokeStyle = 'rgba(37, 99, 235, 0.04)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.08 * (1 - dist / 100)})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    init();
    animate();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

// ================ INPUT FIELD ================
const InputField = ({ label, icon: Icon, type, placeholder, value, onChange, disabled }) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className={`relative rounded-xl transition-all duration-300 ${focused ? 'shadow-lg shadow-blue-500/20' : ''}`}>
        {/* Gradient border effect on focus */}
        <div
          className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${focused ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #6366f1)',
            padding: '1.5px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
        <div className="relative flex items-center">
          <div className={`absolute left-3.5 transition-colors duration-300 ${focused ? 'text-blue-500' : 'text-gray-400'}`}>
            <Icon size={18} />
          </div>
          <input
            type={inputType}
            required
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl pl-11 py-3.5 text-sm text-gray-800 placeholder-gray-400 transition-all duration-300 hover:border-blue-200 focus:outline-none focus:border-blue-400 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed ${isPassword ? 'pr-11' : 'pr-4'}`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              disabled={disabled}
              className={`absolute right-3.5 transition-colors duration-300 focus:outline-none ${focused ? 'text-blue-400 hover:text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ================ MAIN COMPONENT ================
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      const userRole = user.role.toLowerCase();
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'peserta') {
        navigate('/students');
      } else {
        setError('Role pengguna tidak valid. Hubungi Admin.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau Password salah!');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 overflow-hidden">
      <style jsx>{animationStyles}</style>

      {/* Canvas Particle Background */}
      <ParticleCanvas />

      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slower" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-rotate" />
      </div>

      {/* Back to Home */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-600 hover:text-blue-600 px-4 py-2 rounded-xl border border-white/20 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-x-0.5 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Kembali
      </Link>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Glow behind card */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-3xl blur-2xl" />

        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl shadow-blue-500/10 overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient" />

          {/* Subtle grid pattern inside card */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

          <div className="relative px-8 py-10 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 animate-slide-up animation-delay-100">
              {/* Logo */}
              <div className="flex justify-center">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-2xl border border-blue-100">
                    <img src={logo} alt="InternGate" className="h-10 w-auto" />
                  </div>
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                  Intern-Gate
                </h1>
                <p className="text-gray-500 text-sm mt-1">Balai Tekkomdik DIY</p>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5">
                <div className="relative">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-40 animate-pulse" />
                </div>
                <span className="text-xs font-semibold text-blue-600">Masuk ke Dashboard</span>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className={`bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 ${shakeError ? 'animate-shake' : ''}`}>
                <div className="bg-red-100 rounded-lg p-1 mt-0.5 shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-red-700">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5 animate-slide-up animation-delay-200">
              <InputField
                label="Email"
                icon={Mail}
                type="email"
                placeholder="nama@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <InputField
                label="Password"
                icon={Lock}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-3 py-3.5 px-6 rounded-xl text-sm font-bold text-white overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 relative z-10" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="relative z-10">Menghubungkan...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                    <span className="relative z-10">Masuk ke Akun</span>
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center animate-slide-up animation-delay-300">
              <p className="text-sm text-gray-500">
                Belum punya akun?{' '}
                <Link
                  to="/register"
                  className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                >
                  Daftar Sekarang
                </Link>
              </p>
            </div>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 animate-slide-up animation-delay-400">
             
            
            </div>
          </div>
        </div>

        {/* Floating accent cards */}
        <div className="absolute -top-5 -left-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-3 border border-white/40 animate-float-slow hidden sm:flex items-center gap-2.5">
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
            < User className="w-4 h-4 text-green-600" />
          </div>
          <div>
          
          </div>
        </div>

        <div
          className="absolute -bottom-5 -right-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-3 border border-white/40 animate-float-slow hidden sm:flex items-center gap-2.5"
          style={{ animationDelay: '2s' }}
        >
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">100+ Alumni</p>
            <p className="text-xs text-gray-400">Telah bergabung</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
