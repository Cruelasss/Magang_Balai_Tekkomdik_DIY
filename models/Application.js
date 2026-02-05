// models/Application.js
const db = require('../config/database');

const Application = {
    // Fungsi untuk memasukkan data dari Excel ke Database
    importFromExcel: async (data) => {
        const sql = `INSERT INTO applications (nama, instansi, jurusan, tgl_mulai, tgl_selesai, status) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        return db.execute(sql, [
            data.nama, 
            data.sekolah, 
            data.jurusan, 
            data.tgl_masuk, 
            data.tgl_keluar, 
            data.status // 'Aktif' atau 'Selesai'
        ]);
    }
};

module.exports = Application;