const db = require('../config/database');

// 1. Simpan Kegiatan Baru
exports.submitLogbook = async (req, res) => {
    // Tambahkan latitude dan longitude di sini
    const { tanggal, jam, aktivitas, uraian_kegiatan, tempat, latitude, longitude } = req.body;
    const bukti = req.file ? req.file.filename : null;
    const userId = req.user.id; 

    try {
        await db.execute(
            `INSERT INTO logbooks (user_id, tanggal, jam, aktivitas, uraian_kegiatan, tempat, bukti, status_validasi, latitude, longitude) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu verifikasi', ?, ?)`,
            [
                userId, 
                tanggal, 
                jam, 
                aktivitas, 
                uraian_kegiatan, 
                tempat, 
                bukti,
                latitude || null, // Simpan jika ada
                longitude || null
            ]
        );
        res.status(201).json({ message: 'Laporan Berhasil Disimpan!' });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: error.message });
    }
};
// 2. Ambil Riwayat Kegiatan Saya (REVISI DI SINI)
exports.getMyLogbook = async (req, res) => {
    const userId = req.user.id;
    try {
        // PERBAIKAN: Nama tabel harus 'logbooks' (pakai S) sesuai database kamu
        const [rows] = await db.execute(
            'SELECT * FROM logbooks WHERE user_id = ? ORDER BY tanggal DESC, jam DESC',
            [userId]
        );
        
        // Kirim respon
        res.json(rows);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Tambahkan fungsi ini di controllers/studentController.js
exports.getProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute(
            `SELECT a.tgl_mulai, a.tgl_selesai 
             FROM applications a 
             JOIN users u ON u.application_id = a.id 
             WHERE u.id = ?`,
            [userId]
        );
        if (rows.length === 0) return res.status(404).json({ message: "Data magang tidak ditemukan" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};