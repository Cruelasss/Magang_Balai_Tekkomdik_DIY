const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function generateAccounts() {
    try {
        // 1. Ambil semua data dari applications yang belum punya akun
        const [apps] = await db.execute(`
            SELECT id, email FROM applications 
            WHERE id NOT IN (SELECT application_id FROM users WHERE application_id IS NOT NULL)
        `);

        if (apps.length === 0) {
            console.log('Semua peserta sudah memiliki akun.');
            process.exit();
        }

        console.log(`Menyiapkan akun untuk ${apps.length} peserta...`);
        const passwordHash = await bcrypt.hash('magang2026', 10);

        for (const app of apps) {
            await db.execute(
                'INSERT INTO users (email, password_hash, role, application_id) VALUES (?, ?, ?, ?)',
                [app.email, passwordHash, 'Peserta', app.id]
            );
        }

        console.log('✅ Akun peserta berhasil dibuat! Password default: magang2026');
        process.exit();
    } catch (error) {
        console.error('❌ Gagal generate akun:', error.message);
        process.exit(1);
    }
}

generateAccounts();