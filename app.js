const express = require('express');
const cors = require('cors');
const path = require('path'); // Tambahkan ini untuk pathing folder
require('dotenv').config();

// 1. IMPORT SEMUA ROUTES
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const logbookRoutes = require('./routes/logbookRoutes');
const publicRoutes = require('./routes/publicRoutes');
const applicationRoutes = require('./routes/applicationRoutes'); // <--- Tambahkan rute baru ini
const studentRoutes = require('./routes/studentRoutes');


const app = express();

// 2. MIDDLEWARE
app.use(cors());
app.use(express.json());


// 3. STATIC FOLDER (Sangat Penting!)
// Ini supaya file PDF yang di-upload bisa dibuka lewat browser/dashboard
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. GUNAKAN ROUTES (DAFTAR ENDPOINT)
app.use('/api/student', studentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/logbook', logbookRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/applications', applicationRoutes); // <--- Endpoint untuk submit pendaftaran + file
// 4. GUNAKAN ROUTES
app.use('/api/student', studentRoutes);
// ... rute lainnya

// 5. ERROR HANDLING MIDDLEWARE (Tambahkan ini di bawah semua rute)
// Berfungsi menangkap error jika ada upload yang gagal atau error internal server lainnya
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server!',
        error: err.message 
    });
});
// 5. DEFAULT ROUTE
app.get('/', (req, res) => {
    res.json({
        message: "Selamat Datang di API TEKKOMDIK INTERN-GATE",
        status: "Server is Running",
        version: "1.0.0"
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server meluncur di http://localhost:${PORT}`);
    console.log(`📂 Folder uploads siap diakses di http://localhost:${PORT}/uploads`);
});