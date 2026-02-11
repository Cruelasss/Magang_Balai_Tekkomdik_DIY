import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pendaftar from './pages/Pendaftar'; // Halaman baru
import Peserta from './pages/Peserta';     // Halaman baru
import Mentors from './pages/Mentors';     // Halaman baru
import Arsip from './pages/Arsip';         // Halaman baru
import AdminLayout from './components/AdminLayout';

// Fungsi Satpam: Cek apakah user sudah login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Tanpa Sidebar (Auth) */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Halaman Admin (Pakai Sidebar + Protected) */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminLayout> <Dashboard /> </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/pendaftaran" 
          element={
            <ProtectedRoute>
              <AdminLayout> <Pendaftar /> </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/peserta" 
          element={
            <ProtectedRoute>
              <AdminLayout> <Peserta /> </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/mentors" 
          element={
            <ProtectedRoute>
              <AdminLayout> <Mentors /> </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/arsip" 
          element={
            <ProtectedRoute>
              <AdminLayout> <Arsip /> </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect: Kalau login sukses ke dashboard, kalau typo ke login */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;