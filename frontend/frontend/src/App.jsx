import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
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
<Route path="/register" element={<Register />} />
        {/* Halaman Pertama yang muncul adalah Login */}
        <Route path="/" element={<Login />} />
        
        {/* Halaman Dashboard hanya bisa dibuka kalau sudah login */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Kalau user ngetik asal, arahkan balik ke Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;