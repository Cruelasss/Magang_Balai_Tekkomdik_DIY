import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage'; // Halaman Welcome baru
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pendaftar from './pages/Pendaftar';
import Peserta from './pages/Peserta';
import Mentors from './pages/Mentors';
import AdminLogbook from './pages/AdminLogBook'; // Import halaman logbook admin
import Arsip from './pages/Arsip';
import Students from './pages/Students'; 
import AdminLayout from './components/AdminLayout';
import AdminCalendar from './pages/AdminCalendar';

// Satpam Rute: Proteksi berdasarkan Token & Role
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
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
        
        {/* --- RUTE KHUSUS MAHASISWA / PESERTA --- */}
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
        <Route path="/admin/logbook" element={<ProtectedRoute allowedRole="admin"><AdminLayout><AdminLogbook /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/arsip" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Arsip /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/calendar" element={<ProtectedRoute allowedRole="admin"><AdminLayout><AdminCalendar /></AdminLayout></ProtectedRoute>} />
        
        {/* --- REDIRECT & 404 --- */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;