const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/database');

/**
 * MIDDLEWARE PROTEKSI
 * Semua rute di bawah ini wajib login (token valid)
 */
router.use(authMiddleware);

if (adminController) {
    
    // --- 1. RUTE STATISTIK & APLIKASI (PENDAFTARAN) ---
    router.get('/stats', adminController.getStats);
    router.get('/applications', adminController.getAllApplications);
    router.delete('/applications/:id', adminController.deleteApplication);
    router.put('/applications/:id/status', adminController.updateStatus);

    // --- 2. RUTE PLOTTING MENTOR (ASSIGN) ---
    router.put('/applications/:id/assign-mentor', async (req, res) => {
        const { id } = req.params;
        const { mentor_id, start, end } = req.body;

        try {
            // SET id_mentor, tgl_mulai, tgl_selesai, dan status otomatis jadi 'Aktif'
            const query = `
                UPDATE applications 
                SET id_mentor = ?, tgl_mulai = ?, tgl_selesai = ?, status = 'Aktif' 
                WHERE id = ?
            `;
            await db.execute(query, [mentor_id, start, end, id]);
            res.json({ message: "Plotting mentor berhasil!" });
        } catch (err) {
            console.error("Error Plotting:", err);
            res.status(500).json({ message: "Gagal update database plotting" });
        }
    });

    // --- 3. RUTE MANAJEMEN MENTOR ---
    // Mengambil data mentor beserta beban kerja (count peserta aktif)
    router.get('/mentors', adminController.getAllMentors);
    router.post('/mentors', adminController.addMentor);
    router.delete('/mentors/:id', adminController.deleteMentor);

    // --- 4. RUTE LOGBOOK (VALIDASI & NOTIFIKASI) ---
    
    // Notifikasi Badge Sidebar (Count Pending)
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

    // List Logbook untuk tabel Admin (JOIN dengan nama peserta)
    router.get('/logbook', adminController.getAdminLogbooks);

    // Aksi Validasi (Approve/Reject)
    router.put('/logbook/:id/validate', adminController.validateLogbook);

} else {
    console.error("❌ AdminController tidak terdeteksi. Pastikan file controller sudah benar.");
}

module.exports = router;