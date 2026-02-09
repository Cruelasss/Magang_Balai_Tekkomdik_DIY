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

exports.getAllApplications = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM applications ORDER BY created_at DESC');
        res.json(rows); // Langsung kirim array data
    } catch (error) {
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