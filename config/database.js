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
    queueLimit: 0,
    // Tambahkan ini untuk handle masalah timezone jika diperlukan
    timezone: '+07:00' 
});

// Ubah ke mode promise
const db = pool.promise();

// Cek Koneksi saat pertama kali server jalan
db.getConnection()
    .then(connection => {
        console.log('✅ Database MySQL Terkoneksi (Pool ID: ' + connection.threadId + ')');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database Gagal Konek! Pesan:', err.message);
        console.log('--- Cek apakah MySQL di XAMPP sudah ON atau Password benar ---');
    });

// Cukup export db saja yang sudah berbentuk promise
module.exports = db;