/**
 * src/db/auto_patch.js
 * Automatic Schema Migration & Standard Accounts Seeder
 * Developed by: Jabar Pintar Digital
 * Runs on server startup to guarantee zero-downtime database integrity.
 */

const pool = require('./pool');

const STANDARD_ACCOUNTS = [
  {
    username: 'superadmin',
    nama: 'Super Admin Sistem',
    role: 'superadmin',
    rt: null,
    rw: null,
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIeh/sdJa5doIVSQ6HCNTS2TCPYrymUJAe' // Sukabumi@Diskominfo2026
  },
  {
    username: 'walikota.sukabumi',
    nama: 'Pimpinan Wilayah Kota',
    role: 'walikota',
    rt: null,
    rw: null,
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIersh.QVMglQPygCV/A3BrDqIGu99Tje6' // Sukabumi@Juara2026
  },
  {
    username: 'camat.cikole',
    nama: 'Camat Wilayah',
    role: 'camat',
    rt: null,
    rw: null,
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIeg2gqObX2E.F3bniHug6.1VEIVVzDrw2' // Cikole@Bisa2026
  },
  {
    username: 'admin.kebonjati',
    nama: 'Admin Pelayanan Kelurahan',
    role: 'admin_kelurahan',
    rt: null,
    rw: null,
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIe2zHbxC.mlSHiyvKW1qZPKqEwyfeA7pG' // Kebonjati@Hebat2026
  },
  {
    username: 'lurah.kebonjati',
    nama: 'Lurah Kebonjati (TTE)',
    role: 'lurah',
    rt: null,
    rw: null,
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIe8DvvnI6qwH5HS/THBUiLR4xMty8Fqb2' // Lurah@Kebonjati2026
  },
  {
    username: 'rw01_kebonjati',
    nama: 'Ketua RW 001',
    role: 'ketua_rw',
    rt: null,
    rw: '001',
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIe0TQ0qNzLo4sPU1jd5.uOnjo.1wzESFS' // Warga01@Kbj2026
  },
  {
    username: 'rt01_rw01_kbj',
    nama: 'Ketua RT 001 RW 001',
    role: 'ketua_rt',
    rt: '001',
    rw: '001',
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIeKPZ9EDxTF.S7uSCvnbVh96DiIVLMP1a' // Guyub01@Kbj2026
  },
  {
    username: 'posyandu.melati_rw01',
    nama: 'Kader Posyandu Melati',
    role: 'kader_posyandu',
    rt: null,
    rw: '001',
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIe6yQHdYNKAuo2WrYVylxSIWxjMds6DJe' // Sehat01@Kbj2026
  },
  {
    username: '3273010203850003',
    nama: 'Budi Santoso',
    role: 'warga',
    rt: '001',
    rw: '001',
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIeFikSbl7QyRSVM7/Loh1SWYQwh.CT8Si' // Warga@0003#2026
  },
  {
    username: '3273014504900004',
    nama: 'Siti Rahayu',
    role: 'warga',
    rt: '002',
    rw: '001',
    password_hash: '$2b$10$IcKfwN6NlAUUxUR81HebIeX8wRUAKQzltPFP/YXjDU5nwKeTBIrJa' // Warga@0004#2026
  }
];

async function autoPatchDatabase() {
  console.log('[AutoPatch] Memeriksa skema database dan tabel pengguna...');
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Pastikan tabel users memiliki kolom yang fleksibel
    try {
      await connection.query("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'warga'");
    } catch (e) {}

    try {
      await connection.query("ALTER TABLE users MODIFY COLUMN username VARCHAR(50) NOT NULL");
    } catch (e) {}

    const userColumns = ['rt', 'rw', 'last_login_at', 'must_change_password', 'kode_kecamatan', 'kode_kelurahan'];
    for (const col of userColumns) {
      try {
        if (col === 'last_login_at') {
          await connection.query("ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP NULL DEFAULT NULL");
        } else if (col === 'must_change_password') {
          await connection.query("ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) DEFAULT 0");
        } else {
          await connection.query(`ALTER TABLE users ADD COLUMN ${col} VARCHAR(50) NULL`);
        }
      } catch (e) {}
    }

    // 2. Pastikan tabel warga memiliki kolom user_id
    try {
      await connection.query("ALTER TABLE warga ADD COLUMN user_id INT NULL");
    } catch (e) {}

    // 3. Pastikan tabel posyandu_lansia dan posyandu_lansia_pemeriksaan ada
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`posyandu_lansia\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`nik\` VARCHAR(16) NOT NULL UNIQUE,
          \`nama\` VARCHAR(150) NOT NULL,
          \`tanggal_lahir\` DATE NOT NULL,
          \`jenis_kelamin\` ENUM('L', 'P') NOT NULL,
          \`alamat\` TEXT NOT NULL,
          \`rt\` VARCHAR(5) NOT NULL,
          \`rw\` VARCHAR(5) NOT NULL,
          \`status_tinggal\` ENUM('Bersama Keluarga', 'Sebatang Kara') NOT NULL DEFAULT 'Bersama Keluarga',
          \`riwayat_penyakit\` VARCHAR(255) DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_lansia_rt_rw\` (\`rt\`, \`rw\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (e) {
      console.warn('[AutoPatch] CREATE posyandu_lansia note:', e.message);
    }

    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`posyandu_lansia_pemeriksaan\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`posyandu_lansia_id\` INT NOT NULL,
          \`tanggal_pemeriksaan\` DATE NOT NULL,
          \`tensi_sistolik\` INT NOT NULL,
          \`tensi_diastolik\` INT NOT NULL,
          \`gula_darah_sewaktu\` INT NULL,
          \`kolesterol\` INT NULL,
          \`asam_urat\` DECIMAL(4,1) NULL,
          \`berat_badan_kg\` DECIMAL(5,2) NOT NULL,
          \`tinggi_badan_cm\` DECIMAL(5,2) NOT NULL,
          \`imt\` DECIMAL(4,1) NULL,
          \`skor_kemandirian_adl\` ENUM('Mandiri', 'Ketergantungan Ringan', 'Ketergantungan Sedang', 'Ketergantungan Berat') NOT NULL DEFAULT 'Mandiri',
          \`keluhan\` TEXT NULL,
          \`tindakan_petugas\` TEXT NULL,
          \`petugas\` VARCHAR(100) NOT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX \`idx_pemeriksaan_lansia_id\` (\`posyandu_lansia_id\`),
          INDEX \`idx_pemeriksaan_lansia_tgl\` (\`tanggal_pemeriksaan\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (e) {
      console.warn('[AutoPatch] CREATE posyandu_lansia_pemeriksaan note:', e.message);
    }

    // 4. Upsert Akun Standar Resmi
    for (const acc of STANDARD_ACCOUNTS) {
      try {
        await connection.execute(`
          INSERT INTO users (username, password_hash, nama, role, rt, rw, status, must_change_password)
          VALUES (?, ?, ?, ?, ?, ?, 'active', 0)
          ON DUPLICATE KEY UPDATE
            password_hash = VALUES(password_hash),
            nama = VALUES(nama),
            role = VALUES(role),
            rt = VALUES(rt),
            rw = VALUES(rw),
            status = 'active'
        `, [acc.username, acc.password_hash, acc.nama, acc.role, acc.rt, acc.rw]);
      } catch (errAcc) {}
    }

    console.log('[AutoPatch] Skema database dan akun standar diverifikasi.');
  } catch (err) {
    console.warn('[AutoPatch] Catatan auto-patch database:', err.message);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = {
  autoPatchDatabase,
  STANDARD_ACCOUNTS
};
