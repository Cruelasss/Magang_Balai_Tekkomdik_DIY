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


    // --- RUTE MANAJEMEN MENTOR (Panggil Fungsi dari Controller) ---
    // Gunakan fungsi yang sudah kita buat di adminController agar konsisten
  router.get('/mentors', authMiddleware, adminController.getAllMentors);

router.post('/mentors', authMiddleware, adminController.addMentor);
router.delete('/mentors/:id', authMiddleware, adminController.deleteMentor);
} else {
    console.error("Controller atau Middleware belum siap!");
}

module.exports = router;