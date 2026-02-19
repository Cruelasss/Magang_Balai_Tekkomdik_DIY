const db = require('../config/database');

// 1. Simpan Kegiatan Baru
exports.submitLogbook = async (req, res) => {
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
                uraian_kegiatan || null,
                tempat || null,
                bukti
            ]
        );
        res.status(201).json({ message: 'Laporan Berhasil Disimpan di Database!' });
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