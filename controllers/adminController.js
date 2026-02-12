const db = require('../config/database');

exports.getStats = async (req, res) => {
    try {
        // 1. Ambil statistik status
        const [statusStats] = await db.execute(
            'SELECT status, COUNT(*) as jumlah FROM applications GROUP BY status'
        );

        // 2. Ambil statistik jurusan (Top 5)
        const [jurusanStats] = await db.execute(
            'SELECT jurusan, COUNT(*) as jumlah FROM applications GROUP BY jurusan ORDER BY jumlah DESC LIMIT 5'
        );

        // 3. Hitung total pendaftar dari data status yang ada
        const totalPendaftar = statusStats.reduce((acc, curr) => acc + curr.jumlah, 0);
        
        res.json({
            success: true,
            total: totalPendaftar,
            data: {
                status: statusStats || [],
                jurusan: jurusanStats || []
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM applications WHERE id = ?", [id]);
        res.json({ message: "Data berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ message: "Gagal menghapus data dari database" });
    }
};

// adminController.js

exports.getAllApplications = async (req, res) => {
    try {
        // 1. LOGIKA OTOMATIS: Update status menjadi 'Selesai' jika masanya sudah habis
        // CURRENT_DATE akan mengambil tanggal hari ini dari sistem database
        const autoUpdateQuery = `
            UPDATE applications 
            SET status = 'Selesai' 
            WHERE status = 'Aktif' 
            AND tgl_selesai < CURRENT_DATE
        `;
        await db.execute(autoUpdateQuery);

        // 2. Ambil data yang sudah ter-update
        const [rows] = await db.execute('SELECT * FROM applications ORDER BY created_at DESC');
        
        res.json(rows);
    } catch (error) {
        console.error("Gagal sinkronisasi status otomatis:", error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Isinya nanti 'Approved' atau 'Rejected'
    try {
        await db.execute('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Status berhasil diubah menjadi ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// adminController.js - Tambahkan ini
exports.addMentor = async (req, res) => {
    const { nama_pembimbing, divisi, max_kuota } = req.body;
    try {
        await db.execute(
            'INSERT INTO mentors (nama_pembimbing, divisi, max_kuota) VALUES (?, ?, ?)',
            [nama_pembimbing, divisi || 'Umum', max_kuota || 5]
        );
        res.status(201).json({ message: "Mentor berhasil ditambahkan" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteMentor = async (req, res) => {
    try {
        await db.execute('DELETE FROM mentors WHERE id = ?', [req.params.id]);
        res.json({ message: "Mentor berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// adminController.js (Cek bagian ini!)
// adminController.js

exports.getAllMentors = async (req, res) => {
    try {
        // PERBAIKAN: Mengganti mentor_id menjadi id_mentor sesuai DB kamu
        const query = `
            SELECT 
                m.id, 
                m.nama_pembimbing, 
                m.divisi, 
                m.max_kuota,
                (SELECT COUNT(*) FROM applications a 
                 WHERE a.id_mentor = m.id 
                 AND (a.status = 'Aktif' OR a.status = 'Approved')) AS beban_kerja
            FROM mentors m 
            ORDER BY m.nama_pembimbing ASC
        `;
        
        const [rows] = await db.execute(query);
        
        console.log("✅ Berhasil menarik data mentor dengan kolom id_mentor");
        res.json(rows);
    } catch (err) {
        console.error("❌ ERROR DI CONTROLLER:", err.message);
        res.status(500).json({ message: "Gagal ambil data mentor: " + err.message });
    }
};

// Di adminController.js
exports.getPendingLogbookCount = async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT COUNT(*) as total FROM logbooks WHERE status_validasi = 'Menunggu verifikasi'"
        );
        res.json({ count: rows[0].total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

