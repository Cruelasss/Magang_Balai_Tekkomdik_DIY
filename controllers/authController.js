const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // QUERY REVISI: Melakukan JOIN berdasarkan email
        // u.* mengambil data login, a.nama mengambil nama asli dari tabel applications
        const query = `
            SELECT u.*, a.nama 
            FROM users u
            LEFT JOIN applications a ON u.email = a.email
            WHERE u.email = ?
        `;
        
        const [users] = await db.execute(query, [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Email tidak terdaftar!' });
        }

        const user = users[0];

        // 2. Verifikasi Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Password salah!' });
        }

        // 3. Tentukan Fallback Nama jika Join null (Misal untuk Akun Admin)
        // Jika di tabel application tidak ada (null), gunakan Role sebagai nama sementara
        const displayName = user.nama || (user.role.toUpperCase() === 'ADMIN' ? 'Administrator' : 'User Mahasiswa');

        // 4. Buat Token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role, 
                nama: displayName,
                email: user.email 
            },
            process.env.JWT_SECRET || 'TEKKOMDIK_SECRET_2026',
            { expiresIn: '1d' }
        );

        // 5. Kirim respon ke Frontend
        res.json({
            message: 'Login Berhasil',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                nama: displayName // Sekarang Nama akan terisi dari tabel applications
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};