import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pendaftar from './pages/Pendaftar';
import Peserta from './pages/Peserta';
import Mentors from './pages/Mentors';
import Arsip from './pages/Arsip';
import Students from './pages/Students'; // Import halaman baru mahasiswa
import AdminLayout from './components/AdminLayout';

// REVISI Satpam: Cek token dan opsional cek Role
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) return <Navigate to="/" replace />;
  
  if (allowedRole && user.role.toLowerCase() !== allowedRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* REVISI: Rute Khusus Mahasiswa / Peserta */}
        <Route 
          path="/students" 
          element={
            <ProtectedRoute allowedRole="peserta">
              <Students />
            </ProtectedRoute>
          } 
        />

        {/* Halaman Admin (Pakai Sidebar + Protected) */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/pendaftaran" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Pendaftar /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/peserta" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Peserta /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/mentors" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Mentors /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/arsip" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Arsip /></AdminLayout></ProtectedRoute>} />
        
        {/* Redirect Typo */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;