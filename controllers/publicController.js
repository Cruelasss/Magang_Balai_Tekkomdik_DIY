const db = require('../config/database');

exports.registerIntern = async (req, res) => {
    const { nama, email, instansi, jurusan, tgl_mulai, tgl_selesai } = req.body;
    
    try {
        // 1. Cek kuota (Gunakan COALESCE agar jika data kosong tetap keluar angka 0, bukan null)
        const [mentors] = await db.execute('SELECT COALESCE(SUM(max_kuota - beban_kerja), 0) as sisa FROM mentors');
        
        // Jika sisa kuota 0 atau kurang, tolak pendaftaran
        if (mentors[0].sisa <= 0) {
            return res.status(400).json({ message: 'Maaf, kuota magang di Balai Tekkomdik saat ini sudah penuh.' });
        }

        // 2. Simpan ke database
        await db.execute(
            'INSERT INTO applications (nama, email, instansi, jurusan, tgl_mulai, tgl_selesai, status) VALUES (?, ?, ?, ?, ?, ?, "Pending")',
            [nama, email, instansi, jurusan, tgl_mulai, tgl_selesai]
        );

        // 3. Respon disesuaikan (Hapus bagian "cek email")
        res.json({ 
            message: 'Pendaftaran berhasil dikirim! Silakan hubungi admin atau datang ke kantor untuk konfirmasi selanjutnya.' 
        });

    } catch (error) {
        // Cek jika email duplikat agar tidak crash
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email ini sudah pernah mendaftar.' });
        }
        res.status(500).json({ message: error.message });
    }
};