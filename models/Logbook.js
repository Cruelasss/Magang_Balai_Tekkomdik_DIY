const db = require('../config/database');
const Logbook = {
    create: async (data) => {
        const sql = 'INSERT INTO logbooks (user_id, tanggal, aktivitas, latitude, longitude) VALUES (?, CURDATE(), ?, ?, ?)';
        return db.execute(sql, [data.userId, data.aktivitas, data.lat, data.long]);
    }
};
module.exports = Logbook;