const db = require('../config/database');

/**
 * 1. STATISTIK & DASHBOARD
 */
exports.getStats = async (req, res) => {
    try {
        // Ambil statistik status
        const [statusStats] = await db.execute(
            'SELECT status, COUNT(*) as jumlah FROM applications GROUP BY status'
        );

        // Ambil statistik jurusan (Top 5)
        const [jurusanStats] = await db.execute(
            'SELECT jurusan, COUNT(*) as jumlah FROM applications GROUP BY jurusan ORDER BY jumlah DESC LIMIT 5'
        );

        // Hitung total pendaftar
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
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 2. MANAJEMEN PENDAFTARAN (APPLICATIONS)
 */
exports.getAllApplications = async (req, res) => {
    try {
        // Sinkronisasi Status Otomatis: Update status menjadi 'Selesai' jika tgl_selesai sudah lewat
        const autoUpdateQuery = `
            UPDATE applications 
            SET status = 'Selesai' 
            WHERE status = 'Aktif' 
            AND tgl_selesai < CURRENT_DATE
        `;
        await db.execute(autoUpdateQuery);

        // Ambil data terbaru
        const [rows] = await db.execute('SELECT * FROM applications ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error("Gagal sinkronisasi status otomatis:", error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 
    try {
        await db.execute('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Status berhasil diubah menjadi ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

/**
 * 3. MANAJEMEN MENTOR
 */
exports.getAllMentors = async (req, res) => {
    try {
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
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Gagal ambil data mentor: " + err.message });
    }
};

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

/**
 * 4. MANAJEMEN LOGBOOK (VALIDASI)
 */

// Mengambil jumlah logbook yang masih 'Menunggu verifikasi' untuk badge sidebar
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

// Mengambil semua logbook mahasiswa (dengan JOIN tabel applications untuk mendapatkan Nama)
// adminController.js
exports.getAdminLogbooks = async (req, res) => {
    try {
        const { user_id } = req.query;
        
        // QUERY JOIN: Mengambil data logbook + Nama dari tabel pendaftar/applications
        let query = `
            SELECT l.*, a.nama 
            FROM logbooks l
            LEFT JOIN applications a ON l.user_id = a.id
        `;
        let params = [];

        if (user_id) {
            query += ` WHERE l.user_id = ?`;
            params.push(user_id);
        }

        query += ` ORDER BY l.tanggal DESC, l.jam DESC`;

        const [rows] = await db.execute(query, params);
        res.json(rows); // Mengirim array data ke frontend
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update status validasi logbook (Disetujui/Ditolak)
exports.validateLogbook = async (req, res) => {
    const { id } = req.params;
    const { status_validasi } = req.body;

    try {
        await db.execute(
            'UPDATE logbooks SET status_validasi = ? WHERE id = ?',
            [status_validasi, id]
        );
        res.json({ message: 'Status logbook berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};