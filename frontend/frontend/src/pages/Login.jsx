import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Intern-Gate
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Balai Tekkomdik DIY
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center text-red-700 animate-bounce">
            <AlertCircle className="mr-2" size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="relative">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-blue-300 group-hover:text-blue-400" aria-hidden="true" />
              </span>
              {loading ? 'Menghubungkan...' : 'Masuk ke Akun'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">
            Pastikan role akun Anda sesuai di database (admin/peserta)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;