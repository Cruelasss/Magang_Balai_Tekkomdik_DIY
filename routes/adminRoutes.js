const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware'); // 1. Tambahkan import middleware

// 2. Pastikan kedua handler (satpam & controller) ada isinya
if (adminController && adminController.getStats && authMiddleware) {
    
    // Sekarang rute ini punya 2 penjaga: authMiddleware (cek token) baru getStats (ambil data)
router.get('/stats', adminController.getStats);
// Tambahkan baris ini di bawah rute /stats
router.get('/applications', authMiddleware, adminController.getAllApplications);
router.delete('/applications/:id', adminController.deleteApplication);
router.put('/applications/:id/status', adminController.updateStatus);

} else {
    console.error("Error: adminController.getStats atau authMiddleware tidak terdefinisi!");
}

module.exports = router;