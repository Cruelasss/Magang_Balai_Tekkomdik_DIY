const xlsx = require('xlsx');
const db = require('../config/database');

function excelDateToJSDate(serial) {
    if (!serial || isNaN(serial)) return null;
    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
}

async function importExcelData() {
    try {
        const workbook = xlsx.readFile('data_prakerin.xlsx');
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log(`Memproses ${data.length} baris data...`);

        let successCount = 0;
        let skipCount = 0;

        // Variabel untuk menyimpan nilai terakhir (Solusi untuk Merged Cells)
        let lastInstansi = 'Tidak Diketahui';
        let lastJurusan = 'Umum';

        for (const row of data) {
            const nama = row['Nama Siswa/Mahasiswa'];
            
            // 1. Lewati baris jika nama benar-benar kosong (bukan pendaftar)
            if (!nama || typeof nama !== 'string' || nama.trim() === "") {
                continue; 
            }

            // 2. LOGIKA FORWARD FILL (Menangani Merged Cells)
            // Jika kolom sekolah ada isinya, update nilai terakhir. Jika kosong, pakai nilai terakhir.
            if (row['Nama Sekolah']) {
                lastInstansi = row['Nama Sekolah'].trim();
            }
            const instansi = lastInstansi;

            if (row['Jurusan']) {
                lastJurusan = row['Jurusan'].trim();
            }
            const jurusan = lastJurusan;

            const namaMentor = row['Pembimbing'];

            // 3. LOGIKA ANTI-DUPLIKAT
            const [existing] = await db.execute(
                'SELECT id FROM applications WHERE nama = ? AND instansi = ? AND tgl_mulai = ?',
                [nama.trim(), instansi, excelDateToJSDate(row['Mulai Magang'])]
            );

            if (existing.length > 0) {
                skipCount++;
                continue; 
            }

            // 4. Generate Email Dummy
            const emailDummy = nama.toLowerCase().trim().replace(/\s+/g, '') + Math.floor(Math.random() * 1000) + "@mail.com";

            // 5. Konversi tanggal
            let tglMulai = excelDateToJSDate(row['Mulai Magang']);
            let tglSelesai = excelDateToJSDate(row['Selesai Magang']);

            if (typeof row['Mulai Magang'] === 'string') tglMulai = row['Mulai Magang'];
            if (typeof row['Selesai Magang'] === 'string') tglSelesai = row['Selesai Magang'];

            // 6. Kelola Data Mentor
            let mentorId = null;
            if (namaMentor) {
                const [mentorRows] = await db.execute(
                    'SELECT id FROM mentors WHERE nama_pembimbing = ?', 
                    [namaMentor.trim()]
                );

                if (mentorRows.length > 0) {
                    mentorId = mentorRows[0].id;
                } else {
                    const [result] = await db.execute(
                        'INSERT INTO mentors (nama_pembimbing, divisi) VALUES (?, ?)', 
                        [namaMentor.trim(), 'Umum']
                    );
                    mentorId = result.insertId;
                }
            }

            // 7. Tentukan Status
            const today = new Date();
            const endDate = tglSelesai ? new Date(tglSelesai) : today;
            const status = endDate < today ? 'Selesai' : 'Aktif';

            // 8. Insert ke Database
            await db.execute(
                `INSERT INTO applications 
                (nama, email, instansi, jurusan, tgl_mulai, tgl_selesai, status, id_mentor) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [nama.trim(), emailDummy, instansi, jurusan, tglMulai, tglSelesai, status, mentorId]
            );
            
            successCount++;
        }

        console.log(`\n--- LAPORAN IMPORT TEKKOMDIK ---`);
        console.log(`✅ Sukses (Termasuk Merged): ${successCount} data`);
        console.log(`⏭️  Dilewati (Duplikat)    : ${skipCount} data`);
        console.log(`--------------------------------\n`);
        
        process.exit();
    } catch (error) {
        console.error('❌ Terjadi Kesalahan:', error.message);
        process.exit(1);
    }
}

importExcelData();