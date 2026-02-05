const db = require('../config/database');
const Mentor = {
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM mentors');
        return rows;
    },
    updateLoad: async (id, increment) => {
        return db.execute('UPDATE mentors SET beban_kerja = beban_kerja + ? WHERE id = ?', [increment, id]);
    }
};
module.exports = Mentor;