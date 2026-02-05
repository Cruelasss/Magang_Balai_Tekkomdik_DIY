const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Ambil token dari header 'Authorization'
    // Biasanya formatnya: Bearer <token_panjang_sekali>
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak! Silakan login terlebih dahulu.' });
    }

    try {
        // 2. Verifikasi Token
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'TEKKOMDIK_SECRET_2026');
        
        // 3. Simpan data user yang login ke dalam object 'req' agar bisa dipakai di controller
        req.user = verified;
        
        // 4. Lanjut ke proses berikutnya (Controller)
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token tidak valid atau sudah kadaluwarsa!' });
    }
};