const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 1. IMPORT SEMUA ROUTES
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const logbookRoutes = require('./routes/logbookRoutes');
const publicRoutes = require('./routes/publicRoutes');
const studentRoutes = require('./routes/studentRoutes');
// applicationRoutes dihapus/dikomentari agar tidak tabrakan dengan adminRoutes/submit
// const applicationRoutes = require('./routes/applicationRoutes'); 

const app = express();

// 2. MIDDLEWARE DASAR
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// 3. STATIC FOLDER
// Akses berkas via: http://localhost:5000/uploads/namafile.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. DAFTAR ENDPOINT (ROUTES)
app.use('/api/auth', authRoutes);
app.use('/api/logbook', logbookRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/student', studentRoutes);

/** * PINTU UTAMA: /api/admin
 * Di dalam adminRoutes sudah mencakup:
 * - POST /submit (Pendaftaran magang + nomor_wa)
 * - PUT /applications/:id/assign-mentor (Plotting + Password Acak)
 */
app.use('/api/admin', adminRoutes);

// 5. DEFAULT ROUTE
app.get('/', (req, res) => {
    res.json({
        message: "Selamat Datang di API TEKKOMDIK INTERN-GATE",
        status: "Server is Running",
        version: "1.1.0"
    });
});

// 6. ERROR HANDLING MIDDLEWARE
// Menangkap error multer atau error internal lainnya
app.use((err, req, res, next) => {
    console.error("Server Error Log:", err.stack);
    res.status(err.status || 500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server!',
        error: err.message 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server meluncur di http://localhost:${PORT}`);
    console.log(`📂 Folder uploads siap diakses di http://localhost:${PORT}/uploads`);
});