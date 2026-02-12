const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak! Silakan login terlebih dahulu.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'TEKKOMDIK_SECRET_2026');
        req.user = verified; // Sekarang req.user berisi id, role, dan email
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token tidak valid atau sudah kadaluwarsa!' });
    }
};