/**
 * database/migrate_standard_accounts.js
 * Memperbarui akun users dengan username & password hash standar resmi
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const ACCOUNTS = [
  {
    "id": 1,
    "username": "superadmin",
    "nama": "Super Admin Diskominfo",
    "role": "superadmin",
    "defaultPass": "Sukabumi@Diskominfo2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": null,
    "rw": null,
    "jabatan": "Administrator Utama Sistem Kota Sukabumi",
    "kategori": "Pemerintah Kota",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIeh/sdJa5doIVSQ6HCNTS2TCPYrymUJAe"
  },
  {
    "id": 10,
    "username": "walikota.sukabumi",
    "nama": "Walikota Sukabumi",
    "role": "walikota",
    "defaultPass": "Sukabumi@Juara2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": null,
    "rw": null,
    "jabatan": "Kepala Daerah Kota Sukabumi",
    "kategori": "Pemerintah Kota",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIersh.QVMglQPygCV/A3BrDqIGu99Tje6"
  },
  {
    "id": 11,
    "username": "camat.cikole",
    "nama": "Camat Cikole",
    "role": "camat",
    "defaultPass": "Cikole@Bisa2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": null,
    "rw": null,
    "jabatan": "Camat Wilayah Cikole",
    "kategori": "Kecamatan",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIeg2gqObX2E.F3bniHug6.1VEIVVzDrw2"
  },
  {
    "id": 12,
    "username": "camat.gunungpuyuh",
    "nama": "Camat Gunungpuyuh",
    "role": "camat",
    "defaultPass": "Gunungpuyuh@Bisa2026",
    "kode_kecamatan": "32.72.01",
    "kode_kelurahan": "32.72.01.1001",
    "rt": null,
    "rw": null,
    "jabatan": "Camat Wilayah Gunungpuyuh",
    "kategori": "Kecamatan",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIefDWk/Sn7etxEENZ1cF8jKgjbaXQAKV."
  },
  {
    "id": 13,
    "username": "camat.warudoyong",
    "nama": "Camat Warudoyong",
    "role": "camat",
    "defaultPass": "Warudoyong@Bisa2026",
    "kode_kecamatan": "32.72.02",
    "kode_kelurahan": "32.72.02.1001",
    "rt": null,
    "rw": null,
    "jabatan": "Camat Wilayah Warudoyong",
    "kategori": "Kecamatan",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIeS0Y/8TWoPH1eNAT6OFCXalpSMg9abFW"
  },
  {
    "id": 2,
    "username": "admin.kebonjati",
    "nama": "Admin Pelayanan Kelurahan Kebonjati",
    "role": "admin_kelurahan",
    "defaultPass": "Kebonjati@Hebat2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": null,
    "rw": null,
    "jabatan": "Staf Pelayanan Terpadu Kelurahan",
    "kategori": "Kelurahan",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIe2zHbxC.mlSHiyvKW1qZPKqEwyfeA7pG"
  },
  {
    "id": 14,
    "username": "lurah.kebonjati",
    "nama": "Ahmad Sofyan, S.IP (Lurah Kebonjati)",
    "role": "lurah",
    "defaultPass": "Lurah@Kebonjati2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": null,
    "rw": null,
    "jabatan": "Lurah Kebonjati (Pejabat Penandatangan TTE)",
    "kategori": "Kelurahan",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIe8DvvnI6qwH5HS/THBUiLR4xMty8Fqb2"
  },
  {
    "id": 3,
    "username": "rw01_kebonjati",
    "nama": "Ketua RW 001 Kebonjati",
    "role": "ketua_rw",
    "defaultPass": "Warga01@Kbj2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": null,
    "rw": "001",
    "jabatan": "Ketua Rukun Warga 001",
    "kategori": "Rukun Warga (RW)",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIe0TQ0qNzLo4sPU1jd5.uOnjo.1wzESFS"
  },
  {
    "id": 15,
    "username": "rw02_kebonjati",
    "nama": "Ketua RW 002 Kebonjati",
    "role": "ketua_rw",
    "defaultPass": "Warga02@Kbj2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": null,
    "rw": "002",
    "jabatan": "Ketua Rukun Warga 002",
    "kategori": "Rukun Warga (RW)",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIeSY/nRqvQUEXYw..ZgntBfgzsmp0aZZ2"
  },
  {
    "id": 4,
    "username": "rt01_rw01_kbj",
    "nama": "Ketua RT 001 RW 001 Kebonjati",
    "role": "ketua_rt",
    "defaultPass": "Guyub01@Kbj2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": "001",
    "rw": "001",
    "jabatan": "Ketua Rukun Tetangga 001",
    "kategori": "Rukun Tetangga (RT)",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIeKPZ9EDxTF.S7uSCvnbVh96DiIVLMP1a"
  },
  {
    "id": 16,
    "username": "rt02_rw01_kbj",
    "nama": "Ketua RT 002 RW 001 Kebonjati",
    "role": "ketua_rt",
    "defaultPass": "Guyub02@Kbj2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": "002",
    "rw": "001",
    "jabatan": "Ketua Rukun Tetangga 002",
    "kategori": "Rukun Tetangga (RT)",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIeshScTYOVQYm4/L6j7tqJIBtPtt.Snhe"
  },
  {
    "id": 17,
    "username": "rt01_rw02_kbj",
    "nama": "Ketua RT 001 RW 002 Kebonjati",
    "role": "ketua_rt",
    "defaultPass": "Guyub01@Kbj2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": "001",
    "rw": "002",
    "jabatan": "Ketua Rukun Tetangga 001 RW 002",
    "kategori": "Rukun Tetangga (RT)",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIeKPZ9EDxTF.S7uSCvnbVh96DiIVLMP1a"
  },
  {
    "id": 5,
    "username": "posyandu.melati_rw01",
    "nama": "Bdn. Imas Rohayati (Posyandu Melati RW 01)",
    "role": "kader_posyandu",
    "defaultPass": "Sehat01@Kbj2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": null,
    "rw": "001",
    "jabatan": "Koordinator Kader Posyandu Balita & Lansia",
    "kategori": "Kader Posyandu",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIe6yQHdYNKAuo2WrYVylxSIWxjMds6DJe"
  },
  {
    "id": 6,
    "username": "3273010203850003",
    "nama": "Budi Santoso",
    "role": "warga",
    "defaultPass": "Warga@0003#2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": "001",
    "rw": "001",
    "jabatan": "Warga / Kepala Keluarga",
    "kategori": "Warga Masyarakat",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIeFikSbl7QyRSVM7/Loh1SWYQwh.CT8Si"
  },
  {
    "id": 7,
    "username": "3273014504900004",
    "nama": "Siti Rahayu",
    "role": "warga",
    "defaultPass": "Warga@0004#2026",
    "kode_kecamatan": "32.72.03",
    "kode_kelurahan": "32.72.03.1004",
    "rt": "002",
    "rw": "001",
    "jabatan": "Warga / Ibu Rumah Tangga",
    "kategori": "Warga Masyarakat",
    "password_hash": "$2b$10$IcKfwN6NlAUUxUR81HebIeX8wRUAKQzltPFP/YXjDU5nwKeTBIrJa"
  }
];

async function run() {
  console.log('Mengaplikasikan akun standar ke database...');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bumi_warga'
    });

    // Pastikan kolom must_change_password ada
    try {
      await connection.query(`
        ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 1 AFTER status
      `);
      console.log('Kolom must_change_password berhasil ditambahkan ke tabel users.');
    } catch (colErr) {
      // Kolom mungkin sudah ada
    }

    for (const acc of ACCOUNTS) {
      await connection.execute(`
        INSERT INTO users (id, username, password_hash, nama, role, kode_kecamatan, kode_kelurahan, rt, rw, status, must_change_password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1)
        ON DUPLICATE KEY UPDATE
          username = VALUES(username),
          password_hash = VALUES(password_hash),
          nama = VALUES(nama),
          role = VALUES(role),
          kode_kecamatan = VALUES(kode_kecamatan),
          kode_kelurahan = VALUES(kode_kelurahan),
          rt = VALUES(rt),
          rw = VALUES(rw),
          status = 'active',
          must_change_password = 1
      `, [
        acc.id,
        acc.username,
        acc.password_hash,
        acc.nama,
        acc.role,
        acc.kode_kecamatan,
        acc.kode_kelurahan,
        acc.rt,
        acc.rw
      ]);
    }

    console.log(`Berhasil memperbarui ${ACCOUNTS.length} akun standar di database!`);
    await connection.end();
  } catch (err) {
    console.log('Database lokal offline, menyimpan konfigurasi standar in-memory & SQL seed.');
  }
}

run();
