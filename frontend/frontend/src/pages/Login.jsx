import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { LogIn, Mail, Lock, AlertCircle, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Kirim data login ke backend
      const response = await api.post('/auth/login', { email, password });
      
      // 2. Ambil token dan data user dari response backend
      const { token, user } = response.data;
      
      // 3. Simpan token dan info user ke localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // Simpan objek user (id, email, role)
      
      // 4. LOGIKA REDIRECT BERDASARKAN ROLE
      // Kita pastikan role dalam huruf kecil agar tidak ada typo (case-insensitive)
      const userRole = user.role.toLowerCase();

      if (userRole === 'admin') {
        // Jika admin, arahkan ke dashboard admin
        navigate('/admin/dashboard');
      } else if (userRole === 'peserta') {
        // Jika peserta, arahkan ke halaman logbook student
        navigate('/students');
      } else {
        // Jika role tidak dikenali
        setError('Role pengguna tidak valid. Hubungi Admin.');
      }

    } catch (err) {
      // Menangkap pesan error dari backend jika ada
      setError(err.response?.data?.message || 'Email atau Password salah!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Orbs */}
        <div className="absolute top-20 -left-4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -right-4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-md w-full px-4">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-md opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                IG
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Intern-Gate</h1>
          <p className="text-gray-500 text-sm">Balai Tekkomdik DIY</p>
          <div className="flex items-center justify-center gap-1 mt-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sistem Monitoring Magang Terpadu
            </span>
          </div>
        </div>

        {/* Card Login */}
        <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Decorative Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
          
          {/* Header Card */}
          <div className="text-left mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Selamat Datang Kembali</h2>
            <p className="text-sm text-gray-500">Silakan masuk ke akun Anda</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-shake">
              <div className="bg-red-100 rounded-lg p-1">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium flex-1">{error}</span>
            </div>
          )}

          {/* Form Login */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                Email
              </label>
              <div className="relative group/field">
                <div className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-0 group-hover/field:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover/field:text-blue-600 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl pl-11 pr-4 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                  Password
                </label>
                <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Lupa Password?
                </button>
              </div>
              <div className="relative group/field">
                <div className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-0 group-hover/field:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover/field:text-blue-600 transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl pl-11 pr-12 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group/btn relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-4 font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Masuk ke Akun
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Belum punya akun?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Daftar Sekarang
              </Link>
            </p>
          </div>

          
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-xs text-gray-400">
          © 2026 Intern-Gate Balai Tekkomdik DIY. All rights reserved.
        </p>
      </div>

      {/* Style untuk animasi */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;