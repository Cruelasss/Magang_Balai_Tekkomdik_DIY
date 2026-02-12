// controllers/studentController.js
const db = require('../config/database');

// 1. Simpan Kegiatan Baru
exports.submitLogbook = async (req, res) => {
    // Pastikan semua field ditangkap dari req.body
    const { tanggal, jam, aktivitas, uraian_kegiatan, tempat } = req.body;
    const bukti = req.file ? req.file.filename : null;
    const userId = req.user.id; 

    try {
        await db.execute(
            `INSERT INTO logbooks (user_id, tanggal, jam, aktivitas, uraian_kegiatan, tempat, bukti, status_validasi) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu verifikasi')`,
            [
                userId, 
                tanggal || null, 
                jam || null, 
                aktivitas || null, 
                uraian_kegiatan || null, // Jika kosong, kirim null
                tempat || null,          // Jika kosong, kirim null
                bukti                    // Sudah dihandle di atas
            ]
        );
        res.status(201).json({ message: 'Data kegiatan telah terkirim!' });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 2. Ambil Riwayat Kegiatan Saya
exports.getMyLogbook = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM logbook WHERE user_id = ? ORDER BY tanggal DESC',
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};