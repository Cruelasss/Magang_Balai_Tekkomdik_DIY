import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage'; // Halaman Welcome baru
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pendaftar from './pages/Pendaftar';
import Peserta from './pages/Peserta';
import Mentors from './pages/Mentors';
import AdminLogbook from './pages/AdminLogbook'; // Import halaman logbook admin
import Arsip from './pages/Arsip';
<<<<<<< HEAD
import Students from './pages/Students'; 
import AdminLayout from './components/AdminLayout';

// Satpam Rute: Proteksi berdasarkan Token & Role
=======
import Students from './pages/Students';
import AdminLogbook from './pages/AdminLogbook'; // 1. PASTIKAN SUDAH DIIMPORT
import AdminLayout from './components/AdminLayout';

>>>>>>> origin/mariska
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

<<<<<<< HEAD
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
=======
  if (!token || !user) return <Navigate to="/" replace />;
>>>>>>> origin/mariska
  
  if (allowedRole && user.role.toLowerCase() !== allowedRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- RUTE PUBLIK (BISA DIAKSES SIAPAPUN) --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
<<<<<<< HEAD
        {/* --- RUTE KHUSUS MAHASISWA / PESERTA --- */}
=======
        {/* Rute Peserta */}
>>>>>>> origin/mariska
        <Route 
          path="/students" 
          element={
            <ProtectedRoute allowedRole="peserta">
              <Students />
            </ProtectedRoute>
          } 
        />

        {/* --- RUTE ADMIN (DENGAN SIDEBAR LAYOUT) --- */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/pendaftaran" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Pendaftar /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/peserta" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Peserta /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/mentors" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Mentors /></AdminLayout></ProtectedRoute>} />
<<<<<<< HEAD
        <Route path="/admin/logbook" element={<ProtectedRoute allowedRole="admin"><AdminLayout><AdminLogbook /></AdminLayout></ProtectedRoute>} />
=======
        
        {/* 2. REVISI: TAMBAHKAN ROUTE LOGBOOK DI SINI */}
        <Route 
          path="/admin/logbook" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout>
                <AdminLogbook />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

>>>>>>> origin/mariska
        <Route path="/admin/arsip" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Arsip /></AdminLayout></ProtectedRoute>} />
        
        {/* --- REDIRECT & 404 --- */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;