
const db = require('../config/database');

exports.submitLogbook = async (req, res) => {
    const { aktivitas, latitude, longitude } = req.body;
    const userId = req.user.id; // Diambil dari token

    try {
        await db.execute(
            'INSERT INTO logbooks (user_id, tanggal, aktivitas, latitude, longitude) VALUES (?, CURDATE(), ?, ?, ?)',
            [userId, aktivitas, latitude, longitude]
        );
        res.json({ message: 'Logbook berhasil disimpan!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

