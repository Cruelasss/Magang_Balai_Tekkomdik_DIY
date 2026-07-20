const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Konfigurasi Penyimpanan File (Menggunakan Memory Storage untuk Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5* 1024 * 1024 }, // Batas 5MB
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
    upload.single('berkas')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { nama, email, instansi, jurusan } = req.body;
        
        if (!nama || !email || !instansi || !jurusan) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi!' });
        }

        try {
            let berkasUrl = null;
            
            // Proses upload ke Cloudinary jika ada file
            if (req.file) {
                const uploadToCloudinary = (buffer) => {
                    return new Promise((resolve, reject) => {
                        // Tambahkan timestamp agar nama file unik, dan sertakan nama aslinya
                        const uniqueName = `${Date.now()}_${req.file.originalname}`;
                        
                        const cld_upload_stream = cloudinary.uploader.upload_stream(
                            { 
                                folder: "magang_tekkomdik/pendaftaran", 
                                resource_type: "raw", // Gunakan raw untuk dokumen
                                public_id: uniqueName // Set public_id dengan ekstensi aslinya (.pdf)
                            },
                            (error, result) => {
                                if (result) {
                                    resolve(result.secure_url);
                                } else {
                                    reject(error);
                                }
                            }
                        );
                        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
                    });
                };
                
                berkasUrl = await uploadToCloudinary(req.file.buffer);
            }

            const sql = "INSERT INTO applications (nama, email, instansi, jurusan, berkas, status) VALUES (?, ?, ?, ?, ?, 'Pending')";
            await db.execute(sql, [nama, email, instansi, jurusan, berkasUrl]);
            
            res.status(200).json({ success: true, message: 'Pendaftaran berhasil dikirim!' });
        } catch (error) {
            console.error("DATABASE ATAU CLOUDINARY ERROR:", error);
            res.status(500).json({ 
                success: false, 
                message: 'Gagal simpan data pendaftaran. Cek terminal server!' 
            });
        }
    });
});

module.exports = router;