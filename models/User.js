const db = require('../config/database');
const User = {
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },
    create: async (data) => {
        const sql = 'INSERT INTO users (email, password_hash, role, application_id) VALUES (?, ?, ?, ?)';
        return db.execute(sql, [data.email, data.password, data.role, data.application_id]);
    }
};
module.exports = User;