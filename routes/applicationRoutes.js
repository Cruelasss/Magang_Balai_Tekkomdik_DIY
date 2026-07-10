const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

// Konfigurasi Penyimpanan File (Menggunakan Memory Storage untuk Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5* 1024 * 1024 }, // Batas 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Hanya file PDF yang diperbolehkan!'), false);
        }
    }
});

// Endpoint untuk Pendaftaran (Public)
router.post('/submit', (req, res) => {
    // Gunakan fungsi upload di sini agar bisa menangkap error Multer dengan baik
    upload.single('berkas')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading (e.g. file too large)
            return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading
            return res.status(400).json({ success: false, message: err.message });
        }

        // Jika upload file aman, lanjut proses database
        const { nama, email, instansi, jurusan } = req.body;
        const berkas = req.file ? req.file.filename : null;

        if (!nama || !email || !instansi || !jurusan) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi!' });
        }

        try {
            // Pastikan kolom 'status' sudah ada di tabel applications kamu
            const sql = "INSERT INTO applications (nama, email, instansi, jurusan, berkas, status) VALUES (?, ?, ?, ?, ?, 'Pending')";
            
            console.log("Mencoba menyimpan data:", { nama, email, instansi, jurusan, berkas });
            
            await db.execute(sql, [nama, email, instansi, jurusan, berkas]);
            
            res.status(200).json({ success: true, message: 'Pendaftaran berhasil dikirim!' });
        } catch (error) {
            // CEK DI TERMINAL VS CODE JIKA ERROR 500
            console.error("DATABASE ERROR:", error);
            res.status(500).json({ 
                success: false, 
                message: 'Gagal simpan ke database. Cek terminal server!' 
            });
        }
    });
});

module.exports = router;