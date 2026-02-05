// config/database.js
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Mnbvcxz123.',
    database: process.env.DB_NAME || 'tekkomdik_intern_gate',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export promise wrapper agar bisa pakai async/await
module.exports = pool.promise();