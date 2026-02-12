const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/database');

// Pastikan controller dan middleware terload
if (adminController && authMiddleware) {
    
    // --- RUTE STATISTIK & APLIKASI ---
    router.get('/stats', authMiddleware, adminController.getStats);
    router.get('/applications', authMiddleware, adminController.getAllApplications);
    router.delete('/applications/:id', authMiddleware, adminController.deleteApplication);
    router.put('/applications/:id/status', authMiddleware, adminController.updateStatus);

    // --- RUTE PLOTTING MENTOR ---
  // UPDATE rute assign-mentor
router.put('/applications/:id/assign-mentor', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { mentor_id, start, end } = req.body;

    try {
        // PERBAIKAN: SET id_mentor (bukan mentor_id)
        const query = `
            UPDATE applications 
            SET id_mentor = ?, tgl_mulai = ?, tgl_selesai = ?, status = 'Aktif' 
            WHERE id = ?
        `;
        await db.execute(query, [mentor_id, start, end, id]);
        res.json({ message: "Plotting berhasil!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal update database" });
    }
});

// adminRoutes.js pada rute GET /mentors

router.get('/mentors', authMiddleware, async (req, res) => {
    try {
        // Jalankan update status dulu agar beban kerja akurat
        await db.execute(`
            UPDATE applications SET status = 'Selesai' 
            WHERE status = 'Aktif' AND tgl_selesai < CURRENT_DATE
        `);

        const query = `
            SELECT 
                m.id, m.nama_pembimbing, m.divisi, m.max_kuota,
                (SELECT COUNT(*) FROM applications a 
                 WHERE a.id_mentor = m.id 
                 AND a.status = 'Aktif') AS beban_kerja
            FROM mentors m 
            ORDER BY m.nama_pembimbing ASC
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/mentors', authMiddleware, adminController.addMentor);
router.delete('/mentors/:id', authMiddleware, adminController.deleteMentor);
} else {
    console.error("Controller atau Middleware belum siap!");
}

module.exports = router;