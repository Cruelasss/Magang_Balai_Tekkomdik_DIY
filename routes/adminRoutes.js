const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

// --- 1. KONFIGURASI MULTER (Wajib diletakkan di atas rute) ---
// Programmer Note: Multer harus diinisialisasi sebelum digunakan di rute POST
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Pastikan folder 'uploads' sudah dibuat di root project
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Penamaan file unik untuk mencegah file tertimpa
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // Batasi 2MB agar server tidak overload
});

// --- 2. RUTE PUBLIC (Tanpa Auth) ---
/**
 * Rute pendaftaran diletakkan DI ATAS middleware proteksi.
 * Alasan: Calon peserta belum memiliki token JWT saat mendaftar.
 * upload.single('berkas') bertugas memproses FormData dan memasukkan teks (termasuk nomor_wa) ke req.body
 */
// Di file adminRoutes.js
router.post('/submit', upload.single('berkas'), adminController.submitApplication);

/**
 * --- MIDDLEWARE PROTEKSI ---
 * Semua rute di bawah baris ini wajib menyertakan Token (Login sebagai Admin)
 */
router.use(authMiddleware);

// Pastikan adminController berhasil di-import
if (adminController) {
    
    // --- 3. RUTE MANAJEMEN PENDAFTARAN ---
    router.get('/stats', adminController.getStats);
    router.get('/applications', adminController.getAllApplications);
    router.delete('/applications/:id', adminController.deleteApplication);
    router.put('/applications/:id/status', adminController.updateStatus);
    
    // Sinkronisasi Kalender & Update Tanggal
    router.get('/calendar-events', adminController.getCalendarEvents);
    router.put('/interns/:id/dates', adminController.updateInternDates);

    // --- 4. RUTE PLOTTING MENTOR (Logic Akun Otomatis & Password Acak) ---
    // Programmer Note: Ini akan memanggil fungsi yang men-generate password_hash di tabel users
    router.put('/applications/:id/assign-mentor', adminController.assignMentor);

    // --- 5. RUTE MANAJEMEN MENTOR ---
    router.get('/mentors', adminController.getAllMentors);
    router.post('/mentors', adminController.addMentor);
    router.delete('/mentors/:id', adminController.deleteMentor);

    // --- 6. RUTE LOGBOOK (VALIDASI & MONITORING) ---
    router.get('/logbook', adminController.getAdminLogbooks);
    router.put('/logbook/:id/validate', adminController.validateLogbook);
    
    // Notifikasi Badge Sidebar
    router.get('/logbook-count', async (req, res) => {
        try {
            const [rows] = await db.execute(
                "SELECT COUNT(*) as total FROM logbooks WHERE status_validasi = 'Menunggu verifikasi'"
            );
            res.json({ count: rows[0].total });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

} else {
    console.error("❌ AdminController tidak terdeteksi. Periksa export pada adminController.js");
}

module.exports = router;