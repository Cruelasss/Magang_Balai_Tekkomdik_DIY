const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. IMPORT SEMUA ROUTES
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const logbookRoutes = require('./routes/logbookRoutes');
const publicRoutes = require('./routes/publicRoutes'); // Tambahkan ini untuk registrasi publik

const app = express();

// 2. CEK DEBUGGING (Opsional, bisa dihapus jika sudah yakin jalan)
console.log('--- DEBUGGING ROUTES ---');
console.log('Cek Auth Routes:', typeof authRoutes);
console.log('Cek Admin Routes:', typeof adminRoutes);
console.log('Cek Logbook Routes:', typeof logbookRoutes);
console.log('Cek Public Routes:', typeof publicRoutes);
console.log('------------------------');

// 3. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 4. GUNAKAN ROUTES (DAFTAR ENDPOINT)
app.use('/api/auth', authRoutes);       // Login
app.use('/api/admin', adminRoutes);     // Statistik Dashboard & Manajemen
app.use('/api/logbook', logbookRoutes); // Laporan Harian (GPS & Aktivitas)
app.use('/api/public', publicRoutes);   // Pendaftaran Mandiri Peserta Baru

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
});