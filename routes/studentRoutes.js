// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Gunakan authMiddleware untuk memproteksi rute
router.use(authMiddleware);

// Route Input Kegiatan (dengan upload file)
router.post('/logbook', upload.single('bukti'), studentController.submitLogbook);

// Route Daftar Kegiatan Saya
router.get('/logbook', studentController.getMyLogbook);

module.exports = router;